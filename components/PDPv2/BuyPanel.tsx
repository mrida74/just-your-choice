"use client";

import { useState } from "react";
import { addToCart } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";
import type { ProductItem } from "@/types/product";

type Props = { product: ProductItem };

export default function BuyPanel({ product }: Props) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1000);
  }

  return (
    <div className="w-full rounded-2xl border border-pink-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-zinc-500">Price</div>
          <div className="text-xl font-bold text-pink-600">{formatPrice(product.price)}</div>
        </div>
        <div className="text-sm text-zinc-600">{product.stock > 0 ? 'In stock' : 'Out of stock'}</div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <label className="text-sm text-zinc-700">Qty</label>
        <div className="inline-flex items-center gap-2 rounded-md border px-2 py-1">
          <button onClick={() => setQty(Math.max(1, qty-1))} aria-label="Decrease">−</button>
          <div className="w-6 text-center text-sm">{qty}</div>
          <button onClick={() => setQty(Math.min(product.stock, qty+1))} aria-label="Increase">+</button>
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        <button onClick={handleAdd} className="flex-1 rounded-full bg-pink-600 px-4 py-2 text-sm font-bold text-white">{added ? 'Added' : 'Add to Cart'}</button>
        <button className="w-36 rounded-full border border-pink-300 px-4 py-2 text-sm font-semibold text-pink-600">Buy Now</button>
      </div>

      <div className="mt-3 text-xs text-zinc-500">Free shipping over $75 · Easy returns</div>
    </div>
  );
}
