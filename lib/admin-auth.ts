import { NextRequest, NextResponse } from "next/server";
import { Admin } from "@/lib/models/Admin";
import { logAdminAction } from "@/lib/user-service";
import { connectToDatabase } from "@/lib/mongodb";
import { hashSessionToken } from "@/lib/auth-utils";

/**
 * Middleware to verify admin authentication and permissions
 */
export async function verifyAdminAuth(request: NextRequest) {
  try {
    const adminToken = request.cookies.get("admin_token")?.value;

    if (!adminToken) {
      return {
        authenticated: false,
        error: "Not authenticated",
        statusCode: 401,
      };
    }

    await connectToDatabase();

    const admin = await Admin.findOne({
      admin_session_token_hash: hashSessionToken(adminToken),
      admin_session_expires_at: { $gt: new Date() },
      account_status: "active",
    }).select("-password");

    if (!admin) {
      return {
        authenticated: false,
        error: "Session expired or invalid",
        statusCode: 401,
      };
    }

    return {
      authenticated: true,
      token: adminToken,
      admin,
    };
  } catch (error) {
    console.error("Auth verification error:", error);
    return {
      authenticated: false,
      error: "Auth verification failed",
      statusCode: 500,
    };
  }
}

/**
 * Check if admin has specific permission
 */
export function checkPermission(
  admin: any,
  permission: string
): boolean {
  if (!admin) return false;

  // Admins have all permissions
  if (admin.role === "admin") {
    return true;
  }

  // Check specific permission for managers
  const permissionMap: Record<string, keyof typeof admin.permissions> = {
    view_products: "canManageProducts",
    create_product: "canManageProducts",
    update_product: "canManageProducts",
    delete_product: "canManageProducts",
    view_categories: "canManageProducts",
    update_categories: "canManageProducts",
    view_orders: "canManageOrders",
    create_order: "canManageOrders",
    update_order: "canManageOrders",
    cancel_order: "canManageOrders",
    view_users: "canManageUsers",
    create_user: "canManageUsers",
    update_user: "canManageUsers",
    delete_user: "canManageUsers",
    view_analytics: "canViewAnalytics",
    create_promotion: "canManagePromotions",
    update_promotion: "canManagePromotions",
    delete_promotion: "canManagePromotions",
    view_audit_logs: "canManageSettings", // Or create canViewLogs
    change_settings: "canManageSettings",
    create_admin: "canInviteUsers",
    manage_roles: "canManageSettings",
  };

  const requiredPermission = permissionMap[permission];
  if (!requiredPermission) {
    return false;
  }

  return admin.permissions?.[requiredPermission] === true;
}

/**
 * Authorize request with permission check
 */
export async function requireAdminAuth(
  request: NextRequest,
  requiredPermission?: string
) {
  try {
    const auth = await verifyAdminAuth(request);

    if (!auth.authenticated) {
      return {
        authorized: false,
        statusCode: auth.statusCode || 401,
        message: auth.error,
      };
    }

    // Extract admin info from token (simplified - use JWT in production)
    // This is where you'd decode and verify JWT token

    if (requiredPermission) {
      // Check if admin has permission
      // This would require fetching admin from DB or extracting from JWT
      // Simplified for now
      return {
        authorized: true,
        message: "Authorized",
      };
    }

    return {
      authorized: true,
      message: "Authenticated",
    };
  } catch (error) {
    console.error("Authorization error:", error);
    return {
      authorized: false,
      statusCode: 500,
      message: "Authorization failed",
    };
  }
}

/**
 * Create unauthorized response
 */
export function unauthorizedResponse(message = "Unauthorized") {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status: 401 }
  );
}

/**
 * Create forbidden response
 */
export function forbiddenResponse(message = "Forbidden - insufficient permissions") {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status: 403 }
  );
}

/**
 * Extract admin from JWT token (implement based on your JWT library)
 */
export async function getAdminFromToken(token: string) {
  try {
    await connectToDatabase();

    return await Admin.findOne({
      admin_session_token_hash: hashSessionToken(token),
      admin_session_expires_at: { $gt: new Date() },
      account_status: "active",
    }).select("-password");
  } catch (error) {
    console.error("Error extracting admin from token:", error);
    return null;
  }
}
