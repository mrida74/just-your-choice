import { NextRequest, NextResponse } from "next/server";
import { Admin } from "@/lib/models/Admin";
import { logAdminAction } from "@/lib/user-service";

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

    // In production, you'd verify JWT here
    // For now, this is simplified
    // You should implement proper JWT verification

    return {
      authenticated: true,
      token: adminToken,
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
    create_product: "canManageProducts",
    update_product: "canManageProducts",
    delete_product: "canManageProducts",
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
    // This is where you'd decode JWT and extract admin info
    // For now, returning null - implement with proper JWT verification
    return null;
  } catch (error) {
    console.error("Error extracting admin from token:", error);
    return null;
  }
}
