import { NextRequest, NextResponse } from "next/server";
import { logAdminAction } from "@/lib/user-service";

export async function POST(request: NextRequest) {
  try {
    // Get admin info from cookie/header for logging
    const adminToken = request.cookies.get("admin_token")?.value;

    const response = NextResponse.json(
      { success: true, message: "Signed out successfully" },
      { status: 200 }
    );

    // Clear admin token cookie
    response.cookies.set("admin_token", "", {
      httpOnly: true,
      maxAge: 0,
      path: "/admin",
    });

    // Try to log logout action
    try {
      const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
      // In production, you'd extract admin info from JWT token instead
      await logAdminAction({
        adminId: "unknown", // Would be extracted from token in production
        adminEmail: "unknown",
        action: "logout",
        resource: "auth",
        ipAddress,
        userAgent: request.headers.get("user-agent") || undefined,
        status: "success",
      });
    } catch (logError) {
      console.error("Error logging logout:", logError);
      // Don't fail the logout if logging fails
    }

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { success: false, message: "Logout failed" },
      { status: 500 }
    );
  }
}
