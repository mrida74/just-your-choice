import { NextRequest, NextResponse } from "next/server";

import { checkPermission, forbiddenResponse, unauthorizedResponse, verifyAdminAuth } from "@/lib/admin-auth";
import { getOrderById, updateOrderStatus } from "@/lib/order-service";

const STATUS_FLOW: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminAuth(request);

  if (!auth.authenticated) {
    return unauthorizedResponse(auth.error);
  }

  if (!checkPermission(auth.admin, "view_orders")) {
    return forbiddenResponse();
  }

  try {
    const { id } = await context.params;
    const order = await getOrderById(id);

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch order.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminAuth(request);

  if (!auth.authenticated) {
    return unauthorizedResponse(auth.error);
  }

  const body = await request.json();
  const status = typeof body?.status === "string" ? body.status : "";

  if (!status) {
    return NextResponse.json({ error: "Status is required." }, { status: 400 });
  }

  if (!checkPermission(auth.admin, status === "cancelled" ? "cancel_order" : "update_order")) {
    return forbiddenResponse();
  }

  try {
    const { id } = await context.params;
    const order = await getOrderById(id);

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const currentStatus = order.status;
    const allowed = STATUS_FLOW[currentStatus] || [];

    if (!allowed.includes(status)) {
      return NextResponse.json(
        { error: `Cannot move from ${currentStatus} to ${status}.` },
        { status: 400 }
      );
    }

    const updated = await updateOrderStatus(id, status);

    return NextResponse.json({ order: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update order.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
