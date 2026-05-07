import { NextRequest, NextResponse } from "next/server";
import { checkPermission, forbiddenResponse, unauthorizedResponse, verifyAdminAuth } from "@/lib/admin-auth";
import { moderateReview, toggleFeaturedReview, deleteReview } from "@/lib/review-service";

export async function PUT(request: NextRequest, context: any) {
  const params = context?.params ?? {};
  const auth = await verifyAdminAuth(request);
  if (!auth.authenticated) return unauthorizedResponse(auth.error);
  if (!checkPermission(auth.admin, "moderate_reviews")) return forbiddenResponse();

  try {
    const body = await request.json();
    const updated = await moderateReview(params.id, body, auth.admin._id.toString());
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ review: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to moderate review.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: any) {
  const params = context?.params ?? {};
  const auth = await verifyAdminAuth(request);
  if (!auth.authenticated) return unauthorizedResponse(auth.error);
  if (!checkPermission(auth.admin, "moderate_reviews")) return forbiddenResponse();

  try {
    const body = await request.json();
    
    // Toggle featured
    if (body.action === "toggle_featured") {
      const updated = await toggleFeaturedReview(params.id);
      if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({ review: updated });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update review.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: any) {
  const params = context?.params ?? {};
  const auth = await verifyAdminAuth(request);
  if (!auth.authenticated) return unauthorizedResponse(auth.error);
  if (!checkPermission(auth.admin, "moderate_reviews")) return forbiddenResponse();

  try {
    const ok = await deleteReview(params.id);
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete review.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
