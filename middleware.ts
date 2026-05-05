import { NextRequest, NextResponse } from "next/server";
import { getAdminWithPermissions, hasPermission } from "@/lib/user-service";

/**
 * Admin authentication middleware
 * Protects /admin routes
 */
export async function middleware(request: NextRequest) {
  // Compute pathname defensively. Some runtime contexts may not provide nextUrl or a full request.url.
  let pathname: string = "";
  try {
    if (request.nextUrl && typeof request.nextUrl.pathname === "string") {
      pathname = request.nextUrl.pathname;
    } else if (typeof request.url === "string") {
      pathname = new URL(request.url).pathname;
    }
  } catch (e) {
    // Fallback to empty string; middleware will treat as non-matching
    pathname = "";
  }

  // Allow public admin auth routes
  if (pathname && (pathname.startsWith("/api/admin/auth/signin") ||
      pathname.startsWith("/api/admin/invitations/accept") ||
      pathname.startsWith("/api/admin/invitations/send") ||
      pathname.startsWith("/api/admin/auth/totp") ||
      pathname.startsWith("/api/admin/auth/mfa"))) {
    return NextResponse.next();
  }

  // Allow admin UI public pages (login, invitation acceptance)
  if (pathname && (pathname === "/admin/login" || pathname.startsWith("/admin/invitation") || pathname === "/admin/invitations/accept")) {
    return NextResponse.next();
  }

  // Protect admin panel routes
  if (pathname.startsWith("/admin")) {
    // For UI routes, require session/cookie
    const adminToken = request.cookies.get("admin_token")?.value;

    if (!adminToken) {
      // Redirect to admin login
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    return NextResponse.next();
  }

  // Protect admin API routes (except auth)
  if (pathname.startsWith("/api/admin")) {
    const adminToken = request.cookies.get("admin_token")?.value;

    if (!adminToken) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
