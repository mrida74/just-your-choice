"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { CATEGORY_LABELS, PRODUCT_CATEGORIES } from "@/lib/constants/categories";
import type { CategoryItem, CategoryPayload } from "@/types/category";

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "hidden", label: "Hidden" },
] as const;

type CategoryFormProps = {
  initialCategory: CategoryItem;
};

export default function CategoryForm({ initialCategory }: CategoryFormProps) {
  const router = useRouter();
  const [label, setLabel] = useState(initialCategory.label ?? "");
  const [description, setDescription] = useState(initialCategory.description ?? "");
  const [bannerImage, setBannerImage] = useState(initialCategory.bannerImage ?? "");
  const [heroImage, setHeroImage] = useState(initialCategory.heroImage ?? "");
  const [featured, setFeatured] = useState(Boolean(initialCategory.featured));
  const [status, setStatus] = useState(initialCategory.status ?? "active");
  const [sortOrder, setSortOrder] = useState(String(initialCategory.sortOrder ?? 0));
  const [seoTitle, setSeoTitle] = useState(initialCategory.seo?.title ?? "");
  const [seoDescription, setSeoDescription] = useState(initialCategory.seo?.description ?? "");
  const [seoKeywords, setSeoKeywords] = useState(initialCategory.seo?.keywords?.join(", ") ?? "");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const slug = initialCategory.slug;
  const slugLabel = useMemo(() => CATEGORY_LABELS[slug as keyof typeof CATEGORY_LABELS], [slug]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");

      const payload: CategoryPayload = {
      slug,
      label,
      description,
      bannerImage,
      heroImage,
      featured,
      status,
      sortOrder: Number(sortOrder) || 0,
      seo: {
        title: seoTitle,
        description: seoDescription,
        keywords: seoKeywords
          ? seoKeywords.split(",").map((k) => k.trim()).filter(Boolean)
          : undefined,
      },
    };

    try {
      const response = await fetch(`/api/admin/categories/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        setMessage(data?.error || "Failed to save category.");
        return;
      }

      setMessage("Category updated.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">
            Category settings
          </p>
          <h1 className="mt-2 text-2xl font-black text-zinc-900">
            {slugLabel || label}
          </h1>
          <p className="mt-1 text-sm text-zinc-600">Slug: {slug}</p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <input
            required
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder="Category label"
            className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none transition-colors focus:border-pink-500 focus:bg-white"
          />
          <input
            type="number"
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
            placeholder="Sort order"
            className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none transition-colors focus:border-pink-500 focus:bg-white"
          />
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Category description"
            rows={4}
            className="md:col-span-2 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none transition-colors focus:border-pink-500 focus:bg-white"
          />
          <input
            value={bannerImage}
            onChange={(event) => setBannerImage(event.target.value)}
            placeholder="Banner image URL"
            className="md:col-span-2 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none transition-colors focus:border-pink-500 focus:bg-white"
          />
          <input
            value={heroImage}
            onChange={(event) => setHeroImage(event.target.value)}
            placeholder="Hero image URL"
            className="md:col-span-2 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none transition-colors focus:border-pink-500 focus:bg-white"
          />
        </div>
      </section>

      <section className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">Visibility</p>
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
          <label className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-700">
            <input
              type="checkbox"
              checked={featured}
              onChange={(event) => setFeatured(event.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 text-pink-600 focus:ring-pink-500"
            />
            Featured category
          </label>
        </div>
      </section>

      <section className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">SEO</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <input
            value={seoTitle}
            onChange={(event) => setSeoTitle(event.target.value)}
            placeholder="SEO title"
            className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none transition-colors focus:border-pink-500 focus:bg-white"
          />
          <input
            value={seoKeywords}
            onChange={(event) => setSeoKeywords(event.target.value)}
            placeholder="SEO keywords (comma separated)"
            className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none transition-colors focus:border-pink-500 focus:bg-white"
          />
          <textarea
            value={seoDescription}
            onChange={(event) => setSeoDescription(event.target.value)}
            placeholder="SEO description"
            rows={3}
            className="md:col-span-2 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none transition-colors focus:border-pink-500 focus:bg-white"
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
          {saving ? "Saving..." : "Save category"}
        </button>
      </div>
    </form>
  );
}
