import { NextRequest, NextResponse } from "next/server";
import { validateAndApplyCoupon } from "@/lib/coupon-service";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { couponCode, cartTotal } = body;

    if (!couponCode) {
      return NextResponse.json({ valid: false, error: "Coupon code required" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    // Get guest email if provided
    const guestEmail = body.guestEmail;

    // Validate coupon without applying yet
    const result = await validateAndApplyCoupon({
      code: couponCode,
      userId,
      guestEmail,
      cartTotal,
      apply: false, // don't increment usage yet
    });

    if (!result.valid) {
      return NextResponse.json(
        {
          valid: false,
          error: getReasonMessage(result.reason || "Invalid coupon"),
          reason: result.reason,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      discount: result.discount,
      coupon: result.coupon,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Coupon validation failed";
    return NextResponse.json({ valid: false, error: message }, { status: 500 });
  }
}

function getReasonMessage(reason: string): string {
  const messages: Record<string, string> = {
    not_found: "Coupon code not found.",
    inactive: "This coupon is no longer active.",
    not_started: "This coupon is not yet valid.",
    expired: "This coupon has expired.",
    usage_limit_reached: "This coupon has reached its usage limit.",
    customer_limit_reached: "You have already used this coupon the maximum number of times.",
  };
  return messages[reason] || "Invalid coupon.";
}
