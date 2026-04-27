import type { Metadata } from "next";

import AdminPanel from "@/components/AdminPanel";
import { getProducts } from "@/lib/product-service";

export const metadata: Metadata = {
  title: "Admin Panel | Just Your Choice",
  description: "Manage products by category and add inventory with strict category controls.",
};

export default async function AdminPage() {
  const products = await getProducts({ limit: 200 });

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-3xl bg-gradient-to-r from-pink-100 via-pink-50 to-rose-100 p-6 shadow-sm">
        <h1 className="text-3xl font-black tracking-tight text-zinc-900">Admin Dashboard</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Add products with required category selection and manage inventory per section.
        </p>
      </section>
      <AdminPanel products={products} />
    </div>
  );
}
