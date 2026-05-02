"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";

import {
  clearCart,
  getCartItems,
  removeFromCart,
  updateCartQuantity,
} from "@/lib/cart";
import { formatPrice } from "@/lib/utils";
import type { CartItem } from "@/types/cart";

export default function CartView() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setItems(getCartItems());
    setIsHydrated(true);

    const sync = () => setItems(getCartItems());
    window.addEventListener("cart:updated", sync);

    return () => window.removeEventListener("cart:updated", sync);
  }, []);

  const subtotal = useMemo(
    () => (items ?? []).reduce((total, item) => total + item.price * item.quantity, 0),
    [items]
  );

  if (!isHydrated) {
    return (
      <div className="rounded-3xl border border-pink-100 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-black text-zinc-900">Your Cart</h1>
        <p className="mt-2 text-sm text-zinc-600">Loading...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-pink-100 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <ShoppingCart size={32} className="text-pink-400" />
          <h1 className="text-3xl font-black text-zinc-900">Your Cart</h1>
        </div>
        <p className="mt-4 text-sm text-zinc-600">Your cart is empty. Add products to continue.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
      <section className="rounded-3xl border border-pink-100 bg-white p-4 shadow-sm sm:p-6">
        <h1 className="mb-4 text-3xl font-black text-zinc-900">Your Cart</h1>

        <div className="space-y-4">
          {items.map((item) => (
            <article
              key={item.id}
              className="grid gap-3 rounded-2xl border border-pink-100 p-3 sm:grid-cols-[88px_1fr_auto] sm:items-center"
            >
              <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-pink-50">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>

              <div>
                <h2 className="line-clamp-1 text-sm font-semibold text-zinc-900">{item.title}</h2>
                <p className="mt-1 text-sm font-bold text-pink-600">{formatPrice(item.price)}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setItems(updateCartQuantity(item.id, item.quantity - 1))}
                  className="h-8 w-8 rounded-full border border-pink-300 text-pink-600 hover:bg-pink-50 transition-colors flex items-center justify-center"
                  aria-label="Decrease quantity"
                >
                  <Minus size={16} />
                </button>
                <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => setItems(updateCartQuantity(item.id, item.quantity + 1))}
                  className="h-8 w-8 rounded-full border border-pink-300 text-pink-600 hover:bg-pink-50 transition-colors flex items-center justify-center"
                  aria-label="Increase quantity"
                >
                  <Plus size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setItems(removeFromCart(item.id))}
                  className="ml-2 rounded-full border border-red-200 p-1.5 text-red-600 hover:bg-red-50 transition-colors"
                  aria-label="Remove item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <aside className="h-fit rounded-3xl border border-pink-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-black text-zinc-900">Order Summary</h2>
        <div className="mt-4 flex items-center justify-between text-sm text-zinc-600">
          <span>Subtotal</span>
          <span className="font-semibold text-zinc-900">{formatPrice(subtotal)}</span>
        </div>
        <Link
          href="/checkout"
          className="mt-5 block w-full rounded-full bg-black text-white px-4 py-3 text-sm font-bold text-center transition-colors hover:bg-zinc-800"
        >
          Checkout
        </Link>
        <button
          type="button"
          onClick={() => setItems(clearCart() ?? [])}
          className="mt-3 w-full rounded-full border border-pink-200 px-4 py-2 text-sm font-semibold text-pink-600 transition-colors hover:bg-pink-50"
        >
          Clear Cart
        </button>
      </aside>
    </div>
  );
}
