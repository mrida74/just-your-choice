import { CATEGORY_LABELS, type ProductCategory } from "@/lib/constants/categories";
import { getProducts } from "@/lib/product-service";
import StatusBadge from "@/components/admin/StatusBadge";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminInventoryPage() {
  const products = await getProducts({ limit: 200 });
  const lowStock = products.filter((product) => product.stock <= 5);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">
            Inventory control
          </p>
          <h1 className="mt-2 text-2xl font-black text-zinc-900">Inventory</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Monitor low stock levels and plan restocks before demand spikes.
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
        <h2 className="text-lg font-bold text-zinc-900">Low stock alerts</h2>
        <p className="mt-1 text-sm text-zinc-500">{lowStock.length} items need attention.</p>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-max text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-500">
                <th className="py-3">Product</th>
                <th className="py-3">Category</th>
                <th className="py-3">Stock</th>
              </tr>
            </thead>
            <tbody>
              {lowStock.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-sm text-zinc-500">
                    Inventory is healthy.
                  </td>
                </tr>
              ) : (
                lowStock.map((product) => (
                  <tr key={product._id} className="border-b border-zinc-100 last:border-b-0">
                    <td className="py-4 text-sm font-semibold text-zinc-900">
                      {product.title}
                    </td>
                    <td className="py-4 text-zinc-600">
                      {CATEGORY_LABELS[product.category as ProductCategory]}
                    </td>
                    <td className="py-4">
                      <StatusBadge label={`${product.stock} left`} tone="warning" />
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
