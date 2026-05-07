import { NextRequest, NextResponse } from "next/server";
import { voteReviewHelpful } from "@/lib/review-service";

export async function POST(request: NextRequest, context: any) {
  try {
    const params = context?.params ?? {};
    const body = await request.json();

    const updated = await voteReviewHelpful(params.reviewId, body.helpful === true);
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ review: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to vote.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
