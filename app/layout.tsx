import type { Metadata } from "next";
import ClientOnly from "@/components/ClientOnly";
import AuthProvider from "@/components/AuthProvider";
import RouteShell from "@/components/RouteShell";
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
            <RouteShell>{children}</RouteShell>
          </AuthProvider>
        </ClientOnly>
      </body>
    </html>
  );
}
