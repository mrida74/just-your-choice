import { NextRequest, NextResponse } from "next/server";

import { logAdminAction } from "@/lib/user-service";
import { connectToDatabase } from "@/lib/mongodb";
import { Admin } from "@/lib/models/Admin";
import { hashSessionToken } from "@/lib/auth-utils";

export async function POST(request: NextRequest) {
  try {
    const adminToken = request.cookies.get("admin_token")?.value;

    if (adminToken) {
      try {
        await connectToDatabase();
        await Admin.updateOne(
          { admin_session_token_hash: hashSessionToken(adminToken) },
          {
            $unset: {
              admin_session_token_hash: "",
              admin_session_expires_at: "",
            },
          }
        );
      } catch (sessionError) {
        console.error("Error clearing admin session:", sessionError);
      }
    }

    const response = NextResponse.json(
      { success: true, message: "Signed out successfully" },
      { status: 200 }
    );

    response.cookies.set("admin_token", "", {
      httpOnly: true,
      maxAge: 0,
      path: "/admin",
    });

    try {
      const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
      await logAdminAction({
        adminId: "unknown",
        adminEmail: "unknown",
        action: "logout",
        resource: "auth",
        ipAddress,
        userAgent: request.headers.get("user-agent") || undefined,
        status: "success",
      });
    } catch (logError) {
      console.error("Error logging logout:", logError);
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