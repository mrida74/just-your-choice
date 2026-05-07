import Link from "next/link";

import { CATEGORY_LABELS, PRODUCT_CATEGORIES } from "@/lib/constants/categories";
import { getCategories } from "@/lib/category-service";
import StatusBadge from "@/components/admin/StatusBadge";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminCategoriesPage() {
  const categories = await getCategories();
  const categoryMap = new Map(categories.map((category) => [category.slug, category]));

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">
            Category management
          </p>
          <h1 className="mt-2 text-2xl font-black text-zinc-900">Categories</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Control visibility, banners, and SEO metadata for each category.
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-500">
                <th className="py-3">Category</th>
                <th className="py-3">Status</th>
                <th className="py-3">Featured</th>
                <th className="py-3">Sort</th>
                <th className="py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {PRODUCT_CATEGORIES.map((slug) => {
                const category = categoryMap.get(slug);
                return (
                  <tr key={slug} className="border-b border-zinc-100 last:border-b-0">
                    <td className="py-4">
                      <p className="text-sm font-semibold text-zinc-900">
                        {category?.label || CATEGORY_LABELS[slug]}
                      </p>
                      <p className="text-xs text-zinc-500">Slug: {slug}</p>
                    </td>
                    <td className="py-4">
                      <StatusBadge label={category?.status ?? "active"} />
                    </td>
                    <td className="py-4">
                      {category?.featured ? (
                        <StatusBadge label="Featured" tone="info" />
                      ) : (
                        <StatusBadge label="Standard" tone="default" />
                      )}
                    </td>
                    <td className="py-4 text-zinc-600">{category?.sortOrder ?? 0}</td>
                    <td className="py-4 text-right">
                      <Link
                        href={`/admin/categories/${slug}`}
                        className="inline-flex items-center rounded-xl border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-600 transition-colors hover:border-pink-200 hover:text-pink-600 hover:bg-pink-50"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
