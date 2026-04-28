"use client";

import Image from "next/image";
import { useState } from "react";
import type { ProductItem } from "@/types/product";

type Props = { product: ProductItem };

export default function HeroGallery({ product }: Props) {
  const images = product.images || [];
  const [index, setIndex] = useState(0);

  return (
    <section aria-label="Product media" className="space-y-4">
      <div className="relative w-full overflow-hidden rounded-3xl bg-pink-50">
        <div className="relative h-96 sm:h-112 w-full">
          <Image
            src={images[index] ?? "/placeholder-product.svg"}
            alt={product.title}
            fill
            className="object-cover"
            loading={index === 0 ? "eager" : "lazy"}
            sizes="(max-width: 640px) 100vw, 800px"
          />
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto">
        {images.map((src, i) => (
          <button
            key={src + i}
            onClick={() => setIndex(i)}
            className={`shrink-0 h-20 w-28 overflow-hidden rounded-lg ${i===index? 'ring-2 ring-pink-500':'ring-0'}`}
            aria-label={`Show image ${i+1}`}
          >
            <Image src={src} alt={`thumb ${i+1}`} fill className="object-cover" sizes="80px" />
          </button>
        ))}
      </div>
    </section>
  );
}
