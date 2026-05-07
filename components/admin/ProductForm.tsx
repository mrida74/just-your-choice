"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

import {
  CATEGORY_LABELS,
  PRODUCT_CATEGORIES,
  type ProductCategory,
} from "@/lib/constants/categories";
import type { ProductItem } from "@/types/product";

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "out_of_stock", label: "Out of stock" },
] as const;

type VariantForm = {
  sku: string;
  size: string;
  color: string;
  price: string;
  stock: string;
};

type ProductFormProps = {
  initialProduct?: ProductItem | null;
};

export default function ProductForm({ initialProduct }: ProductFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialProduct?.title ?? "");
  const [description, setDescription] = useState(initialProduct?.description ?? "");
  const [price, setPrice] = useState(
    initialProduct?.price !== undefined ? String(initialProduct.price) : ""
  );
  const [category, setCategory] = useState<ProductCategory>(
    initialProduct?.category ?? "saree"
  );
  const [images, setImages] = useState(
    initialProduct?.images?.join(", ") ?? ""
  );
  const [stock, setStock] = useState(
    initialProduct?.stock !== undefined ? String(initialProduct.stock) : ""
  );
  const [status, setStatus] = useState(
    initialProduct?.status ?? "active"
  );
  const [featured, setFeatured] = useState(Boolean(initialProduct?.featured));
  const [slug, setSlug] = useState(initialProduct?.slug ?? "");
  const [seoTitle, setSeoTitle] = useState(initialProduct?.seo?.title ?? "");
  const [seoDescription, setSeoDescription] = useState(
    initialProduct?.seo?.description ?? ""
  );
  const [seoKeywords, setSeoKeywords] = useState(
    initialProduct?.seo?.keywords?.join(", ") ?? ""
  );
  const [variants, setVariants] = useState<VariantForm[]>(
    initialProduct?.variants?.length
      ? initialProduct.variants.map((variant) => ({
          sku: variant.sku ?? "",
          size: variant.size ?? "",
          color: variant.color ?? "",
          price: variant.price !== undefined ? String(variant.price) : "",
          stock: variant.stock !== undefined ? String(variant.stock) : "",
        }))
      : [
          {
            sku: "",
            size: "",
            color: "",
            price: "",
            stock: "",
          },
        ]
  );
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const isEdit = Boolean(initialProduct?._id);
  const endpoint = isEdit
    ? `/api/admin/products/${initialProduct!._id}`
    : "/api/admin/products";
  const method = isEdit ? "PUT" : "POST";

  const variantRows = useMemo(() => variants.filter(Boolean), [variants]);

  const handleVariantChange = (
    index: number,
    key: keyof VariantForm,
    value: string
  ) => {
    setVariants((prev) =>
      prev.map((variant, idx) =>
        idx === index ? { ...variant, [key]: value } : variant
      )
    );
  };

  const handleRemoveVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleAddVariant = () => {
    setVariants((prev) => [
      ...prev,
      { sku: "", size: "", color: "", price: "", stock: "" },
    ]);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const preparedVariants = variantRows
      .map((variant) => ({
        sku: variant.sku.trim() || undefined,
        size: variant.size.trim() || undefined,
        color: variant.color.trim() || undefined,
        price: variant.price.trim() ? Number(variant.price) : undefined,
        stock: variant.stock.trim() ? Number(variant.stock) : undefined,
      }))
      .filter((variant) => variant.sku || variant.size || variant.color);

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          price: Number(price),
          category,
          images,
          stock: Number(stock),
          status,
          featured,
          slug,
          seo: {
            title: seoTitle,
            description: seoDescription,
            keywords: seoKeywords,
          },
          variants: preparedVariants,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setMessage(data?.error || "Failed to save product.");
        return;
      }

      setMessage(isEdit ? "Product updated." : "Product created.");
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEdit) return;
    const confirmDelete = window.confirm("Delete this product? This cannot be undone.");
    if (!confirmDelete) return;

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(endpoint, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data?.error || "Failed to delete product.");
        return;
      }

      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Delete failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">
              Product details
            </p>
            <h1 className="mt-2 text-2xl font-black text-zinc-900">
              {isEdit ? "Edit product" : "Create product"}
            </h1>
          </div>
          {isEdit ? (
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition-colors hover:border-rose-300 hover:bg-rose-50"
            >
              <Trash2 size={16} />
              Delete
            </button>
          ) : null}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <input
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Product title"
            className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-pink-500 focus:bg-white"
          />
          <input
            required
            type="number"
            min={0}
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            placeholder="Price"
            className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-pink-500 focus:bg-white"
          />
          <textarea
            required
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Description"
            rows={4}
            className="md:col-span-2 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-pink-500 focus:bg-white"
          />
          <select
            required
            value={category}
            onChange={(event) => setCategory(event.target.value as ProductCategory)}
            className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none transition-colors focus:border-pink-500 focus:bg-white"
          >
            {PRODUCT_CATEGORIES.map((option) => (
              <option key={option} value={option}>
                {CATEGORY_LABELS[option]}
              </option>
            ))}
          </select>
          <input
            required
            type="number"
            min={0}
            value={stock}
            onChange={(event) => setStock(event.target.value)}
            placeholder="Stock"
            className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-pink-500 focus:bg-white"
          />
          <input
            required
            value={images}
            onChange={(event) => setImages(event.target.value)}
            placeholder="Image URLs (comma separated)"
            className="md:col-span-2 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-pink-500 focus:bg-white"
          />
        </div>
      </section>

      <section className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">Status</p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as (typeof STATUS_OPTIONS)[number]["value"])
            }
            className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none transition-colors focus:border-pink-500 focus:bg-white"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <input
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            placeholder="Optional slug"
            className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-pink-500 focus:bg-white"
          />
          <label className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-700">
            <input
              type="checkbox"
              checked={featured}
              onChange={(event) => setFeatured(event.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 text-pink-600 focus:ring-pink-500"
            />
            Featured product
          </label>
        </div>
      </section>

      <section className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">
              Variants
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              Add size and color options with optional SKU-level pricing.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddVariant}
            className="inline-flex items-center gap-2 rounded-xl border border-pink-200 px-3 py-2 text-sm font-semibold text-pink-700 transition-colors hover:border-pink-300 hover:bg-pink-50"
          >
            <Plus size={16} />
            Add variant
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {variants.map((variant, index) => (
            <div
              key={`variant-${index}`}
              className="grid gap-3 rounded-2xl border border-zinc-100 bg-white p-4 md:grid-cols-[1.2fr_1fr_1fr_0.7fr_0.7fr_auto]"
            >
              <input
                value={variant.sku}
                onChange={(event) => handleVariantChange(index, "sku", event.target.value)}
                placeholder="SKU"
                className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none focus:border-pink-500 focus:bg-white"
              />
              <input
                value={variant.size}
                onChange={(event) => handleVariantChange(index, "size", event.target.value)}
                placeholder="Size"
                className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none focus:border-pink-500 focus:bg-white"
              />
              <input
                value={variant.color}
                onChange={(event) => handleVariantChange(index, "color", event.target.value)}
                placeholder="Color"
                className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none focus:border-pink-500 focus:bg-white"
              />
              <input
                type="number"
                min={0}
                value={variant.price}
                onChange={(event) => handleVariantChange(index, "price", event.target.value)}
                placeholder="Price"
                className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none focus:border-pink-500 focus:bg-white"
              />
              <input
                type="number"
                min={0}
                value={variant.stock}
                onChange={(event) => handleVariantChange(index, "stock", event.target.value)}
                placeholder="Stock"
                className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none focus:border-pink-500 focus:bg-white"
              />
              <button
                type="button"
                onClick={() => handleRemoveVariant(index)}
                className="inline-flex items-center justify-center rounded-xl border border-zinc-200 px-3 py-2 text-sm font-semibold text-zinc-500 transition-colors hover:border-rose-200 hover:text-rose-500"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">SEO</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <input
            value={seoTitle}
            onChange={(event) => setSeoTitle(event.target.value)}
            placeholder="SEO title"
            className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-pink-500 focus:bg-white"
          />
          <input
            value={seoKeywords}
            onChange={(event) => setSeoKeywords(event.target.value)}
            placeholder="SEO keywords (comma separated)"
            className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-pink-500 focus:bg-white"
          />
          <textarea
            value={seoDescription}
            onChange={(event) => setSeoDescription(event.target.value)}
            placeholder="SEO description"
            rows={3}
            className="md:col-span-2 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-pink-500 focus:bg-white"
          />
        </div>
      </section>

      {message ? (
        <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-600">
          {message}
        </div>
      ) : null}

      <div className="flex items-center justify-end gap-3">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center rounded-2xl bg-pink-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving..." : isEdit ? "Save changes" : "Create product"}
        </button>
      </div>
    </form>
  );
}
