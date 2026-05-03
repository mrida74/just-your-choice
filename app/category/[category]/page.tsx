import type { Metadata } from "next";
import { notFound } from "next/navigation";

import CategoryFilters from "@/components/CategoryFilters";
import ProductCard from "@/components/ProductCard";
import {
  CATEGORY_DESCRIPTIONS,
  CATEGORY_LABELS,
  isProductCategory,
  PRODUCT_CATEGORIES,
} from "@/lib/constants/categories";
import { getProducts } from "@/lib/product-service";

type CategoryPageProps = {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

function getValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;

  if (!isProductCategory(category)) {
    return {
      title: "Category Not Found | Just Your Choice",
      description: "The requested category does not exist.",
    };
  }

  return {
    title: `${CATEGORY_LABELS[category]} | Just Your Choice`,
    description: CATEGORY_DESCRIPTIONS[category],
    openGraph: {
      title: `${CATEGORY_LABELS[category]} | Just Your Choice`,
      description: CATEGORY_DESCRIPTIONS[category],
      type: "website",
    },
  };
}

export function generateStaticParams() {
  return PRODUCT_CATEGORIES.map((category) => ({ category }));
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { category } = await params;
  if (!isProductCategory(category)) {
    notFound();
  }

  const qp = await searchParams;
  const search = getValue(qp.search)?.trim();
  const minPrice = Number(getValue(qp.minPrice));
  const maxPrice = Number(getValue(qp.maxPrice));

  const products = await getProducts({
    category,
    search: search || undefined,
    minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
    maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
    limit: 120,
  });

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-5 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <section className="rounded-3xl bg-linear-to-r from-pink-100 via-pink-50 to-rose-100 p-5 shadow-sm sm:p-6">
        <h1 className="text-2xl font-black tracking-tight text-zinc-900 sm:text-3xl">
          {CATEGORY_LABELS[category]}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-600 sm:text-base">
          {CATEGORY_DESCRIPTIONS[category]}
        </p>
      </section>

      <CategoryFilters />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.length > 0 ? (
          products.map((product) => <ProductCard key={product._id} product={product} />)
        ) : (
          <p className="rounded-2xl border border-dashed border-pink-200 bg-white p-6 text-sm text-zinc-600">
            No products found for your current filters.
          </p>
        )}
      </section>
    </div>
  );
}
