import { NextRequest, NextResponse } from "next/server";
import { verifyAdminPassword, logAdminAction, getAdminWithPermissions } from "@/lib/user-service";
import { generateSessionToken, validatePasswordStrength } from "@/lib/auth-utils";
import { rateLimitLogin } from "@/lib/rate-limiter";
import { Admin } from "@/lib/models/Admin";
import { hashSessionToken } from "@/lib/auth-utils";
import crypto from "crypto";

interface AdminLoginRequest {
  email: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimit = rateLimitLogin(request);
    if (rateLimit.limited) {
      return rateLimit.response;
    }

    const body: AdminLoginRequest = await request.json();

    // Validate input
    if (!body.email || !body.password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Verify password
    const { valid, admin } = await verifyAdminPassword(body.email, body.password);

    if (!valid || !admin) {
      // Log failed attempt
      try {
        await logAdminAction({
          adminId: "unknown",
          adminEmail: body.email,
          action: "login_failed",
          resource: "auth",
          ipAddress:
            request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
          userAgent: request.headers.get("user-agent") || undefined,
          status: "failed",
          errorMessage: "Invalid credentials",
        });
      } catch (logError) {
        console.error("Error logging failed login:", logError);
      }

      // Rate limiting: increment failed attempts
      if (admin) {
        admin.failed_login_attempts = (admin.failed_login_attempts || 0) + 1;
        admin.last_failed_login = new Date();

        // Lock account after 5 failed attempts
        if (admin.failed_login_attempts >= 5) {
          admin.account_status = "disabled";
          await admin.save();
          return NextResponse.json(
            {
              success: false,
              message: "Account has been disabled due to too many failed login attempts",
            },
            { status: 403 }
          );
        }

        await admin.save();
      }

      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check account status
    if (admin.account_status !== "active") {
      return NextResponse.json(
        {
          success: false,
          message: `Account is ${admin.account_status}`,
        },
        { status: 403 }
      );
    }

    // Check if MFA is enabled
    const mfaEnabled = admin.mfa_factors?.some((factor: any) => factor.enabled);

    if (mfaEnabled) {
      // Generate temporary session for MFA verification
      const sessionId = crypto.randomBytes(32).toString("hex");

      // In production you'd persist the sessionId -> admin mapping in Redis
      // For now return admin id/email so the client can continue MFA flow

      return NextResponse.json(
        {
          success: true,
          requiresMFA: true,
          sessionId,
          admin: { id: admin._id.toString(), email: admin.email },
          message: "MFA verification required",
        },
        { status: 200 }
      );
    } else {
      // No MFA required - create session directly
      const token = generateSessionToken();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      // Reset failed login attempts
      admin.failed_login_attempts = 0;
      admin.last_login = new Date();
      admin.admin_session_token_hash = hashSessionToken(token);
      admin.admin_session_expires_at = expiresAt;
      await admin.save();

      // Log successful login
      await logAdminAction({
        adminId: admin._id.toString(),
        adminEmail: admin.email,
        action: "login_success",
        resource: "auth",
        ipAddress:
          request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
        userAgent: request.headers.get("user-agent") || undefined,
        status: "success",
      });

      const response = NextResponse.json(
        {
          success: true,
          requiresMFA: false,
          token,
          expiresAt,
          admin: {
            id: admin._id.toString(),
            email: admin.email,
            name: admin.name,
            role: admin.role,
            permissions: admin.permissions,
          },
        },
        { status: 200 }
      );

      // Set secure httpOnly cookie
      response.cookies.set("admin_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60, // 24 hours
        path: "/admin",
      });

      return response;
    }
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Login failed. Please try again.",
        error: process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
