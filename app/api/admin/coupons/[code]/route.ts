import { NextRequest, NextResponse } from "next/server";

import { checkPermission, forbiddenResponse, unauthorizedResponse, verifyAdminAuth } from "@/lib/admin-auth";
import { getCouponByCode, updateCoupon, deleteCoupon } from "@/lib/coupon-service";

export async function GET(request: NextRequest, context: any) {
  const params = context?.params ?? {};
  const auth = await verifyAdminAuth(request);
  if (!auth.authenticated) return unauthorizedResponse(auth.error);
  if (!checkPermission(auth.admin, "view_coupons")) return forbiddenResponse();

  try {
    const coupon = await getCouponByCode(params.code);
    if (!coupon) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ coupon });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch coupon.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: any) {
  const params = context?.params ?? {};
  const auth = await verifyAdminAuth(request);
  if (!auth.authenticated) return unauthorizedResponse(auth.error);
  if (!checkPermission(auth.admin, "manage_coupons")) return forbiddenResponse();

  try {
    const body = await request.json();
    const updated = await updateCoupon(params.code, body);
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ coupon: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update coupon.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: any) {
  const params = context?.params ?? {};
  const auth = await verifyAdminAuth(request);
  if (!auth.authenticated) return unauthorizedResponse(auth.error);
  if (!checkPermission(auth.admin, "manage_coupons")) return forbiddenResponse();

  try {
    const ok = await deleteCoupon(params.code);
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete coupon.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
