"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import HeroGallery from "./HeroGallery";
import BuyPanel from "./BuyPanel";
import DetailsTabs from "./DetailsTabs";
import type { ProductItem } from "@/types/product";
import { CATEGORY_LABELS } from "@/lib/constants/categories";

type Props = { product: ProductItem; children?: React.ReactNode };

export default function ProductDetailsV2({ product, children }: Props) {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <nav className="mb-5 flex items-center gap-2 text-sm text-zinc-600">
        <Link href="/" className="hover:text-pink-600 transition-colors">
          Home
        </Link>
        <ChevronRight size={16} className="text-zinc-400" />
        <Link
          href={`/category/${product.category}`}
          className="hover:text-pink-600 transition-colors capitalize"
        >
          {CATEGORY_LABELS[product.category]}
        </Link>
        <ChevronRight size={16} className="text-zinc-400" />
        <span className="text-zinc-900 font-semibold line-clamp-1">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <HeroGallery product={product} />
        </div>

        <aside>
          <div className="sticky top-6">
            <BuyPanel product={product} />
          </div>
        </aside>
      </div>

      <DetailsTabs product={product} />

      {children}
    </main>
  );
}
