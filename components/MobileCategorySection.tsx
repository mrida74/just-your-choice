"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORY_LABELS, PRODUCT_CATEGORIES, type ProductCategory } from "@/lib/constants/categories";

export default function MobileCategorySection() {
  const pathname = usePathname();

  if (pathname !== "/") {
    return null;
  }

  const CATEGORY_IMAGES: Record<ProductCategory, string> = {
    saree: "/image/saree.jpg",
    clothing: "/image/cloth.jpg",
    bags: "/image/leather-bag.jpeg",
    cosmetics: "/image/cosmetic.jpeg",
    skincare: "/image/skincare-product.jpeg",
  };

  return (
    <div className="border-t border-pink-100 bg-white md:hidden ">
      <div className="space-y-2">
        {PRODUCT_CATEGORIES.map((category) => {
          const key = category as ProductCategory;
          const href = `/category/${category}`;
          const img = CATEGORY_IMAGES[key] || CATEGORY_IMAGES[Object.keys(CATEGORY_IMAGES)[0] as ProductCategory];

          return (
            <div key={key} className="w-screen relative left-1/2 -translate-x-1/2">
              <Link href={href} className="block w-screen overflow-hidden bg-zinc-50">
                <div className="relative w-screen"> 
                  <Image
                    src={img}
                    alt={CATEGORY_LABELS[key]}
                    width={1920}
                    height={1080}
                    className="w-full block object-cover object-center"
                  />
                  <div className="absolute left-4 top-4 text-2xl font-medium text-white drop-shadow-lg sm:text-3xl">
                    {CATEGORY_LABELS[key]}
                  </div>
                  <div className="absolute left-4 bottom-4">
                    <span className="inline-flex items-center rounded bg-zinc-800/70 px-3 py-2 text-sm font-semibold text-white backdrop-blur-sm">
                      View
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
