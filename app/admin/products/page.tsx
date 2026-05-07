import Link from "next/link";

import { CATEGORY_LABELS, type ProductCategory } from "@/lib/constants/categories";
import { getProducts } from "@/lib/product-service";
import { formatPrice } from "@/lib/utils";
import StatusBadge from "@/components/admin/StatusBadge";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminProductsPage() {
  const products = await getProducts({ limit: 200 });

  const statusTone: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
    active: "success",
    draft: "warning",
    out_of_stock: "danger",
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">
              Product management
            </p>
            <h1 className="mt-2 text-2xl font-black text-zinc-900">Products</h1>
            <p className="mt-1 text-sm text-zinc-600">
              Curate your catalog with precise categories, pricing, and stock levels.
            </p>
          </div>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center justify-center rounded-2xl bg-pink-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-pink-700"
          >
            Add product
          </Link>
        </div>
      </section>

      <section className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-500">
                <th className="py-3">Product</th>
                <th className="py-3">Category</th>
                <th className="py-3">Status</th>
                <th className="py-3">Price</th>
                <th className="py-3">Stock</th>
                <th className="py-3">Updated</th>
                <th className="py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-sm text-zinc-500">
                    No products added yet.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id} className="border-b border-zinc-100 last:border-b-0">
                    <td className="py-4">
                      <p className="text-sm font-semibold text-zinc-900">{product.title}</p>
                      <p className="text-xs text-zinc-500 line-clamp-1">{product.description}</p>
                    </td>
                    <td className="py-4 text-zinc-600">
                      {CATEGORY_LABELS[product.category as ProductCategory]}
                    </td>
                    <td className="py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge
                          label={product.status ?? "active"}
                          tone={statusTone[product.status ?? "active"] ?? "default"}
                        />
                        {product.featured ? (
                          <StatusBadge label="Featured" tone="info" />
                        ) : null}
                      </div>
                    </td>
                    <td className="py-4 font-semibold text-zinc-900">
                      {formatPrice(product.price)}
                    </td>
                    <td className="py-4">
                      <StatusBadge
                        label={`${product.stock} in stock`}
                        tone={product.stock <= 5 ? "warning" : "success"}
                      />
                    </td>
                    <td className="py-4 text-sm text-zinc-500">
                      {product.updatedAt ? new Date(product.updatedAt).toLocaleDateString() : "--"}
                    </td>
                    <td className="py-4 text-right">
                      <Link
                        href={`/admin/products/${product._id}`}
                        className="inline-flex items-center rounded-xl border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-600 transition-colors hover:border-pink-200 hover:text-pink-600 hover:bg-pink-50"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
