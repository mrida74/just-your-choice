import { Check } from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Confirmed | Just Your Choice",
  description: "Your order has been successfully placed.",
};

export default async function OrderSuccessPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;

  const session = await getServerSession(authOptions as any);
  const viewOrdersHref = session
    ? "/account#order-tracking"
    : `/login?callbackUrl=${encodeURIComponent("/account#order-tracking")}`;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="rounded-3xl border border-pink-100 bg-white p-8 sm:p-12 shadow-sm text-center space-y-6">
        <div className="flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <Check size={40} className="text-green-600" />
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-black text-zinc-900">Order Confirmed!</h1>
          <p className="mt-2 text-zinc-600">Thank you for your purchase</p>
        </div>

        <div className="space-y-2 bg-pink-50 rounded-2xl p-4">
          <p className="text-sm text-zinc-600">Order Number</p>
          <p className="text-2xl font-bold text-pink-600">{orderNumber}</p>
        </div>

        <div className="space-y-3 text-sm text-zinc-600">
          <p>✓ Order confirmation email has been sent</p>
          <p>✓ You can track your order status anytime</p>
          <p>✓ Our team will contact you for delivery details</p>
        </div>

        <div className="space-y-2 pt-4">
          <Link
            href="/"
            className="block w-full bg-pink-600 text-white font-bold py-3 rounded-full hover:bg-pink-700 transition-colors"
          >
            Continue Shopping
          </Link>
          <Link
            href={viewOrdersHref}
            className="block w-full border border-pink-600 text-pink-600 font-bold py-3 rounded-full hover:bg-pink-50 transition-colors"
          >
            View Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
