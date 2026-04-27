import Link from "next/link";

import { CATEGORY_LABELS, type ProductCategory } from "@/lib/constants/categories";
import type { ProductItem } from "@/types/product";
import ProductCard from "@/components/ProductCard";

type CategorySectionProps = {
  category: ProductCategory;
  products: ProductItem[];
};

export default function CategorySection({
  category,
  products,
}: CategorySectionProps) {
  return (
    <section className="space-y-4 rounded-3xl border border-pink-100 bg-white/90 p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-zinc-900 sm:text-2xl">
          {CATEGORY_LABELS[category]} Section
        </h2>
        <Link
          href={`/category/${category}`}
          className="inline-flex w-fit rounded-full bg-pink-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-pink-600"
        >
          View All
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 pb-2 sm:flex sm:gap-4 sm:overflow-x-auto">
        {products.length > 0 ? (
          products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))
        ) : (
          <p className="rounded-xl border border-dashed border-pink-200 bg-pink-50 p-4 text-sm text-zinc-600">
            No products available in this section yet.
          </p>
        )}
      </div>
    </section>
  );
}
