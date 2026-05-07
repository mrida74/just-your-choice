import Link from "next/link";
import {
  ArrowUpRight,
  Boxes,
  CreditCard,
  Package,
  ShoppingBag,
} from "lucide-react";

import {
  CATEGORY_LABELS,
  type ProductCategory,
} from "@/lib/constants/categories";
import { formatPrice } from "@/lib/utils";
import type { AdminDashboardSnapshot } from "@/lib/admin-dashboard";
import StatusBadge from "@/components/admin/StatusBadge";

type AdminOverviewProps = {
  adminName?: string | null;
  snapshot: AdminDashboardSnapshot;
};

export default function AdminOverview({ adminName, snapshot }: AdminOverviewProps) {
  const { stats, recentOrders, lowStock } = snapshot;
  const greeting = adminName ? `Welcome back, ${adminName}` : "Welcome back";

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-[0_20px_45px_-30px_rgba(236,72,153,0.45)] backdrop-blur">
        <div className="absolute inset-0 bg-linear-to-br from-pink-50 via-white to-white" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-pink-600">
              Dashboard Overview
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-zinc-900">
              {greeting}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
              Track sales momentum, watch inventory levels, and keep the daily order flow on pace.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-pink-100 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">Revenue</p>
              <p className="mt-1 text-2xl font-black text-zinc-900">
                {formatPrice(stats.revenueTotal)}
              </p>
            </div>
            <div className="rounded-2xl border border-pink-100 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">Orders</p>
              <p className="mt-1 text-2xl font-black text-zinc-900">{stats.totalOrders}</p>
            </div>
            <div className="rounded-2xl border border-pink-100 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">Pending</p>
              <p className="mt-1 text-2xl font-black text-amber-600">{stats.pendingOrders}</p>
            </div>
            <div className="rounded-2xl border border-pink-100 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">Delivered</p>
              <p className="mt-1 text-2xl font-black text-emerald-600">
                {stats.deliveredOrders}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-pink-100 bg-white/90 p-5 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">
                Total products
              </p>
              <p className="mt-2 text-3xl font-black text-zinc-900">{stats.totalProducts}</p>
            </div>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-100 text-pink-600">
              <Package size={22} />
            </span>
          </div>
        </div>
        <div className="rounded-3xl border border-pink-100 bg-white/90 p-5 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">
                Low stock alerts
              </p>
              <p className="mt-2 text-3xl font-black text-amber-600">
                {stats.lowStockProducts}
              </p>
            </div>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
              <Boxes size={22} />
            </span>
          </div>
        </div>
        <div className="rounded-3xl border border-pink-100 bg-white/90 p-5 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">
                Fulfillment pace
              </p>
              <p className="mt-2 text-3xl font-black text-zinc-900">
                {stats.pendingOrders > 0 ? "Active" : "Clear"}
              </p>
            </div>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-100 text-pink-600">
              <ShoppingBag size={22} />
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">
                Recent activity
              </p>
              <h2 className="mt-2 text-2xl font-black text-zinc-900">Latest orders</h2>
            </div>
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-2 rounded-xl border border-pink-200 px-4 py-2 text-sm font-semibold text-pink-700 transition-colors hover:border-pink-300 hover:bg-pink-50"
            >
              View all
              <ArrowUpRight size={16} />
            </Link>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-max text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500">
                  <th className="py-3">Order</th>
                  <th className="py-3">Customer</th>
                  <th className="py-3">Status</th>
                  <th className="py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-sm text-zinc-500">
                      No recent orders yet.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-zinc-100 last:border-b-0">
                      <td className="py-4 text-sm font-semibold text-zinc-900">
                        {order.orderNumber || "Order"}
                      </td>
                      <td className="py-4 text-zinc-600">{order.customerName}</td>
                      <td className="py-4">
                        <StatusBadge label={order.status} />
                      </td>
                      <td className="py-4 text-right font-semibold text-zinc-900">
                        {formatPrice(order.total)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">
                Inventory watch
              </p>
              <h2 className="mt-2 text-2xl font-black text-zinc-900">Low stock</h2>
            </div>
            <CreditCard className="text-pink-500" size={20} />
          </div>

          <div className="mt-5 space-y-4">
            {lowStock.length === 0 ? (
              <p className="text-sm text-zinc-500">All products are healthy.</p>
            ) : (
              lowStock.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between rounded-2xl border border-zinc-100 bg-white px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">{product.title}</p>
                    <p className="text-xs text-zinc-500">
                      {CATEGORY_LABELS[product.category as ProductCategory]}
                    </p>
                  </div>
                  <StatusBadge label={`${product.stock} left`} tone="warning" />
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
