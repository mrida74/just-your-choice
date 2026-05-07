import { isProductCategory, type ProductCategory } from "@/lib/constants/categories";
import { connectToDatabase } from "@/lib/mongodb";
import ProductModel from "@/lib/models/Product";
import { getSafeImageList } from "@/lib/utils";
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
  status?: "active" | "draft" | "out_of_stock";
  featured?: boolean;
  slug?: string;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  variants?: Array<{
    sku?: string;
    size?: string;
    color?: string;
    price?: number;
    stock?: number;
  }>;
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
    images: getSafeImageList(product.images),
    stock: product.stock,
    status: product.status,
    featured: product.featured,
    slug: product.slug,
    seo: product.seo,
    variants: product.variants,
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
    status?: unknown;
    featured?: unknown;
    slug?: unknown;
    seo?: unknown;
    variants?: unknown;
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

  const statusInput = typeof input.status === "string" ? input.status.toLowerCase() : "active";
  const statusOptions = ["active", "draft", "out_of_stock"] as const;
  if (!statusOptions.includes(statusInput as (typeof statusOptions)[number])) {
    throw new Error("Status must be active, draft, or out_of_stock.");
  }

  const featured =
    typeof input.featured === "boolean"
      ? input.featured
      : typeof input.featured === "string"
        ? input.featured.toLowerCase() === "true"
        : false;

  const slug = typeof input.slug === "string" ? input.slug.trim().toLowerCase() : undefined;

  const seoInput = input.seo && typeof input.seo === "object" ? (input.seo as {
    title?: unknown;
    description?: unknown;
    keywords?: unknown;
  }) : undefined;
  const seo = seoInput
    ? {
        title: typeof seoInput.title === "string" ? seoInput.title.trim() : undefined,
        description:
          typeof seoInput.description === "string" ? seoInput.description.trim() : undefined,
        keywords: Array.isArray(seoInput.keywords)
          ? seoInput.keywords
              .filter((item): item is string => typeof item === "string")
              .map((item) => item.trim())
              .filter(Boolean)
          : typeof seoInput.keywords === "string"
            ? seoInput.keywords
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean)
            : undefined,
      }
    : undefined;

  const variantsInput = Array.isArray(input.variants) ? input.variants : [];
  const variants = variantsInput
    .map((variant) => {
      if (!variant || typeof variant !== "object") {
        return null;
      }

      const entry = variant as {
        sku?: unknown;
        size?: unknown;
        color?: unknown;
        price?: unknown;
        stock?: unknown;
      };

      const sku = typeof entry.sku === "string" ? entry.sku.trim() : undefined;
      const size = typeof entry.size === "string" ? entry.size.trim() : undefined;
      const color = typeof entry.color === "string" ? entry.color.trim() : undefined;
      const variantPrice =
        entry.price === undefined || entry.price === null
          ? undefined
          : Number(entry.price);
      const variantStock =
        entry.stock === undefined || entry.stock === null
          ? undefined
          : Number(entry.stock);

      if (variantPrice !== undefined && (!Number.isFinite(variantPrice) || variantPrice < 0)) {
        throw new Error("Variant price must be a non-negative number.");
      }

      if (variantStock !== undefined && (!Number.isFinite(variantStock) || variantStock < 0)) {
        throw new Error("Variant stock must be a non-negative number.");
      }

      if (!sku && !size && !color) {
        return null;
      }

      return {
        sku: sku || undefined,
        size: size || undefined,
        color: color || undefined,
        price: variantPrice,
        stock: variantStock,
      };
    })
    .filter((variant): variant is NonNullable<typeof variant> => Boolean(variant));

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
    status: statusInput as ProductPayload["status"],
    featured,
    slug: slug || undefined,
    seo,
    variants,
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
        status: product.status as ProductItem["status"],
        featured: product.featured as ProductItem["featured"],
        slug: product.slug as ProductItem["slug"],
        seo: product.seo as ProductItem["seo"],
        variants: product.variants as ProductItem["variants"],
      })
    );
  } catch {
    return [];
  }
}

export async function getProductsByCategory(
  category: ProductCategory,
  limit = 10
) {
  return getProducts({ category, limit });
}

export async function getProductById(id: string) {
  try {
    await connectToDatabase();

    const found = await ProductModel.findById(id).lean();
    if (found) {
      return serializeProduct({
        ...found,
        category: found.category as ProductCategory,
        images: (found.images ?? []) as string[],
        status: found.status as ProductItem["status"],
        featured: found.featured as ProductItem["featured"],
        slug: found.slug as ProductItem["slug"],
        seo: found.seo as ProductItem["seo"],
        variants: found.variants as ProductItem["variants"],
      });
    }
  } catch {
    return null;
  }

  return null;
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
    status: created.status as ProductItem["status"],
    featured: created.featured as ProductItem["featured"],
    slug: created.slug as ProductItem["slug"],
    seo: created.seo as ProductItem["seo"],
    variants: created.variants as ProductItem["variants"],
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
    status: updated.status as ProductItem["status"],
    featured: updated.featured as ProductItem["featured"],
    slug: updated.slug as ProductItem["slug"],
    seo: updated.seo as ProductItem["seo"],
    variants: updated.variants as ProductItem["variants"],
  });
}

export async function deleteProductById(id: string) {
  await connectToDatabase();
  const deleted = await ProductModel.findByIdAndDelete(id);
  return Boolean(deleted);
}
