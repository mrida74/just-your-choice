"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Boxes,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
} from "lucide-react";

import AdminSignOutButton from "@/components/AdminSignOutButton";

type AdminShellProps = {
  children: ReactNode;
};

export default function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const showChrome =
    pathname !== "/admin/login" && !pathname.startsWith("/admin/invitation");

  const navSections = [
    {
      title: "Dashboard",
      items: [
        {
          label: "Overview",
          href: "/admin",
          icon: LayoutDashboard,
        },
        {
          label: "Analytics",
          href: "/admin/analytics",
          icon: BarChart3,
          comingSoon: true,
        },
      ],
    },
    {
      title: "Commerce",
      items: [
        {
          label: "Products",
          href: "/admin/products",
          icon: Package,
        },
        {
          label: "Orders",
          href: "/admin/orders",
          icon: ShoppingBag,
        },
        {
          label: "Inventory",
          href: "/admin/inventory",
          icon: Boxes,
        },
        {
          label: "Customers",
          href: "/admin/customers",
          icon: Users,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      {showChrome ? (
        <div className="flex min-h-screen flex-col lg:flex-row">
          <aside className="border-b border-zinc-200 bg-white/95 px-4 py-6 backdrop-blur lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:border-b-0 lg:border-r lg:px-6">
            <div className="flex items-center justify-between gap-3 lg:flex-col lg:items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-pink-600">
                  Admin Area
                </p>
                <h1 className="text-xl font-black text-zinc-900">Just Your Choice</h1>
                <p className="mt-1 text-sm text-zinc-500">Luxury commerce console</p>
              </div>
              <div className="flex items-center gap-2 lg:hidden">
                <Link
                  href="/"
                  className="rounded-lg border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-700 transition-colors hover:border-pink-300 hover:text-pink-700"
                >
                  View store
                </Link>
                <AdminSignOutButton />
              </div>
            </div>

            <div className="mt-6 space-y-6">
              {navSections.map((section) => (
                <div key={section.title}>
                  <p className="px-3 text-xs font-semibold uppercase tracking-[0.3em] text-zinc-400">
                    {section.title}
                  </p>
                  <div className="mt-3 space-y-1">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive =
                        pathname === item.href || pathname.startsWith(`${item.href}/`);

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center justify-between rounded-2xl px-3 py-2 text-sm font-semibold transition-colors ${
                            isActive
                              ? "bg-pink-600 text-white"
                              : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            <span
                              className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                                isActive
                                  ? "bg-white/20 text-white"
                                  : "bg-zinc-100 text-zinc-500"
                              }`}
                            >
                              <Icon size={18} />
                            </span>
                            {item.label}
                          </span>
                          {item.comingSoon ? (
                            <span className="rounded-full bg-zinc-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                              Soon
                            </span>
                          ) : null}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 hidden flex-col gap-3 lg:flex">
              <Link
                href="/"
                className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:border-pink-300 hover:text-pink-700"
              >
                View store
              </Link>
              <AdminSignOutButton />
            </div>
          </aside>

          <div className="flex-1">
            <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/95 backdrop-blur">
              <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-10">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-pink-600">
                    Command Center
                  </p>
                  <h2 className="text-lg font-bold text-zinc-900">Admin Dashboard</h2>
                </div>
                <div className="hidden items-center gap-3 lg:flex">
                  <AdminSignOutButton />
                </div>
              </div>
            </header>

            <main className="px-4 py-6 sm:px-6 lg:px-10">{children}</main>
          </div>
        </div>
      ) : null}
      {!showChrome ? <main>{children}</main> : null}
    </div>
  );
}