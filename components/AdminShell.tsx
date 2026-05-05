"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import AdminSignOutButton from "@/components/AdminSignOutButton";

type AdminShellProps = {
  children: ReactNode;
};

export default function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const showChrome = pathname !== "/admin/login";

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      {showChrome ? (
        <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-pink-600">
                Admin Area
              </p>
              <h1 className="text-lg font-bold text-zinc-900">Just Your Choice Admin</h1>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:border-pink-300 hover:text-pink-700"
              >
                View store
              </Link>
              <AdminSignOutButton />
            </div>
          </div>
        </header>
      ) : null}

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}