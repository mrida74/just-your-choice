"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import type { ProductItem } from "@/types/product";

type Props = { product: ProductItem };

export default function DetailsTabs({ product }: Props) {
  const [openPanel, setOpenPanel] = useState<'code' | 'size' | 'desc' | 'reviews'>('desc');

  const sections = [
    { id: 'code', title: 'Product Code' },
    { id: 'size', title: 'Size Guide' },
    { id: 'desc', title: 'Product Description' },
    { id: 'reviews', title: 'Reviews' },
  ] as const;

  return (
    <div className="mt-8 rounded-3xl border border-pink-100 bg-white shadow-sm overflow-hidden">
      <div className="divide-y divide-pink-100">
        {sections.map((section) => {
          const isOpen = openPanel === section.id;

          return (
            <div key={section.id}>
              <button
                type="button"
                onClick={() => setOpenPanel(isOpen ? 'desc' : section.id)}
                className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-pink-50/60 sm:px-6"
              >
                <span className="text-sm font-semibold text-zinc-900">{section.title}</span>
                <ChevronRight
                  size={18}
                  className={`text-zinc-500 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 sm:px-6">
                  {section.id === 'code' && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-500">Product Code</span>
                      <span className="font-semibold text-zinc-900">{product._id.slice(-8).toUpperCase()}</span>
                    </div>
                  )}

                  {section.id === 'size' && (
                    <div className="space-y-3 text-sm text-zinc-700">
                      <p className="leading-relaxed">
                        Sizes are shown in the product panel above. For fit guidance, choose the closest match to your measurements.
                      </p>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {['S', 'M', 'L', 'XL'].map((size) => (
                          <div key={size} className="rounded-2xl border border-pink-100 bg-pink-50 px-3 py-2 text-center font-semibold text-zinc-900">
                            {size}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {section.id === 'desc' && (
                    <div className="space-y-3 text-sm text-zinc-700">
                      <p className="leading-relaxed">{product.description}</p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl bg-pink-50 p-4">
                          <p className="text-xs font-semibold uppercase text-zinc-500">Category</p>
                          <p className="mt-1 font-semibold capitalize text-zinc-900">{product.category}</p>
                        </div>
                        <div className="rounded-2xl bg-pink-50 p-4">
                          <p className="text-xs font-semibold uppercase text-zinc-500">Stock</p>
                          <p className="mt-1 font-semibold text-zinc-900">{product.stock} Units</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {section.id === 'reviews' && (
                    <div className="space-y-2 text-sm text-zinc-600">
                      <p>No reviews yet.</p>
                      <p>Be the first to review this product.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
