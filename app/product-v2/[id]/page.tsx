import type { Metadata } from "next";

import ProductDetailsV2 from "@/components/PDPv2";
import RelatedProducts from "@/components/PDPv2/RelatedProducts";
import { getProductById } from "@/lib/product-service";
import type { ProductItem } from "@/types/product";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) return { title: "Product" };
  return { title: product.title, description: product.description };
}

export default async function ProductV2Route({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = (await getProductById(id)) as ProductItem | null;

  if (!product) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="rounded-3xl border border-pink-100 bg-white p-8 text-center">
          <h1 className="text-2xl font-black text-zinc-900">Product not found</h1>
          <p className="mt-2 text-zinc-600">The product you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <ProductDetailsV2 product={product}>
      <RelatedProducts product={product} />
    </ProductDetailsV2>
  );
}
