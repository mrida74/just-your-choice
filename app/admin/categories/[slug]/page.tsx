import { notFound } from "next/navigation";

import CategoryForm from "@/components/admin/CategoryForm";
import { CATEGORY_LABELS, CATEGORY_DESCRIPTIONS, isProductCategory } from "@/lib/constants/categories";
import { getCategoryBySlug } from "@/lib/category-service";
import type { CategoryItem } from "@/types/category";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminCategoryEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!isProductCategory(slug)) {
    notFound();
  }

  const category = await getCategoryBySlug(slug);
  const initialCategory: CategoryItem = category ?? {
    id: slug,
    slug,
    label: CATEGORY_LABELS[slug],
    description: CATEGORY_DESCRIPTIONS[slug],
    status: "active",
    featured: false,
    sortOrder: 0,
  };

  return <CategoryForm initialCategory={initialCategory} />;
}
