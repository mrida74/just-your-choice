"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Minus, Plus, RotateCcw } from "lucide-react";
import { getSafeImageList } from "@/lib/utils";
import type { ProductItem } from "@/types/product";

type Props = { product: ProductItem };

export default function HeroGallery({ product }: Props) {
  const images = getSafeImageList(product.images);
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    setIndex(0);
    setZoom(1);
  }, [product._id]);

  const currentImage = images[index];
  const totalImages = images.length;
  const zoomIn = () => setZoom((value) => Math.min(2, Number((value + 0.15).toFixed(2))));
  const zoomOut = () => setZoom((value) => Math.max(1, Number((value - 0.15).toFixed(2))));
  const resetZoom = () => setZoom(1);
  const goPrev = () => {
    setIndex((value) => (value === 0 ? value : value - 1));
  };
  const goNext = () => {
    setIndex((value) => (value === totalImages - 1 ? value : value + 1));
  };

  return (
    <section aria-label="Product media" className="space-y-4">
      <div className="relative overflow-hidden rounded-3xl border border-pink-100 bg-zinc-50 shadow-sm">
        <button
          type="button"
          onClick={goPrev}
          disabled={index === 0}
          aria-label="Previous product image"
          className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-zinc-200 bg-white/95 p-2 text-zinc-700 shadow-sm transition-colors hover:bg-pink-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={20} />
        </button>

        <button
          type="button"
          onClick={goNext}
          disabled={index === totalImages - 1}
          aria-label="Next product image"
          className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-zinc-200 bg-white/95 p-2 text-zinc-700 shadow-sm transition-colors hover:bg-pink-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight size={20} />
        </button>

        <div className="relative aspect-4/5 w-full sm:aspect-3/4 lg:aspect-4/5">
          <div
            className="absolute inset-0 transition-transform duration-300 ease-out"
            style={{ transform: `scale(${zoom})` }}
          >
            <Image
              src={currentImage}
              alt={`${product.title}`}
              fill
              className="object-contain p-2 sm:p-5 lg:p-6"
              style={{ objectPosition: "center" }}
              loading={index === 0 ? "eager" : "lazy"}
              sizes="(max-width: 640px) 100vw, 720px"
              priority={index === 0}
            />
          </div>
        </div>

        <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2 rounded-full border border-pink-100 bg-white/90 p-1 shadow-sm backdrop-blur sm:bottom-5 sm:right-5">
          <button
            type="button"
            onClick={zoomOut}
            disabled={zoom <= 1}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-pink-600 transition-colors hover:bg-pink-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Zoom out"
          >
            <Minus size={16} />
          </button>
          <button
            type="button"
            onClick={resetZoom}
            className="inline-flex h-9 min-w-9 items-center justify-center rounded-full px-2 text-xs font-semibold text-zinc-600 transition-colors hover:bg-pink-50"
            aria-label="Reset zoom"
          >
            <RotateCcw size={14} />
          </button>
          <button
            type="button"
            onClick={zoomIn}
            disabled={zoom >= 2}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-pink-600 transition-colors hover:bg-pink-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Zoom in"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 text-xs text-zinc-600">
        <span>Zoom level: {Math.round(zoom * 100)}%</span>
        {totalImages > 1 && <span>Image {index + 1} of {totalImages}</span>}
      </div>
    </section>
  );
}
