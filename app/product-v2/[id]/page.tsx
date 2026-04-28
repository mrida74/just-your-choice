import type { Metadata } from "next";

import ProductDetailsV2 from "@/components/PDPv2";
import { getProductById } from "@/lib/product-service";
import type { ProductItem } from "@/types/product";

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
    return <div className="p-8">Product not found</div>;
  }

  return <ProductDetailsV2 product={product} />;
}
