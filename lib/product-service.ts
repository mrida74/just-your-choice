import { isProductCategory, type ProductCategory } from "@/lib/constants/categories";
import { MOCK_PRODUCTS } from "@/lib/mock-products";
import { connectToDatabase } from "@/lib/mongodb";
import ProductModel from "@/lib/models/Product";
import type { ProductItem, ProductPayload } from "@/types/product";

type ProductQuery = {
  category?: ProductCategory;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
};

function serializeProduct(product: {
  _id: { toString(): string };
  title: string;
  description: string;
  price: number;
  category: ProductCategory;
  images: string[];
  stock: number;
  createdAt?: Date;
  updatedAt?: Date;
}): ProductItem {
  return {
    _id: product._id.toString(),
    title: product.title,
    description: product.description,
    price: product.price,
    category: product.category,
    images: product.images,
    stock: product.stock,
    createdAt: product.createdAt?.toISOString(),
    updatedAt: product.updatedAt?.toISOString(),
  };
}

export function parseProductPayload(payload: unknown): ProductPayload {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid payload.");
  }

  const input = payload as {
    title?: unknown;
    description?: unknown;
    price?: unknown;
    category?: unknown;
    images?: unknown;
    stock?: unknown;
  };

  const category = String(input.category ?? "").toLowerCase();
  if (!isProductCategory(category)) {
    throw new Error("Category must be one of: saree, clothing, bags, cosmetics, skincare.");
  }

  const images = Array.isArray(input.images)
    ? input.images
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
    : typeof input.images === "string"
      ? input.images
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : [];

  const price = Number(input.price);
  const stock = Number(input.stock);
  const title = typeof input.title === "string" ? input.title.trim() : "";
  const description =
    typeof input.description === "string" ? input.description.trim() : "";

  if (title.length < 2) {
    throw new Error("Title is required and must be at least 2 characters.");
  }

  if (description.length < 8) {
    throw new Error("Description is required and must be at least 8 characters.");
  }

  if (!Number.isFinite(price) || price < 0) {
    throw new Error("Price must be a positive number.");
  }

  if (!Number.isFinite(stock) || stock < 0) {
    throw new Error("Stock must be a non-negative number.");
  }

  if (images.length === 0) {
    throw new Error("At least one image URL is required.");
  }

  return {
    title,
    description,
    price,
    category,
    images,
    stock,
  };
}

function buildFilter(query: ProductQuery) {
  const filter: {
    category?: ProductCategory;
    price?: { $gte?: number; $lte?: number };
    $or?: Array<{ title?: { $regex: string; $options: string }; description?: { $regex: string; $options: string } }>;
  } = {};

  if (query.category) {
    filter.category = query.category;
  }

  if (query.search) {
    filter.$or = [
      { title: { $regex: query.search, $options: "i" } },
      { description: { $regex: query.search, $options: "i" } },
    ];
  }

  if (
    typeof query.minPrice === "number" ||
    typeof query.maxPrice === "number"
  ) {
    filter.price = {};
    if (typeof query.minPrice === "number") {
      filter.price.$gte = query.minPrice;
    }
    if (typeof query.maxPrice === "number") {
      filter.price.$lte = query.maxPrice;
    }
  }

  return filter;
}

function getMockProducts(query: ProductQuery) {
  return MOCK_PRODUCTS.filter((product) => {
    if (query.category && product.category !== query.category) {
      return false;
    }

    if (
      query.search &&
      !`${product.title} ${product.description}`
        .toLowerCase()
        .includes(query.search.toLowerCase())
    ) {
      return false;
    }

    if (typeof query.minPrice === "number" && product.price < query.minPrice) {
      return false;
    }

    if (typeof query.maxPrice === "number" && product.price > query.maxPrice) {
      return false;
    }

    return true;
  }).slice(0, query.limit ?? 60);
}

export async function getProducts(query: ProductQuery = {}) {
  try {
    await connectToDatabase();

    const products = await ProductModel.find(buildFilter(query))
      .sort({ createdAt: -1 })
      .limit(query.limit ?? 60)
      .lean();

    return products.map((product) =>
      serializeProduct({
        ...product,
        category: product.category as ProductCategory,
        images: (product.images ?? []) as string[],
      })
    );
  } catch {
    return getMockProducts(query);
  }
}

export async function getProductsByCategory(
  category: ProductCategory,
  limit = 10
) {
  return getProducts({ category, limit });
}

export async function createProduct(payload: ProductPayload) {
  await connectToDatabase();
  const created = await ProductModel.create(payload);
  return serializeProduct({
    _id: created._id,
    title: created.title,
    description: created.description,
    price: created.price,
    category: created.category,
    images: created.images,
    stock: created.stock,
    createdAt: created.createdAt,
    updatedAt: created.updatedAt,
  });
}

export async function updateProductById(id: string, payload: ProductPayload) {
  await connectToDatabase();
  const updated = await ProductModel.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).lean();

  if (!updated) {
    return null;
  }

  return serializeProduct({
    ...updated,
    category: updated.category as ProductCategory,
    images: (updated.images ?? []) as string[],
  });
}

export async function deleteProductById(id: string) {
  await connectToDatabase();
  const deleted = await ProductModel.findByIdAndDelete(id);
  return Boolean(deleted);
}
