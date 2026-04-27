import type { Metadata } from "next";

import CategorySection from "@/components/CategorySection";
import { CATEGORY_DESCRIPTIONS, PRODUCT_CATEGORIES } from "@/lib/constants/categories";
import { getProductsByCategory } from "@/lib/product-service";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Explore women's products with separate sections for saree, clothing, bags, cosmetics, and skincare.",
};

export default async function Home() {
  const productsByCategory = await Promise.all(
    PRODUCT_CATEGORIES.map(async (category) => ({
      category,
      products: await getProductsByCategory(category, 10),
    }))
  );

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <section className="relative overflow-hidden rounded-3xl border border-pink-100 bg-white p-4 shadow-sm sm:p-10">
        <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-pink-200/40 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 left-10 h-40 w-40 rounded-full bg-rose-200/35 blur-2xl" />
        <div className="relative max-w-3xl space-y-3 sm:space-y-4">
          <p className="inline-flex rounded-full bg-pink-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-pink-700">
            Women&apos;s Fashion & Beauty
          </p>
          <h1 className="max-w-[12ch] text-3xl font-black leading-tight tracking-tight text-zinc-900 sm:max-w-none sm:text-5xl">
            Clearly separated shopping sections for every style choice.
          </h1>
          <p className="max-w-[34ch] text-sm leading-relaxed text-zinc-600 sm:max-w-none sm:text-base">
            Browse by dedicated categories: saree, clothing, bags, cosmetics, and skincare. Each section is independently structured for a fast and focused shopping experience.
          </p>
        </div>
      </section>

      <section className="space-y-5 sm:space-y-6">
        {productsByCategory.map(({ category, products }) => (
          <div key={category} className="space-y-2">
            <CategorySection category={category} products={products} />
            <p className="px-1 text-sm text-zinc-600">{CATEGORY_DESCRIPTIONS[category]}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
