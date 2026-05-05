"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import CategoryNavbar from "@/components/CategoryNavbar";
import MobileFooterNav from "@/components/MobileFooterNav";
import PageTransition from "@/components/PageTransition";

type RouteShellProps = {
  children: ReactNode;
};

export default function RouteShell({ children }: RouteShellProps) {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return <>{children}</>;
  }

  return (
    <div className="app-shell-gradient min-h-full">
      <CategoryNavbar />
      <MobileFooterNav />
      <PageTransition>
        <main className="flex min-h-[calc(100vh-64px)] flex-col pb-36 md:pb-0">{children}</main>
      </PageTransition>
    </div>
  );
}