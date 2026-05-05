"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Heart, Home, ShoppingBag, ShoppingCart, User } from "lucide-react";
import { useSession } from "next-auth/react";

import { getCartCount } from "@/lib/cart";
import { cn } from "@/lib/utils";

export default function MobileFooterNav() {
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);
  const [navbarVisible, setNavbarVisible] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    const syncCartCount = () => setCartCount(getCartCount());

    syncCartCount();
    window.addEventListener("cart:updated", syncCartCount);

    return () => window.removeEventListener("cart:updated", syncCartCount);
  }, []);

  useEffect(() => {
    const navbar = document.getElementById("site-navbar-top");

    if (!navbar) {
      setNavbarVisible(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setNavbarVisible(entry.isIntersecting);
      },
      { threshold: 1 }
    );

    observer.observe(navbar);

    return () => observer.disconnect();
  }, []);

  const itemClass =
    "relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-center transition-colors";

  return (
    <nav
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 border-t border-pink-200 bg-pink-50 shadow-[0_-8px_16px_rgba(0,0,0,0.04)] md:hidden transition-all duration-300 ease-out",
        navbarVisible ? "pointer-events-none translate-y-full opacity-0" : "translate-y-0 opacity-100"
      )}
      aria-hidden={navbarVisible}
    >
      <div className="mx-auto grid max-w-7xl grid-cols-5 px-2">
        <Link
          href="/"
          className={cn(itemClass, pathname === "/" ? "text-pink-600" : "text-zinc-600")}
          aria-label="Home"
        >
          <Home size={24} strokeWidth={2.4} />
          <span className="text-[13px] font-semibold leading-none">Home</span>
        </Link>

        <Link
          href="/"
          className={cn(itemClass, pathname.startsWith("/category") ? "text-pink-600" : "text-zinc-600")}
          aria-label="Shop"
        >
          <ShoppingBag size={24} strokeWidth={2.2} />
          <span className="text-[13px] font-semibold leading-none">Shop</span>
        </Link>

        <Link
          href="/cart"
          className={cn(itemClass, pathname === "/cart" ? "text-pink-600" : "text-zinc-600")}
          aria-label="Cart"
        >
          <span className="relative inline-flex items-center justify-center">
            <ShoppingCart size={24} strokeWidth={2.2} />
            <span className="absolute -right-2 -top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-pink-600 px-0.5 text-[10px] font-bold leading-none text-white">
              {cartCount}
            </span>
          </span>
          <span className="text-[13px] font-semibold leading-none">Cart</span>
        </Link>

        <button type="button" aria-label="Wishlist" className={cn(itemClass, "text-zinc-600")}>
          <span className="relative inline-flex items-center justify-center">
            <Heart size={24} strokeWidth={2.2} />
            <span className="absolute -right-2 -top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-zinc-500 px-0.5 text-[10px] font-bold leading-none text-white">
              0
            </span>
          </span>
          <span className="text-[13px] font-semibold leading-none">Wishlist</span>
        </button>

        <Link
          href={session ? "/account" : "/login"}
          className={cn(itemClass, pathname === "/login" || pathname === "/account" ? "text-pink-600" : "text-zinc-600")}
          aria-label="Account"
          title="Account"
        >
          {session?.user?.image ? (
            <img src={session.user.image} alt={session.user.name ?? "Avatar"} className="h-6 w-6 rounded-full object-cover" />
          ) : session?.user?.name ? (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-pink-50 text-pink-600 font-semibold text-sm">
              {session.user.name.charAt(0).toUpperCase()}
            </div>
          ) : (
            <User size={24} strokeWidth={2.2} />
          )}
          <span className="text-[13px] font-semibold leading-none">Account</span>
        </Link>
      </div>
    </nav>
  );
}