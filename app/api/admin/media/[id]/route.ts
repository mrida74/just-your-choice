import { NextRequest, NextResponse } from "next/server";
import { checkPermission, forbiddenResponse, unauthorizedResponse, verifyAdminAuth } from "@/lib/admin-auth";
import { getMediaById, updateMedia, deleteMedia } from "@/lib/media-service";

export async function GET(request: NextRequest, context: any) {
  const params = context?.params ?? {};
  const auth = await verifyAdminAuth(request);
  if (!auth.authenticated) return unauthorizedResponse(auth.error);
  if (!checkPermission(auth.admin, "upload_media")) return forbiddenResponse();

  try {
    const media = await getMediaById(params.id);
    if (!media) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ media });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch media.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: any) {
  const params = context?.params ?? {};
  const auth = await verifyAdminAuth(request);
  if (!auth.authenticated) return unauthorizedResponse(auth.error);
  if (!checkPermission(auth.admin, "upload_media")) return forbiddenResponse();

  try {
    const body = await request.json();
    const updated = await updateMedia(params.id, body);
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ media: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update media.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: any) {
  const params = context?.params ?? {};
  const auth = await verifyAdminAuth(request);
  if (!auth.authenticated) return unauthorizedResponse(auth.error);
  if (!checkPermission(auth.admin, "delete_media")) return forbiddenResponse();

  try {
    const ok = await deleteMedia(params.id);
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete media.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
