import { NextRequest, NextResponse } from "next/server";
import { verifyTOTPCode, generateSessionToken, verifyBackupCode } from "@/lib/auth-utils";
import { rateLimitMFA } from "@/lib/rate-limiter";
import { Admin } from "@/lib/models/Admin";
import { logAdminAction } from "@/lib/user-service";
import { hashSessionToken } from "@/lib/auth-utils";

interface MFAVerifyRequest {
  adminId: string;
  email: string;
  code: string; // TOTP or backup code
}

export async function POST(request: NextRequest) {
  try {
    const body: MFAVerifyRequest = await request.json();

    // Rate limit MFA attempts
    const rateLimit = rateLimitMFA(request, body.adminId);
    if (rateLimit.limited) {
      return rateLimit.response;
    }

    // Validate input
    if (!body.adminId || !body.email || !body.code) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find admin
    const admin = await Admin.findById(body.adminId);

    if (!admin || admin.email !== body.email.toLowerCase()) {
      return NextResponse.json(
        { success: false, message: "Invalid admin" },
        { status: 401 }
      );
    }

    // Find enabled MFA factor
    const mfaFactor = admin.mfa_factors?.find((factor: any) => factor.enabled);

    if (!mfaFactor) {
      return NextResponse.json(
        { success: false, message: "MFA not configured" },
        { status: 400 }
      );
    }

    let verified = false;

    if (mfaFactor.type === "totp") {
      // Verify TOTP code
      verified = verifyTOTPCode(mfaFactor.secret, body.code);
    } else if (mfaFactor.type === "passkey") {
      // Passkey verification would be handled differently
      // This is simplified - in production use WebAuthn library
      verified = body.code === mfaFactor.credentialId;
    }

    if (!verified) {
      // Log failed MFA attempt
      await logAdminAction({
        adminId: admin._id.toString(),
        adminEmail: admin.email,
        action: "mfa_failed",
        resource: "auth",
        ipAddress:
          request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
        userAgent: request.headers.get("user-agent") || undefined,
        status: "failed",
        errorMessage: "Invalid MFA code",
      });

      return NextResponse.json(
        { success: false, message: "Invalid MFA code" },
        { status: 401 }
      );
    }

    // Create session
    const token = generateSessionToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Update admin
    admin.last_login = new Date();
    admin.failed_login_attempts = 0;
    admin.admin_session_token_hash = hashSessionToken(token);
    admin.admin_session_expires_at = expiresAt;
    await admin.save();

    // Log successful MFA
    await logAdminAction({
      adminId: admin._id.toString(),
      adminEmail: admin.email,
      action: "login_success",
      resource: "auth",
      description: "Login completed with MFA",
      ipAddress:
        request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
      userAgent: request.headers.get("user-agent") || undefined,
      status: "success",
    });

    const response = NextResponse.json(
      {
        success: true,
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
      maxAge: 24 * 60 * 60,
      path: "/admin",
    });

    return response;
  } catch (error) {
    console.error("MFA verification error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "MFA verification failed",
        error: process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
