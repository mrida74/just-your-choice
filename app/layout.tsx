import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import CategoryNavbar from "@/components/CategoryNavbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-pink-50/60 text-zinc-900">
        <div className="app-shell-gradient min-h-full">
          <CategoryNavbar />
          <main className="flex min-h-[calc(100vh-64px)] flex-col">{children}</main>
        </div>
      </body>
    </html>
  );
}
