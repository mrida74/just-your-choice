import { NextResponse } from "next/server";

import {
  createProduct,
  getProducts,
  parseProductPayload,
} from "@/lib/product-service";
import {
  isProductCategory,
  type ProductCategory,
} from "@/lib/constants/categories";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const categoryParam = searchParams.get("category")?.toLowerCase();
    const search = searchParams.get("search")?.trim();
    const minPrice = Number(searchParams.get("minPrice"));
    const maxPrice = Number(searchParams.get("maxPrice"));
    const limit = Number(searchParams.get("limit"));

    if (categoryParam && !isProductCategory(categoryParam)) {
      return NextResponse.json(
        { error: "Invalid category filter." },
        { status: 400 }
      );
    }

    const category: ProductCategory | undefined = categoryParam
      ? isProductCategory(categoryParam)
        ? categoryParam
        : undefined
      : undefined;

    const products = await getProducts({
      category,
      search: search || undefined,
      minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
      maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
      limit: Number.isFinite(limit) ? Math.min(limit, 120) : undefined,
    });

    return NextResponse.json({ products });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch products.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = parseProductPayload(body);
    const product = await createProduct(payload);

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create product.";

    return NextResponse.json(
      { error: message },
      { status: message.includes("required") ? 400 : 500 }
    );
  }
}
