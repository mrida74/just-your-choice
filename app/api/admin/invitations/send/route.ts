import { NextRequest, NextResponse } from "next/server";
import { sendAdminInvitation, logAdminAction } from "@/lib/user-service";
import { isValidEmail } from "@/lib/auth-utils";

interface SendInvitationRequest {
  email: string;
  role: "admin" | "manager";
  adminId: string;
  adminEmail: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SendInvitationRequest = await request.json();

    // Validate input
    if (!body.email || !body.role || !body.adminId) {
      return NextResponse.json(
        { success: false, message: "Email, role, and adminId are required" },
        { status: 400 }
      );
    }

    if (!isValidEmail(body.email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email address" },
        { status: 400 }
      );
    }

    if (!["admin", "manager"].includes(body.role)) {
      return NextResponse.json(
        { success: false, message: "Role must be 'admin' or 'manager'" },
        { status: 400 }
      );
    }

    // Send invitation
    const result = await sendAdminInvitation(body.email, body.role, body.adminId);

    if (!result.success) {
      // Log failed invitation attempt
      await logAdminAction({
        adminId: body.adminId,
        adminEmail: body.adminEmail,
        action: "invitation_failed",
        resource: "admin",
        resourceId: body.email,
        description: result.message,
        status: "failed",
        errorMessage: result.message,
      });

      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    // Log successful invitation
    await logAdminAction({
      adminId: body.adminId,
      adminEmail: body.adminEmail,
      action: "create_admin",
      resource: "admin",
      resourceId: body.email,
      description: `Invitation sent to ${body.email} for role: ${body.role}`,
      status: "success",
    });

    // In production, send email with invitation link
    // For now, we'll return the token for demonstration
    const invitationUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/admin/invitation/${result.token}`;

    return NextResponse.json(
      {
        success: true,
        message: `Invitation sent to ${body.email}`,
        invitationUrl, // In production, this would be sent via email, not returned
        expiresAt: result.expiresAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error sending invitation:", error);

    // Try to log the error
    const body = await request.json().catch(() => ({}));
    try {
      await logAdminAction({
        adminId: body.adminId || "unknown",
        adminEmail: body.adminEmail || "unknown",
        action: "invitation_error",
        resource: "admin",
        status: "failed",
        errorMessage: String(error),
      });
    } catch (logError) {
      console.error("Error logging invitation error:", logError);
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to send invitation",
        error: process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
