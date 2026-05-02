import type { Metadata } from "next";

import CheckoutView from "@/components/CheckoutView";

export const metadata: Metadata = {
  title: "Checkout | Just Your Choice",
  description: "Complete your purchase and review your order.",
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-zinc-900">Checkout</h1>
        <p className="mt-2 text-sm text-zinc-600">Complete your order information below</p>
      </div>
      <CheckoutView />
    </div>
  );
}
