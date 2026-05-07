import { NextRequest, NextResponse } from "next/server";
import { checkPermission, forbiddenResponse, unauthorizedResponse, verifyAdminAuth } from "@/lib/admin-auth";
import { getShipping, countShipping, getShippingStats, createShipping } from "@/lib/shipping-service";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminAuth(request);
  if (!auth.authenticated) return unauthorizedResponse(auth.error);
  if (!checkPermission(auth.admin, "view_shipping")) return forbiddenResponse();

  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");
    const carrier = searchParams.get("carrier");
    const status = searchParams.get("status");
    const skip = parseInt(searchParams.get("skip") || "0", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const includeStats = searchParams.get("includeStats") === "true";

    const filters: any = { skip, limit };
    if (orderId) filters.orderId = orderId;
    if (carrier) filters.carrier = carrier;
    if (status) filters.status = status;

    const shipping = await getShipping(filters);
    const total = await countShipping(filters);

    const response: any = {
      shipping,
      total,
      skip,
      limit,
    };

    if (includeStats) {
      response.stats = await getShippingStats();
    }

    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch shipping records.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminAuth(request);
  if (!auth.authenticated) return unauthorizedResponse(auth.error);
  if (!checkPermission(auth.admin, "manage_shipping")) return forbiddenResponse();

  try {
    const body = await request.json();
    const shipping = await createShipping(body);
    return NextResponse.json({ shipping }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create shipping record.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
