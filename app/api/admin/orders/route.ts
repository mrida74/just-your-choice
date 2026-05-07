import { NextRequest, NextResponse } from "next/server";

import { checkPermission, forbiddenResponse, unauthorizedResponse, verifyAdminAuth } from "@/lib/admin-auth";
import { getAllOrders } from "@/lib/order-service";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminAuth(request);

  if (!auth.authenticated) {
    return unauthorizedResponse(auth.error);
  }

  if (!checkPermission(auth.admin, "view_orders")) {
    return forbiddenResponse();
  }

  try {
    const { searchParams } = new URL(request.url);

    const status = searchParams.get("status") || undefined;
    const paymentStatus = searchParams.get("paymentStatus") || undefined;
    const limit = Number(searchParams.get("limit"));
    const skip = Number(searchParams.get("skip"));

    const orders = await getAllOrders({
      status: status || undefined,
      paymentStatus: paymentStatus || undefined,
      limit: Number.isFinite(limit) ? Math.min(limit, 200) : undefined,
      skip: Number.isFinite(skip) ? Math.max(skip, 0) : undefined,
    });

    return NextResponse.json({ orders });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch orders.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
