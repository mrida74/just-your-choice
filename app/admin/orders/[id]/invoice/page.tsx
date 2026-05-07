import Link from "next/link";
import { notFound } from "next/navigation";

import InvoicePrintButton from "@/components/admin/InvoicePrintButton";
import { getOrderById } from "@/lib/order-service";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminInvoicePage({
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
      <section className="rounded-3xl border border-pink-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">Invoice</p>
            <h1 className="mt-2 text-2xl font-black text-zinc-900">
              Invoice #{order.orderNumber}
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/admin/orders/${order._id.toString()}`}
              className="inline-flex items-center justify-center rounded-2xl border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-600 transition-colors hover:border-pink-200 hover:text-pink-600 hover:bg-pink-50"
            >
              Back to order
            </Link>
            <InvoicePrintButton />
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-pink-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-zinc-900">Just Your Choice</p>
            <p className="mt-1 text-sm text-zinc-500">Luxury Fashion & Beauty</p>
            <p className="mt-2 text-sm text-zinc-500">
              Order date: {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-900">Bill to</p>
            <p className="mt-1 text-sm text-zinc-500">{order.customer?.name}</p>
            <p className="text-sm text-zinc-500">{order.customer?.email}</p>
            <p className="text-sm text-zinc-500">{order.customer?.phone}</p>
            <p className="mt-2 text-sm text-zinc-500">
              {order.shipping?.address?.street}
            </p>
            <p className="text-sm text-zinc-500">
              {order.shipping?.address?.city}, {order.shipping?.address?.postalCode}
            </p>
            <p className="text-sm text-zinc-500">{order.shipping?.address?.country}</p>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
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
                  <td className="py-4 text-sm font-semibold text-zinc-900">{item.title}</td>
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

        <div className="mt-6 grid gap-2 text-sm text-zinc-600 sm:max-w-sm sm:ml-auto">
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
      </section>
    </div>
  );
}
