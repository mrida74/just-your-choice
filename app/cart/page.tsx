import type { Metadata } from "next";

import CartView from "@/components/CartView";

export const metadata: Metadata = {
  title: "Cart | Just Your Choice",
  description: "Review and manage selected products before checkout.",
};

export default function CartPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <CartView />
    </div>
  );
}
