"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function CategoryFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (search.trim()) {
      params.set("search", search.trim());
    } else {
      params.delete("search");
    }

    if (minPrice.trim()) {
      params.set("minPrice", minPrice.trim());
    } else {
      params.delete("minPrice");
    }

    if (maxPrice.trim()) {
      params.set("maxPrice", maxPrice.trim());
    } else {
      params.delete("maxPrice");
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearch("");
    setMinPrice("");
    setMaxPrice("");
    router.push(pathname);
  };

  return (
    <div className="grid gap-3 rounded-2xl border border-pink-100 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search products"
        className="rounded-xl border border-pink-200 px-3 py-2 text-sm outline-none ring-pink-400 transition focus:ring-2"
      />
      <input
        type="number"
        min={0}
        value={minPrice}
        onChange={(event) => setMinPrice(event.target.value)}
        placeholder="Min price"
        className="rounded-xl border border-pink-200 px-3 py-2 text-sm outline-none ring-pink-400 transition focus:ring-2"
      />
      <input
        type="number"
        min={0}
        value={maxPrice}
        onChange={(event) => setMaxPrice(event.target.value)}
        placeholder="Max price"
        className="rounded-xl border border-pink-200 px-3 py-2 text-sm outline-none ring-pink-400 transition focus:ring-2"
      />
      <div className="flex gap-2 sm:col-span-2 lg:col-span-1">
        <button
          type="button"
          onClick={applyFilters}
          className="flex-1 rounded-xl bg-pink-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-pink-600"
        >
          Apply
        </button>
        <button
          type="button"
          onClick={clearFilters}
          className="rounded-xl border border-pink-300 px-4 py-2 text-sm font-semibold text-pink-600 transition-colors hover:bg-pink-50"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
