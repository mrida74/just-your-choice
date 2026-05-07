import { NextRequest, NextResponse } from "next/server";
import { checkPermission, forbiddenResponse, unauthorizedResponse, verifyAdminAuth } from "@/lib/admin-auth";
import { getReviewsForModeration } from "@/lib/review-service";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminAuth(request);
  if (!auth.authenticated) return unauthorizedResponse(auth.error);
  if (!checkPermission(auth.admin, "moderate_reviews")) return forbiddenResponse();

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as any;
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 500);
    const skip = parseInt(searchParams.get("skip") || "0");

    const reviews = await getReviewsForModeration({ status, limit, skip });
    return NextResponse.json({ reviews });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch reviews.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
