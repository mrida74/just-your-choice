import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { submitReview, getProductReviews, getProductReviewStats, voteReviewHelpful } from "@/lib/review-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const session = await getServerSession(authOptions);

    const payload = {
      productId: body.productId,
      userId: session?.user?.id,
      guestEmail: !session ? body.guestEmail : undefined,
      guestName: !session ? body.guestName : undefined,
      rating: body.rating,
      title: body.title,
      content: body.content,
    };

    const review = await submitReview(payload);
    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to submit review.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const skip = parseInt(searchParams.get("skip") || "0");

    const [reviews, stats] = await Promise.all([
      getProductReviews({ productId, limit, skip }),
      getProductReviewStats(productId),
    ]);

    return NextResponse.json({ reviews, stats });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch reviews.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
