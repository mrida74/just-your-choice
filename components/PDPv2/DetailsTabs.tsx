"use client";

import { useState } from "react";
import type { ProductItem } from "@/types/product";

type Props = { product: ProductItem };

export default function DetailsTabs({ product }: Props) {
  const [tab, setTab] = useState<'desc'|'specs'|'reviews'>('desc');

  return (
    <div className="mt-6 rounded-2xl border border-pink-100 bg-white p-4 shadow-sm">
      <div className="flex gap-3">
        <button onClick={() => setTab('desc')} className={`px-3 py-1 text-sm ${tab==='desc' ? 'font-semibold text-zinc-900' : 'text-zinc-600'}`}>Description</button>
        <button onClick={() => setTab('specs')} className={`px-3 py-1 text-sm ${tab==='specs' ? 'font-semibold text-zinc-900' : 'text-zinc-600'}`}>Specifications</button>
        <button onClick={() => setTab('reviews')} className={`px-3 py-1 text-sm ${tab==='reviews' ? 'font-semibold text-zinc-900' : 'text-zinc-600'}`}>Reviews</button>
      </div>

      <div className="mt-4 text-sm text-zinc-700">
        {tab === 'desc' && <div dangerouslySetInnerHTML={{ __html: product.description }} />}
        {tab === 'specs' && (
          <ul className="list-disc pl-5">
            <li>Material: Premium fabric</li>
            <li>Origin: India</li>
            <li>Care: Dry clean</li>
          </ul>
        )}
        {tab === 'reviews' && (
          <div className="text-sm text-zinc-600">No reviews yet.</div>
        )}
      </div>
    </div>
  );
}
