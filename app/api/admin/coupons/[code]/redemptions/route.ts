import { NextRequest, NextResponse } from "next/server";
import { checkPermission, forbiddenResponse, unauthorizedResponse, verifyAdminAuth } from "@/lib/admin-auth";
import { getCouponRedemptions, getCouponRedemptionStats } from "@/lib/coupon-redemption-service";

export async function GET(request: NextRequest, context: any) {
  const params = context?.params ?? {};
  const auth = await verifyAdminAuth(request);
  if (!auth.authenticated) return unauthorizedResponse(auth.error);
  if (!checkPermission(auth.admin, "view_coupons")) return forbiddenResponse();

  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "100"), 1000);
    const skip = parseInt(searchParams.get("skip") || "0");

    const [redemptions, stats] = await Promise.all([
      getCouponRedemptions({ couponCode: params.code, limit, skip }),
      getCouponRedemptionStats(params.code),
    ]);

    return NextResponse.json({ redemptions, stats });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch redemption data.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
