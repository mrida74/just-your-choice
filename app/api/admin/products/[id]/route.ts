import { NextRequest, NextResponse } from "next/server";

import { checkPermission, forbiddenResponse, unauthorizedResponse, verifyAdminAuth } from "@/lib/admin-auth";
import {
  deleteProductById,
  parseProductPayload,
  updateProductById,
} from "@/lib/product-service";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminAuth(request);

  if (!auth.authenticated) {
    return unauthorizedResponse(auth.error);
  }

  if (!checkPermission(auth.admin, "update_product")) {
    return forbiddenResponse();
  }

  try {
    const { id } = await context.params;
    const body = await request.json();
    const payload = parseProductPayload(body);

    const product = await updateProductById(id, payload);
    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update product.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminAuth(request);

  if (!auth.authenticated) {
    return unauthorizedResponse(auth.error);
  }

  if (!checkPermission(auth.admin, "delete_product")) {
    return forbiddenResponse();
  }

  try {
    const { id } = await context.params;
    const deleted = await deleteProductById(id);

    if (!deleted) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete product.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
