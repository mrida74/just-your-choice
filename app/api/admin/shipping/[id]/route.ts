import { NextRequest, NextResponse } from "next/server";
import { checkPermission, forbiddenResponse, unauthorizedResponse, verifyAdminAuth } from "@/lib/admin-auth";
import { getShippingById, updateShippingStatus, markAsDelivered } from "@/lib/shipping-service";

export async function GET(request: NextRequest, context: any) {
  const params = context?.params ?? {};
  const auth = await verifyAdminAuth(request);
  if (!auth.authenticated) return unauthorizedResponse(auth.error);
  if (!checkPermission(auth.admin, "view_shipping")) return forbiddenResponse();

  try {
    const shipping = await getShippingById(params.id);
    if (!shipping) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ shipping });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch shipping.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: any) {
  const params = context?.params ?? {};
  const auth = await verifyAdminAuth(request);
  if (!auth.authenticated) return unauthorizedResponse(auth.error);
  if (!checkPermission(auth.admin, "manage_shipping")) return forbiddenResponse();

  try {
    const body = await request.json();
    const { status, location, message, markDelivered } = body;

    let updated;
    if (markDelivered) {
      updated = await markAsDelivered(params.id);
    } else if (status) {
      updated = await updateShippingStatus(params.id, status, location, message);
    } else {
      return NextResponse.json({ error: "No updates provided" }, { status: 400 });
    }

    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ shipping: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update shipping.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
