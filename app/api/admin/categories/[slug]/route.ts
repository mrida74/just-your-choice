import { NextRequest, NextResponse } from "next/server";

import { checkPermission, forbiddenResponse, unauthorizedResponse, verifyAdminAuth } from "@/lib/admin-auth";
import { getCategoryBySlug, parseCategoryPayload, upsertCategory } from "@/lib/category-service";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const auth = await verifyAdminAuth(request);

  if (!auth.authenticated) {
    return unauthorizedResponse(auth.error);
  }

  if (!checkPermission(auth.admin, "view_categories")) {
    return forbiddenResponse();
  }

  try {
    const { slug } = await context.params;
    const category = await getCategoryBySlug(slug);

    if (!category) {
      return NextResponse.json({ error: "Category not found." }, { status: 404 });
    }

    return NextResponse.json({ category });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch category.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const auth = await verifyAdminAuth(request);

  if (!auth.authenticated) {
    return unauthorizedResponse(auth.error);
  }

  if (!checkPermission(auth.admin, "update_categories")) {
    return forbiddenResponse();
  }

  try {
    const { slug } = await context.params;
    const payload = parseCategoryPayload({ ...(await request.json()), slug });
    const category = await upsertCategory(payload);

    if (!category) {
      return NextResponse.json({ error: "Category not found." }, { status: 404 });
    }

    return NextResponse.json({ category });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update category.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
