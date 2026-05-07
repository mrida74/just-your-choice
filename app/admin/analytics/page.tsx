import {
  getCategoryPerformance,
  getCustomerRepeatStats,
  getOrderFunnel,
  getRevenueTrend,
  getTopProducts,
} from "@/lib/admin-analytics";
import { CATEGORY_LABELS } from "@/lib/constants/categories";
import StatusBadge from "@/components/admin/StatusBadge";
import Sparkline from "@/components/admin/Sparkline";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminAnalyticsPage() {
  const [trend, funnel, categories, topProducts, repeatStats] = await Promise.all([
    getRevenueTrend(30),
    getOrderFunnel(),
    getCategoryPerformance(90),
    getTopProducts(90, 6),
    getCustomerRepeatStats(),
  ]);

  const revenueTotal = trend.reduce((sum, point) => sum + point.revenue, 0);
  const ordersTotal = trend.reduce((sum, point) => sum + point.orders, 0);
  const avgOrderValue = ordersTotal ? revenueTotal / ordersTotal : 0;

  const funnelMap = new Map(funnel.map((entry) => [entry.status, entry]));
  const funnelOrder = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">
          Analytics
        </p>
        <h1 className="mt-2 text-2xl font-black text-zinc-900">Sales analytics</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Track revenue momentum, order flow, and category performance across the last 90 days.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">
                Revenue trend
              </p>
              <h2 className="mt-2 text-xl font-black text-zinc-900">Last 30 days</h2>
            </div>
            <Sparkline data={trend.map((point) => point.revenue)} />
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Revenue</p>
              <p className="mt-2 text-2xl font-black text-zinc-900">
                {formatPrice(revenueTotal)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Orders</p>
              <p className="mt-2 text-2xl font-black text-zinc-900">{ordersTotal}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Avg order</p>
              <p className="mt-2 text-2xl font-black text-zinc-900">
                {formatPrice(avgOrderValue)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">
            Repeat customers
          </p>
          <h2 className="mt-2 text-xl font-black text-zinc-900">Retention pulse</h2>
          <div className="mt-4 space-y-3 text-sm text-zinc-600">
            <div className="flex items-center justify-between">
              <span>Total customers</span>
              <span className="font-semibold text-zinc-900">
                {repeatStats.totalCustomers}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Repeat customers</span>
              <span className="font-semibold text-zinc-900">
                {repeatStats.repeatCustomers}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Repeat rate</span>
              <span className="font-semibold text-zinc-900">
                {(repeatStats.repeatRate * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Avg orders</span>
              <span className="font-semibold text-zinc-900">
                {repeatStats.avgOrdersPerCustomer.toFixed(1)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Avg order value</span>
              <span className="font-semibold text-zinc-900">
                {formatPrice(repeatStats.avgOrderValue)}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">Order funnel</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3 lg:grid-cols-6">
          {funnelOrder.map((status) => {
            const entry = funnelMap.get(status);
            const count = entry?.count ?? 0;
            return (
              <div
                key={status}
                className="rounded-2xl border border-zinc-100 bg-white px-4 py-4"
              >
                <StatusBadge label={status} />
                <p className="mt-3 text-2xl font-black text-zinc-900">{count}</p>
                <p className="text-xs text-zinc-500">Orders</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">
                Category performance
              </p>
              <h2 className="mt-2 text-xl font-black text-zinc-900">Top categories</h2>
            </div>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-max text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500">
                  <th className="py-3">Category</th>
                  <th className="py-3">Units</th>
                  <th className="py-3 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-sm text-zinc-500">
                      No category data yet.
                    </td>
                  </tr>
                ) : (
                  categories.map((entry) => (
                    <tr key={entry.category} className="border-b border-zinc-100 last:border-b-0">
                      <td className="py-4 font-semibold text-zinc-900">
                        {entry.category in CATEGORY_LABELS
                          ? CATEGORY_LABELS[entry.category as keyof typeof CATEGORY_LABELS]
                          : "Unassigned"}
                      </td>
                      <td className="py-4 text-zinc-600">{entry.units}</td>
                      <td className="py-4 text-right font-semibold text-zinc-900">
                        {formatPrice(entry.revenue)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">Top products</p>
          <div className="mt-4 space-y-4">
            {topProducts.length === 0 ? (
              <p className="text-sm text-zinc-500">No product performance yet.</p>
            ) : (
              topProducts.map((product) => (
                <div key={product.id} className="rounded-2xl border border-zinc-100 bg-white px-4 py-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-zinc-900">{product.title}</p>
                    <p className="text-sm font-semibold text-zinc-900">
                      {formatPrice(product.revenue)}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
                    <span>
                      {product.category && product.category in CATEGORY_LABELS
                        ? CATEGORY_LABELS[product.category as keyof typeof CATEGORY_LABELS]
                        : "Unassigned"}
                    </span>
                    <span>{product.units} units</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
