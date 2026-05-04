import type { Metadata } from "next";
import { Geist, Geist_Mono, Pacifico } from "next/font/google";

import CategoryNavbar from "@/components/CategoryNavbar";
import ClientOnly from "@/components/ClientOnly";
import MobileFooterNav from "@/components/MobileFooterNav";
import PageTransition from "@/components/PageTransition";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
const pacifico = Pacifico({
  variable: "--font-pacifico",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: {
    default: "Just Your Choice | Women's Shopping",
    template: "%s | Just Your Choice",
  },
  description:
    "Shop curated women's products with dedicated sections for sarees, clothing, bags, cosmetics, and skincare.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${pacifico.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-pink-50/60 text-zinc-900">
        <ClientOnly>
          <div className="app-shell-gradient min-h-full">
            <CategoryNavbar />
            <MobileFooterNav />
            <PageTransition>
              <main className="flex min-h-[calc(100vh-64px)] flex-col pb-36 md:pb-0">{children}</main>
            </PageTransition>
          </div>
        </ClientOnly>
      </body>
    </html>
  );
}
