import { NextRequest, NextResponse } from "next/server";
import { checkPermission, forbiddenResponse, unauthorizedResponse, verifyAdminAuth } from "@/lib/admin-auth";
import { getReturns, countReturns, getReturnStats, createReturn } from "@/lib/refund-service";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminAuth(request);
  if (!auth.authenticated) return unauthorizedResponse(auth.error);
  if (!checkPermission(auth.admin, "refund_orders")) return forbiddenResponse();

  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");
    const status = searchParams.get("status");
    const skip = parseInt(searchParams.get("skip") || "0", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const includeStats = searchParams.get("includeStats") === "true";

    const filters: any = { skip, limit };
    if (orderId) filters.orderId = orderId;
    if (status) filters.status = status;

    const returns = await getReturns(filters);
    const total = await countReturns(filters);

    const response: any = {
      returns,
      total,
      skip,
      limit,
    };

    if (includeStats) {
      response.stats = await getReturnStats();
    }

    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch returns.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminAuth(request);
  if (!auth.authenticated) return unauthorizedResponse(auth.error);
  if (!checkPermission(auth.admin, "refund_orders")) return forbiddenResponse();

  try {
    const body = await request.json();
    const ret = await createReturn(body);
    return NextResponse.json({ return: ret }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create return.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
