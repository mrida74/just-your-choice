import { getProductsByCategory } from "@/lib/product-service";
import ProductCard from "@/components/ProductCard";
import type { ProductItem } from "@/types/product";

type Props = { product: ProductItem };

export default async function RelatedProducts({ product }: Props) {
  const relatedProducts = await getProductsByCategory(product.category, 6);
  const filtered = relatedProducts.filter((p) => p._id !== product._id).slice(0, 4);

  if (filtered.length === 0) {
    return null;
  }

  return (
    <section className="mt-12 space-y-6">
      <div>
        <h2 className="text-2xl font-black text-zinc-900">Related Products</h2>
        <p className="mt-1 text-sm text-zinc-600">More from {product.category}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map((relProduct) => (
          <ProductCard key={relProduct._id} product={relProduct} />
        ))}
      </div>
    </section>
  );
}
