"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { getCartCount } from "@/lib/cart";
import { PRODUCT_CATEGORIES } from "@/lib/constants/categories";
import { cn } from "@/lib/utils";

const baseItems = [
  { href: "/", label: "Home" },
  ...PRODUCT_CATEGORIES.map((category) => ({
    href: `/category/${category}`,
    label:
      category === "clothing"
        ? "Clothing"
        : category === "saree"
          ? "Saree"
          : category === "bags"
            ? "Bags"
            : category === "cosmetics"
              ? "Cosmetics"
              : "Skincare",
  })),
  { href: "/cart", label: "Cart" },
];

export default function CategoryNavbar() {
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const syncCartCount = () => setCartCount(getCartCount());

    syncCartCount();
    window.addEventListener("cart:updated", syncCartCount);

    return () => window.removeEventListener("cart:updated", syncCartCount);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-pink-100 bg-white/90 backdrop-blur-lg">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="shrink-0 text-lg font-black tracking-tight text-pink-600 sm:text-xl"
        >
          Just Your Choice
        </Link>

        <div className="flex items-center gap-2 md:hidden">
          <Link
            href="/cart"
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-pink-200 bg-pink-50 px-3 py-2 text-xs font-semibold text-pink-600"
          >
            Cart
            {cartCount > 0 ? (
              <span className="inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-pink-500 px-1 text-[11px] font-bold text-white">
                {cartCount}
              </span>
            ) : null}
          </Link>

          <button
            type="button"
            aria-label="Open category menu"
            onClick={() => setMobileMenuOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-pink-200 bg-white text-pink-600 shadow-sm"
          >
            <span className="flex flex-col gap-1.5">
              <span className="h-0.5 w-4 rounded-full bg-current" />
              <span className="h-0.5 w-4 rounded-full bg-current" />
              <span className="h-0.5 w-4 rounded-full bg-current" />
            </span>
          </button>
        </div>

        <div className="hidden items-center gap-2 md:flex md:flex-wrap md:justify-end">
          {baseItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                  isActive
                    ? "bg-pink-500 text-white"
                    : "text-zinc-700 hover:bg-pink-50 hover:text-pink-600"
                )}
              >
                {item.label}
                {item.href === "/cart" && cartCount > 0 ? (
                  <span className="ml-2 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[11px] font-bold text-pink-600">
                    {cartCount}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>
      </nav>

      {mobileMenuOpen ? (
        <>
          <button
            type="button"
            aria-label="Close category menu"
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 z-40 bg-black/30 md:hidden"
          />
          <aside className="fixed right-0 top-0 z-50 h-dvh w-[82vw] max-w-xs border-l border-pink-100 bg-white px-4 py-4 shadow-2xl md:hidden">
            <div className="flex items-center justify-between border-b border-pink-100 pb-3">
              <p className="text-sm font-black tracking-wide text-pink-600">Menu</p>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-full border border-pink-200 px-3 py-1 text-xs font-semibold text-zinc-600"
              >
                Close
              </button>
            </div>

            <div className="mt-4 space-y-2 overflow-y-auto pr-1">
              {baseItems.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors",
                      isActive
                        ? "border-pink-500 bg-pink-500 text-white"
                        : "border-pink-100 bg-pink-50/60 text-zinc-700"
                    )}
                  >
                    <span>{item.label}</span>
                    {item.href === "/cart" && cartCount > 0 ? (
                      <span className="inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[11px] font-bold text-pink-600">
                        {cartCount}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </aside>
        </>
      ) : null}
    </header>
  );
}
