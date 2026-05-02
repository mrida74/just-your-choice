"use client";

import { useState } from "react";
import { ChevronDown, Check, Minus, Plus, ShoppingCart } from "lucide-react";
import { addToCart } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";
import type { ProductItem } from "@/types/product";

type Props = { product: ProductItem };

export default function BuyPanel({ product }: Props) {
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState("Choose an option");
  const [added, setAdded] = useState(false);
  const sizeOptions = ["S", "M", "L", "XL"];

  function handleAdd() {
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  const inStock = product.stock > 0;
  const canAddMore = qty < product.stock;

  return (
    <div className="w-full rounded-3xl border border-pink-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="space-y-3 border-b border-pink-100 pb-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Product Details</p>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-zinc-900 sm:text-[2rem]">
              {product.title}
            </h1>
            <p className="mt-3 text-lg font-semibold text-zinc-900">{formatPrice(product.price)}</p>
          </div>
          <span className="text-sm font-semibold text-zinc-500">#{product._id.slice(-8)}</span>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-pink-50 px-4 py-3 text-sm">
          <span className={`font-semibold ${inStock ? "text-green-700" : "text-red-600"}`}>
            {inStock ? "In stock" : "Out of stock"}
          </span>
          <span className="text-zinc-600">{inStock ? `${product.stock} available` : "0 available"}</span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-zinc-900">Quantity</label>
          <div className="inline-flex w-full items-center justify-between rounded-xl border border-zinc-200 bg-white px-3 py-2">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              disabled={qty <= 1}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-pink-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Decrease quantity"
            >
              <Minus size={16} />
            </button>
            <div className="min-w-8 text-center text-sm font-semibold text-zinc-900">{qty}</div>
            <button
              onClick={() => setQty(Math.min(product.stock, qty + 1))}
              disabled={!canAddMore}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-pink-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Increase quantity"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-zinc-900">Size</label>
          <button
            type="button"
            className="inline-flex w-full items-center justify-between rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-500 transition-colors hover:border-pink-300 hover:text-zinc-700"
            aria-label="Choose size"
          >
            <span>{size}</span>
            <ChevronDown size={16} />
          </button>
          <div className="mt-2 flex flex-wrap gap-2">
            {sizeOptions.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setSize(item)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  size === item
                    ? "border-pink-500 bg-pink-500 text-white"
                    : "border-zinc-200 text-zinc-600 hover:border-pink-300 hover:text-pink-600"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <button
          onClick={handleAdd}
          disabled={!inStock}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {added ? <Check size={18} /> : <ShoppingCart size={18} />}
          {added ? "Added to Cart" : "Add to Cart"}
        </button>
        <button className="w-full rounded-full border-2 border-pink-300 px-6 py-3 text-sm font-bold text-pink-600 transition-colors hover:bg-pink-50">
          Buy Now
        </button>
      </div>

      <div className="mt-6 space-y-2 border-t border-pink-100 pt-4 text-xs text-zinc-600">
        <p className="font-semibold uppercase tracking-wide text-zinc-900">Find in store</p>
        <div className="flex items-start gap-2">
          <span className="text-lg">✓</span>
          <span>Free shipping on orders over $75</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-lg">✓</span>
          <span>Easy 30-day returns</span>
        </div>
      </div>
    </div>
  );
}
