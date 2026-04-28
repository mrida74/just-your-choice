"use client";

import HeroGallery from "./HeroGallery";
import BuyPanel from "./BuyPanel";
import DetailsTabs from "./DetailsTabs";
import type { ProductItem } from "@/types/product";

type Props = { product: ProductItem };

export default function ProductDetailsV2({ product }: Props) {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <HeroGallery product={product} />
          <DetailsTabs product={product} />
        </div>

        <aside className="lg:col-span-1">
          <div className="sticky top-6">
            <BuyPanel product={product} />
          </div>
        </aside>
      </div>
    </main>
  );
}
