import { NextRequest, NextResponse } from "next/server";

import { checkPermission, forbiddenResponse, unauthorizedResponse, verifyAdminAuth } from "@/lib/admin-auth";
import { createCoupon, getCoupons } from "@/lib/coupon-service";
import { parse } from "url";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminAuth(request);
  if (!auth.authenticated) return unauthorizedResponse(auth.error);
  if (!checkPermission(auth.admin, "view_coupons")) return forbiddenResponse();

  try {
    const coupons = await getCoupons();
    return NextResponse.json({ coupons });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch coupons.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminAuth(request);
  if (!auth.authenticated) return unauthorizedResponse(auth.error);
  if (!checkPermission(auth.admin, "manage_coupons")) return forbiddenResponse();

  try {
    const body = await request.json();
    // Minimal payload validation; coupon-service will enforce types
    const coupon = await createCoupon(body);
    return NextResponse.json({ coupon }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create coupon.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
