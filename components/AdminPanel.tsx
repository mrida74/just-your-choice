"use client";

import { useMemo, useState } from "react";

import {
  CATEGORY_LABELS,
  PRODUCT_CATEGORIES,
  type ProductCategory,
} from "@/lib/constants/categories";
import { formatPrice } from "@/lib/utils";
import type { ProductItem } from "@/types/product";

type FormState = {
  title: string;
  description: string;
  price: string;
  category: ProductCategory;
  images: string;
  stock: string;
};

const initialFormState: FormState = {
  title: "",
  description: "",
  price: "",
  category: "saree",
  images: "",
  stock: "",
};

export default function AdminPanel({ products }: { products: ProductItem[] }) {
  const [productList, setProductList] = useState(products);
  const [selectedCategory, setSelectedCategory] =
    useState<ProductCategory>("saree");
  const [form, setForm] = useState<FormState>(initialFormState);
  const [statusMessage, setStatusMessage] = useState("");

  const filteredProducts = useMemo(
    () => productList.filter((item) => item.category === selectedCategory),
    [productList, selectedCategory]
  );

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage("Saving product...");

    const response = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        description: form.description,
        price: Number(form.price),
        category: form.category,
        images: form.images,
        stock: Number(form.stock),
      }),
    });

    const data = (await response.json()) as {
      product?: ProductItem;
      error?: string;
    };

    if (!response.ok || !data.product) {
      setStatusMessage(data.error ?? "Failed to create product.");
      return;
    }

    setProductList((previous) => [data.product!, ...previous]);
    setForm({ ...initialFormState, category: form.category });
    setStatusMessage("Product added successfully.");
  };

  const handleDelete = async (id: string) => {
    setStatusMessage("Deleting product...");

    const response = await fetch(`/api/products/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      setStatusMessage("Failed to delete product.");
      return;
    }

    setProductList((previous) => previous.filter((item) => item._id !== id));
    setStatusMessage("Product deleted.");
  };

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-xl font-bold text-zinc-900">Add Product</h2>
        <form className="grid gap-3 md:grid-cols-2" onSubmit={handleCreate}>
          <input
            required
            value={form.title}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, title: event.target.value }))
            }
            placeholder="Product title"
            className="rounded-xl border border-pink-200 px-3 py-2 text-sm outline-none ring-pink-400 focus:ring-2"
          />
          <input
            required
            type="number"
            min={0}
            value={form.price}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, price: event.target.value }))
            }
            placeholder="Price"
            className="rounded-xl border border-pink-200 px-3 py-2 text-sm outline-none ring-pink-400 focus:ring-2"
          />
          <textarea
            required
            value={form.description}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, description: event.target.value }))
            }
            placeholder="Description"
            rows={3}
            className="rounded-xl border border-pink-200 px-3 py-2 text-sm outline-none ring-pink-400 focus:ring-2"
          />
          <div className="space-y-3">
            <select
              required
              value={form.category}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  category: event.target.value as ProductCategory,
                }))
              }
              className="w-full rounded-xl border border-pink-200 px-3 py-2 text-sm outline-none ring-pink-400 focus:ring-2"
            >
              {PRODUCT_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {CATEGORY_LABELS[category]}
                </option>
              ))}
            </select>
            <input
              required
              value={form.images}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, images: event.target.value }))
              }
              placeholder="Image URLs (comma separated)"
              className="w-full rounded-xl border border-pink-200 px-3 py-2 text-sm outline-none ring-pink-400 focus:ring-2"
            />
            <input
              required
              type="number"
              min={0}
              value={form.stock}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, stock: event.target.value }))
              }
              placeholder="Stock"
              className="w-full rounded-xl border border-pink-200 px-3 py-2 text-sm outline-none ring-pink-400 focus:ring-2"
            />
          </div>
          <button
            type="submit"
            className="md:col-span-2 rounded-xl bg-pink-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-pink-600"
          >
            Create Product
          </button>
        </form>
        <p className="mt-3 text-sm text-zinc-600">{statusMessage}</p>
      </section>

      <section className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap gap-2">
          {PRODUCT_CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                selectedCategory === category
                  ? "bg-pink-500 text-white"
                  : "bg-pink-50 text-pink-600"
              }`}
            >
              {CATEGORY_LABELS[category]}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-150 text-left text-sm">
            <thead>
              <tr className="border-b border-pink-100 text-zinc-500">
                <th className="py-2">Title</th>
                <th className="py-2">Price</th>
                <th className="py-2">Stock</th>
                <th className="py-2">Category</th>
                <th className="py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((item) => (
                <tr key={item._id} className="border-b border-pink-50">
                  <td className="py-2">{item.title}</td>
                  <td className="py-2">{formatPrice(item.price)}</td>
                  <td className="py-2">{item.stock}</td>
                  <td className="py-2">{CATEGORY_LABELS[item.category]}</td>
                  <td className="py-2">
                    <button
                      type="button"
                      className="rounded-lg border border-pink-300 px-3 py-1 text-xs font-semibold text-pink-600 transition-colors hover:bg-pink-50"
                      onClick={() => handleDelete(item._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
