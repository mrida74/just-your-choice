import { NextRequest, NextResponse } from "next/server";
import { acceptAdminInvitation, logAdminAction } from "@/lib/user-service";
import { validatePasswordStrength } from "@/lib/auth-utils";
import { isValidPhone } from "@/lib/auth-utils";

interface AcceptInvitationRequest {
  invitationToken: string;
  password: string;
  name: string;
  phone: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: AcceptInvitationRequest = await request.json();

    // Validate input
    if (!body.invitationToken || !body.password || !body.name || !body.phone) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(body.password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Password does not meet requirements",
          errors: passwordValidation.errors,
        },
        { status: 400 }
      );
    }

    // Validate name
    if (body.name.trim().length < 2) {
      return NextResponse.json(
        { success: false, message: "Name must be at least 2 characters" },
        { status: 400 }
      );
    }

    // Validate phone
    if (!isValidPhone(body.phone)) {
      return NextResponse.json(
        { success: false, message: "Invalid phone number" },
        { status: 400 }
      );
    }

    // Accept invitation
    const result = await acceptAdminInvitation(body.invitationToken, {
      password: body.password,
      name: body.name,
      phone: body.phone,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    // Log account creation
    await logAdminAction({
      adminId: result.admin._id.toString(),
      adminEmail: result.admin.email,
      action: "account_created",
      resource: "admin",
      resourceId: result.admin._id.toString(),
      description: `Account created via invitation - role: ${result.admin.role}`,
      status: "success",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully. Please set up MFA.",
        admin: {
          id: result.admin._id.toString(),
          email: result.admin.email,
          name: result.admin.name,
          role: result.admin.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create account",
        error: process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * GET - Verify invitation token is valid
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { valid: false, message: "Token required" },
        { status: 400 }
      );
    }

    // Verify token with Invitation model
    const { Invitation } = await import("@/lib/models/Invitation");
    const { hashToken } = await import("@/lib/auth-utils");

    const hashedToken = hashToken(token);
    const invitation = await Invitation.findOne({
      invitationToken: hashedToken,
      status: "pending",
      tokenExpiresAt: { $gt: new Date() },
    });

    if (!invitation) {
      return NextResponse.json(
        {
          valid: false,
          message: "Invalid or expired invitation",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        valid: true,
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.tokenExpiresAt,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error verifying invitation:", error);
    return NextResponse.json(
      { valid: false, message: "Verification failed" },
      { status: 500 }
    );
  }
}
