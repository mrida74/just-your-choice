"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Heart, LogIn, Menu, Search, ShoppingCart, X } from "lucide-react";

import { getCartCount } from "@/lib/cart";
import Logo from "./Logo";
import { CATEGORY_LABELS, PRODUCT_CATEGORIES } from "@/lib/constants/categories";
import MobileCategorySection from "./MobileCategorySection";
import { cn } from "@/lib/utils";

export default function CategoryNavbar() {
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);
  const [announcementVisible, setAnnouncementVisible] = useState(true);
  const [mobileCategoryMenuOpen, setMobileCategoryMenuOpen] = useState(false);
  const [mobileSiteMenuOpen, setMobileSiteMenuOpen] = useState(false);
  const mobileDrawerItemClass =
    "flex w-full items-center justify-between border-b border-zinc-200 py-3 text-left transition-colors last:border-b-0";
  const mobileDrawerTextClass = "text-[16px] font-normal tracking-[0.12em] leading-none";

  useEffect(() => {
    const syncCartCount = () => setCartCount(getCartCount());

    syncCartCount();
    window.addEventListener("cart:updated", syncCartCount);

    return () => window.removeEventListener("cart:updated", syncCartCount);
  }, []);

  const siteMenuItems = [
    { label: "Home" },
    { label: "Shop", expandable: true },
    { label: "Blog" },
    { label: "Company", expandable: true },
    { label: "Career", expandable: true },
    { label: "Contact" },
  ];

  const closeMobileMenus = () => {
    setMobileCategoryMenuOpen(false);
    setMobileSiteMenuOpen(false);
  };

  const mobileMenuOpen = mobileCategoryMenuOpen || mobileSiteMenuOpen;

  return (
    <header id="site-navbar" className="z-50 border-b border-pink-100 bg-white/90 backdrop-blur-lg">
      {announcementVisible ? (
        <div className="border-b border-pink-200 bg-pink-600 px-4 py-3 text-white sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3">
            <p className="text-center text-sm font-medium leading-none sm:text-base">
              দেশজুড়ে ক্যাশ অন হোম ডেলিভারি!
            </p>
            <button
              type="button"
              onClick={() => setAnnouncementVisible(false)}
              className="shrink-0 text-sm font-medium text-white/90 underline decoration-white/50 underline-offset-4 transition hover:text-white"
            >
              Dismiss
            </button>
          </div>
        </div>
      ) : null}

      <div id="site-navbar-top" className="border-b border-pink-100 bg-white/95">
        <nav className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-3" aria-label="Just Your Choice home">
            <div className="flex items-center">
              <Logo width={220} />
            </div>
          </Link>

          <form className="hidden flex-1 md:block" onSubmit={(event) => event.preventDefault()}>
            <div className="flex w-full max-w-3xl overflow-hidden border-2 border-pink-500 bg-white shadow-sm">
              <label className="sr-only" htmlFor="navbar-search">
                Search products
              </label>
              <input
                id="navbar-search"
                type="search"
                placeholder="Search products.."
                className="min-w-0 flex-1 px-4 py-3 text-sm outline-none placeholder:text-zinc-400"
              />
              <button
                type="submit"
                aria-label="Search products"
                className="inline-flex w-14 items-center justify-center bg-pink-500 text-white transition-colors hover:bg-pink-600"
              >
                <Search size={20} />
              </button>
            </div>
          </form>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              aria-label="Wishlist"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-pink-100 bg-white text-zinc-400 transition-colors hover:border-pink-200 hover:text-pink-600"
            >
              <Heart size={20} />
            </button>

            <Link
              href="/cart"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-pink-100 bg-white text-zinc-700 transition-colors hover:border-pink-200 hover:text-pink-600"
              aria-label="Cart"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 ? (
                <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-pink-600 px-1 text-[11px] font-bold text-white">
                  {cartCount}
                </span>
              ) : null}
            </Link>

            <Link
              href="/admin"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-pink-100 bg-white text-zinc-700 transition-colors hover:border-pink-200 hover:text-pink-600"
              aria-label="Login"
              title="Login"
            >
              <LogIn size={20} />
            </Link>
          </div>
        </nav>

        <div className="mx-auto hidden w-full max-w-7xl items-center gap-2 border-t border-pink-50 px-4 py-3 sm:px-6 lg:flex lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-pink-100 px-4 py-2 text-sm font-semibold text-pink-700">
            <Menu size={16} />
            All Products
          </span>

          <div className="flex flex-wrap items-center gap-2">
            {PRODUCT_CATEGORIES.map((category) => {
              const href = `/category/${category}`;
              const isActive = pathname.startsWith(href);

              return (
                <Link
                  key={category}
                  href={href}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                    isActive ? "bg-pink-500 text-white" : "bg-white text-zinc-700 hover:bg-pink-50 hover:text-pink-600"
                  )}
                >
                  {CATEGORY_LABELS[category]}
                </Link>
              );
            })}
          </div>
        </div>

        <form className="px-4 pb-3 md:hidden sm:px-6" onSubmit={(event) => event.preventDefault()}>
          <div className="flex overflow-hidden border-2 border-pink-500 bg-white shadow-sm">
            <label className="sr-only" htmlFor="mobile-navbar-search">
              Search products
            </label>
            <input
              id="mobile-navbar-search"
              type="search"
              placeholder="Search products.."
              className="min-w-0 flex-1 px-4 py-3 text-sm outline-none placeholder:text-zinc-400"
            />
            <button
              type="submit"
              aria-label="Search products"
              className="inline-flex w-14 items-center justify-center bg-pink-500 text-white transition-colors hover:bg-pink-600"
            >
              <Search size={20} />
            </button>
          </div>
        </form>

        <div className="border-t border-pink-100 px-4 py-3 md:hidden sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                setMobileSiteMenuOpen(false);
                setMobileCategoryMenuOpen((value) => !value);
              }}
              className="inline-flex shrink-0 items-center justify-center text-pink-400 transition-colors hover:text-pink-600"
              aria-label={mobileCategoryMenuOpen ? "Close product categories" : "Open product categories"}
            >
              {mobileCategoryMenuOpen ? <X size={28} strokeWidth={1.6} /> : <Menu size={28} />}
            </button>

            <div className="min-w-0 flex-1">
              <span className="block text-[28px] font-normal tracking-tight text-zinc-800">All Products</span>
            </div>

            <button
              type="button"
              onClick={() => {
                setMobileCategoryMenuOpen(false);
                setMobileSiteMenuOpen((value) => !value);
              }}
              className={cn("inline-flex shrink-0 items-center justify-center transition-colors hover:text-pink-600", mobileSiteMenuOpen ? "text-pink-500" : "text-pink-400")}
              aria-label={mobileSiteMenuOpen ? "Close site menu" : "Open site menu"}
            >
              {mobileSiteMenuOpen ? <X size={28} strokeWidth={1.6} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        <div
          className={cn(
            "border-t border-pink-100 bg-white px-4 md:hidden sm:px-6 overflow-hidden transition-[max-height,opacity,padding] duration-500 ease-out",
            mobileMenuOpen ? "max-h-112 pb-2 opacity-100" : "max-h-0 pb-0 opacity-0 pointer-events-none"
          )}
        >
          <div className="pt-0.5">
            {mobileCategoryMenuOpen ? (
              <div>
                <div className="pt-1">
                  {PRODUCT_CATEGORIES.map((category) => {
                    const href = `/category/${category}`;
                    const isActive = pathname.startsWith(href);

                    return (
                      <Link key={category} href={href} onClick={closeMobileMenus} className={cn(mobileDrawerItemClass, isActive ? "text-pink-600" : "text-zinc-800")}>
                        <span className={mobileDrawerTextClass}>{CATEGORY_LABELS[category]}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {mobileSiteMenuOpen ? (
              <div>
                <div className="pt-1">
                  {siteMenuItems.map((item) => (
                    <button key={item.label} type="button" onClick={closeMobileMenus} className={cn(mobileDrawerItemClass, "text-zinc-800 hover:text-zinc-950")}>
                      <span className={mobileDrawerTextClass}>{item.label}</span>
                      {item.expandable ? <span className="ml-3 inline-flex h-9 w-9 shrink-0 items-center justify-center bg-pink-500 text-[20px] leading-none text-white">+</span> : null}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <MobileCategorySection />
    </header>
  );
}
