import type { Metadata } from "next";
import CategoryNavbar from "@/components/CategoryNavbar";
import ClientOnly from "@/components/ClientOnly";
import MobileFooterNav from "@/components/MobileFooterNav";
import PageTransition from "@/components/PageTransition";
import AuthProvider from "@/components/AuthProvider";
import "./globals.css";



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
      className={`h-full antialiased`}
    >
      <body className="min-h-full bg-pink-50/60 text-zinc-900">
        <ClientOnly>
          <AuthProvider>
            <div className="app-shell-gradient min-h-full">
              <CategoryNavbar />
              <MobileFooterNav />
              <PageTransition>
                <main className="flex min-h-[calc(100vh-64px)] flex-col pb-36 md:pb-0">{children}</main>
              </PageTransition>
            </div>
          </AuthProvider>
        </ClientOnly>
      </body>
    </html>
  );
}
