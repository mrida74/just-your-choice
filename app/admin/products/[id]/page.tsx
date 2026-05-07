import { notFound } from "next/navigation";

import ProductForm from "@/components/admin/ProductForm";
import { getProductById } from "@/lib/product-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminProductEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  return <ProductForm initialProduct={product} />;
}
