import Link from "next/link";

import { getAllOrders } from "@/lib/order-service";
import { formatPrice } from "@/lib/utils";
import StatusBadge from "@/components/admin/StatusBadge";

const STATUS_TONE: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
  pending: "warning",
  confirmed: "info",
  processing: "info",
  shipped: "info",
  delivered: "success",
  cancelled: "danger",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminOrdersPage() {
  const orders = await getAllOrders({ limit: 50 });

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">
              Order workflow
            </p>
            <h1 className="mt-2 text-2xl font-black text-zinc-900">Orders</h1>
            <p className="mt-1 text-sm text-zinc-600">
              Confirm, fulfill, and deliver with a clear workflow status.
            </p>
          </div>
          <Link
            href="/admin/orders/queue"
            className="inline-flex items-center justify-center rounded-2xl border border-pink-200 px-4 py-2 text-sm font-semibold text-pink-700 transition-colors hover:border-pink-300 hover:bg-pink-50"
          >
            View queue
          </Link>
        </div>
      </section>

      <section className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-500">
                <th className="py-3">Order</th>
                <th className="py-3">Customer</th>
                <th className="py-3">Status</th>
                <th className="py-3">Payment</th>
                <th className="py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-sm text-zinc-500">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id.toString()} className="border-b border-zinc-100 last:border-b-0">
                    <td className="py-4 text-sm font-semibold text-zinc-900">
                      <Link
                        href={`/admin/orders/${order._id.toString()}`}
                        className="text-pink-600 hover:text-pink-700"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="py-4 text-zinc-600">
                      {order.customer?.name ?? order.customer?.email ?? "Guest"}
                    </td>
                    <td className="py-4">
                      <StatusBadge
                        label={order.status}
                        tone={STATUS_TONE[order.status] ?? "default"}
                      />
                    </td>
                    <td className="py-4">
                      <StatusBadge
                        label={order.paymentStatus}
                        tone={order.paymentStatus === "completed" ? "success" : "warning"}
                      />
                    </td>
                    <td className="py-4 text-right font-semibold text-zinc-900">
                      {formatPrice(order.pricing?.total ?? 0)}
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
