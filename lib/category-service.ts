import { connectToDatabase } from "@/lib/mongodb";
import CategoryModel from "@/lib/models/Category";
import { PRODUCT_CATEGORIES } from "@/lib/constants/categories";
import type { CategoryItem, CategoryPayload } from "@/types/category";

function serializeCategory(category: {
  _id: { toString(): string };
  slug: string;
  label: string;
  description?: string;
  bannerImage?: string;
  heroImage?: string;
  featured?: boolean;
  status?: "active" | "hidden";
  sortOrder?: number;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  createdAt?: Date;
  updatedAt?: Date;
}): CategoryItem {
  return {
    id: category._id.toString(),
    slug: category.slug,
    label: category.label,
    description: category.description,
    bannerImage: category.bannerImage,
    heroImage: category.heroImage,
    featured: category.featured,
    status: category.status ?? "active",
    sortOrder: category.sortOrder ?? 0,
    seo: category.seo,
    createdAt: category.createdAt?.toISOString(),
    updatedAt: category.updatedAt?.toISOString(),
  };
}

export function parseCategoryPayload(payload: unknown): CategoryPayload {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid payload.");
  }

  const input = payload as {
    slug?: unknown;
    label?: unknown;
    description?: unknown;
    bannerImage?: unknown;
    heroImage?: unknown;
    featured?: unknown;
    status?: unknown;
    sortOrder?: unknown;
    seo?: unknown;
  };

  const slug = typeof input.slug === "string" ? input.slug.trim().toLowerCase() : "";
  if (!slug || !PRODUCT_CATEGORIES.includes(slug as (typeof PRODUCT_CATEGORIES)[number])) {
    throw new Error("Slug must be a valid category.");
  }

  const label = typeof input.label === "string" ? input.label.trim() : "";
  if (!label) {
    throw new Error("Label is required.");
  }

  const statusInput = typeof input.status === "string" ? input.status.toLowerCase() : "active";
  if (statusInput !== "active" && statusInput !== "hidden") {
    throw new Error("Status must be active or hidden.");
  }

  const featured =
    typeof input.featured === "boolean"
      ? input.featured
      : typeof input.featured === "string"
        ? input.featured.toLowerCase() === "true"
        : false;

  const sortOrder = Number.isFinite(Number(input.sortOrder)) ? Number(input.sortOrder) : 0;

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

  return {
    slug,
    label,
    description: typeof input.description === "string" ? input.description.trim() : undefined,
    bannerImage: typeof input.bannerImage === "string" ? input.bannerImage.trim() : undefined,
    heroImage: typeof input.heroImage === "string" ? input.heroImage.trim() : undefined,
    featured,
    status: statusInput as CategoryPayload["status"],
    sortOrder,
    seo,
  };
}

export async function getCategories() {
  await connectToDatabase();
  const categories = await CategoryModel.find().sort({ sortOrder: 1, label: 1 }).lean();
  return categories.map((category) =>
    serializeCategory({
      ...category,
      slug: category.slug,
      label: category.label,
      description: category.description ?? undefined,
      bannerImage: category.bannerImage ?? undefined,
      heroImage: category.heroImage ?? undefined,
      seo: category.seo
        ? {
            title: category.seo.title ?? undefined,
            description: category.seo.description ?? undefined,
            keywords: Array.isArray(category.seo.keywords)
              ? category.seo.keywords.filter((k: unknown): k is string => typeof k === "string")
              : undefined,
          }
        : undefined,
    })
  );
}

export async function getCategoryBySlug(slug: string) {
  await connectToDatabase();
  const found = await CategoryModel.findOne({ slug }).lean();
  if (!found) {
    return null;
  }

  return serializeCategory({
    ...found,
    slug: found.slug,
    label: found.label,
    description: found.description ?? undefined,
    bannerImage: found.bannerImage ?? undefined,
    heroImage: found.heroImage ?? undefined,
    seo: found.seo
      ? {
          title: found.seo.title ?? undefined,
          description: found.seo.description ?? undefined,
          keywords: Array.isArray(found.seo.keywords)
            ? found.seo.keywords.filter((k: unknown): k is string => typeof k === "string")
            : undefined,
        }
      : undefined,
  });
}

export async function upsertCategory(payload: CategoryPayload) {
  await connectToDatabase();
  const updated = await CategoryModel.findOneAndUpdate(
    { slug: payload.slug },
    { $set: payload },
    { upsert: true, new: true, runValidators: true }
  ).lean();

  if (!updated) {
    return null;
  }

  return serializeCategory({
    ...updated,
    slug: updated.slug,
    label: updated.label,
    description: updated.description ?? undefined,
    bannerImage: updated.bannerImage ?? undefined,
    heroImage: updated.heroImage ?? undefined,
    seo: updated.seo
      ? {
          title: updated.seo.title ?? undefined,
          description: updated.seo.description ?? undefined,
          keywords: Array.isArray(updated.seo.keywords)
            ? updated.seo.keywords.filter((k: unknown): k is string => typeof k === "string")
            : undefined,
        }
      : undefined,
  });
}
