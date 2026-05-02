"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";

import { addToCart } from "@/lib/cart";
import { CATEGORY_LABELS } from "@/lib/constants/categories";
import { formatPrice } from "@/lib/utils";
import type { ProductItem } from "@/types/product";

type ProductCardProps = {
  product: ProductItem;
};

export default function ProductCard({ product }: ProductCardProps) {
  const [image, setImage] = useState(product.images[0] || "/placeholder-product.svg");
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(product);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  };

  return (
    <article className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-pink-300 hover:shadow-xl sm:w-60 sm:flex-none">
      <Link href={`/product-v2/${product._id}`} className="block">
        <div className="relative aspect-4/3 w-full bg-pink-50 sm:h-56 sm:aspect-auto">
          <Image
            src={image}
            alt={product.title}
            fill
            onError={() => setImage("/placeholder-product.svg")}
            className="object-cover p-0 transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 94vw, 240px"
          />
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-pink-600 shadow-sm">
            {CATEGORY_LABELS[product.category]}
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col space-y-2 p-3 sm:p-4">
        <Link href={`/product-v2/${product._id}`} className="block">
          <h3 className="line-clamp-1 text-base font-semibold text-zinc-900 hover:text-pink-600">
            {product.title}
          </h3>
        </Link>
        <p className="line-clamp-2 flex-1 text-sm leading-6 text-zinc-600">
          {product.description}
        </p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <p className="text-base font-bold text-pink-600 sm:text-lg">{formatPrice(product.price)}</p>
          <button
            type="button"
            onClick={handleAddToCart}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-pink-300 px-3 py-1 text-xs font-semibold text-pink-600 transition-colors hover:bg-pink-600 hover:text-white"
          >
            {added ? (
              <>
                <Check size={14} />
                Added
              </>
            ) : (
              <>
                <ShoppingCart size={14} />
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
