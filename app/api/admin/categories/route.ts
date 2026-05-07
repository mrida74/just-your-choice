import { NextRequest, NextResponse } from "next/server";

import { checkPermission, forbiddenResponse, unauthorizedResponse, verifyAdminAuth } from "@/lib/admin-auth";
import { getCategories, parseCategoryPayload, upsertCategory } from "@/lib/category-service";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminAuth(request);

  if (!auth.authenticated) {
    return unauthorizedResponse(auth.error);
  }

  if (!checkPermission(auth.admin, "view_categories")) {
    return forbiddenResponse();
  }

  try {
    const categories = await getCategories();
    return NextResponse.json({ categories });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch categories.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminAuth(request);

  if (!auth.authenticated) {
    return unauthorizedResponse(auth.error);
  }

  if (!checkPermission(auth.admin, "update_categories")) {
    return forbiddenResponse();
  }

  try {
    const payload = parseCategoryPayload(await request.json());
    const category = await upsertCategory(payload);

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save category.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
