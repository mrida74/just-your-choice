import { NextRequest, NextResponse } from "next/server";
import { checkPermission, forbiddenResponse, unauthorizedResponse, verifyAdminAuth } from "@/lib/admin-auth";
import { getRefundById, updateRefundStatus } from "@/lib/refund-service";

export async function GET(request: NextRequest, context: any) {
  const params = context?.params ?? {};
  const auth = await verifyAdminAuth(request);
  if (!auth.authenticated) return unauthorizedResponse(auth.error);
  if (!checkPermission(auth.admin, "refund_orders")) return forbiddenResponse();

  try {
    const refund = await getRefundById(params.id);
    if (!refund) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ refund });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch refund.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: any) {
  const params = context?.params ?? {};
  const auth = await verifyAdminAuth(request);
  if (!auth.authenticated) return unauthorizedResponse(auth.error);
  if (!checkPermission(auth.admin, "refund_orders")) return forbiddenResponse();

  try {
    const body = await request.json();
    const { status, notes } = body;

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    const updated = await updateRefundStatus(params.id, status, auth.admin?.email, notes);
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ refund: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update refund.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
