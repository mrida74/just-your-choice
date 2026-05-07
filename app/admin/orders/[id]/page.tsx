import Link from "next/link";
import { notFound } from "next/navigation";

import OrderDetailActions from "@/components/admin/OrderDetailActions";
import StatusBadge from "@/components/admin/StatusBadge";
import { getOrderById } from "@/lib/order-service";
import { formatPrice } from "@/lib/utils";

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

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">
              Order detail
            </p>
            <h1 className="mt-2 text-2xl font-black text-zinc-900">
              Order {order.orderNumber}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusBadge label={order.status} tone={STATUS_TONE[order.status] ?? "default"} />
              <StatusBadge
                label={`Payment: ${order.paymentStatus}`}
                tone={order.paymentStatus === "completed" ? "success" : "warning"}
              />
            </div>
          </div>
          <Link
            href={`/admin/orders/${order._id.toString()}/invoice`}
            className="inline-flex items-center justify-center rounded-2xl border border-pink-200 px-4 py-2 text-sm font-semibold text-pink-700 transition-colors hover:border-pink-300 hover:bg-pink-50"
          >
            View invoice
          </Link>
        </div>
      </section>

      <OrderDetailActions orderId={order._id.toString()} status={order.status} />

      <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
          <h2 className="text-lg font-bold text-zinc-900">Order items</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-max text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500">
                  <th className="py-3">Item</th>
                  <th className="py-3">Qty</th>
                  <th className="py-3">Price</th>
                  <th className="py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item._id.toString()} className="border-b border-zinc-100 last:border-b-0">
                    <td className="py-4">
                      <p className="text-sm font-semibold text-zinc-900">{item.title}</p>
                      <p className="text-xs text-zinc-500">
                        {item.size ? `Size: ${item.size}` : ""}
                      </p>
                    </td>
                    <td className="py-4 text-zinc-600">{item.quantity}</td>
                    <td className="py-4 text-zinc-600">{formatPrice(item.price)}</td>
                    <td className="py-4 text-right font-semibold text-zinc-900">
                      {formatPrice(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
            <h2 className="text-lg font-bold text-zinc-900">Customer</h2>
            <div className="mt-3 space-y-1 text-sm text-zinc-600">
              <p className="font-semibold text-zinc-900">{order.customer?.name}</p>
              <p>{order.customer?.email}</p>
              <p>{order.customer?.phone}</p>
            </div>
          </div>

          <div className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
            <h2 className="text-lg font-bold text-zinc-900">Shipping</h2>
            <div className="mt-3 space-y-1 text-sm text-zinc-600">
              <p>{order.shipping?.address?.street}</p>
              <p>
                {order.shipping?.address?.city}, {order.shipping?.address?.postalCode}
              </p>
              <p>{order.shipping?.address?.country}</p>
              <p className="pt-2 text-xs uppercase tracking-[0.2em] text-zinc-400">
                {order.shippingMethod}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
            <h2 className="text-lg font-bold text-zinc-900">Summary</h2>
            <div className="mt-4 space-y-2 text-sm text-zinc-600">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(order.pricing?.subtotal ?? 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Shipping</span>
                <span>{formatPrice(order.pricing?.shipping ?? 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Tax</span>
                <span>{formatPrice(order.pricing?.tax ?? 0)}</span>
              </div>
              {order.pricing?.discount ? (
                <div className="flex items-center justify-between">
                  <span>Discount</span>
                  <span>-{formatPrice(order.pricing.discount)}</span>
                </div>
              ) : null}
              <div className="flex items-center justify-between border-t border-zinc-200 pt-3 text-base font-semibold text-zinc-900">
                <span>Total</span>
                <span>{formatPrice(order.pricing?.total ?? 0)}</span>
              </div>
            </div>
          </div>

          {order.notes ? (
            <div className="rounded-3xl border border-pink-100 bg-white/90 p-6 text-sm text-zinc-600 shadow-sm backdrop-blur">
              <h2 className="text-lg font-bold text-zinc-900">Customer notes</h2>
              <p className="mt-3">{order.notes}</p>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
