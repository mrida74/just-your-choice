import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import AdminPanel from "@/components/AdminPanel";
import { getAdminFromToken } from "@/lib/admin-auth";
import { getProducts } from "@/lib/product-service";

export const metadata: Metadata = {
  title: "Admin Panel | Just Your Choice",
  description: "Manage products by category and add inventory with strict category controls.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  const admin = token ? await getAdminFromToken(token) : null;

  if (!admin) {
    redirect("/admin/login");
  }

  const products = await getProducts({ limit: 200 });

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-[0_20px_45px_-30px_rgba(236,72,153,0.45)] backdrop-blur">
        <div className="absolute inset-0 bg-linear-to-br from-pink-50 via-white to-white" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-pink-600">
              Admin Console
            </p>
            <h1 className="text-3xl font-black tracking-tight text-gray-900">
              Welcome back{admin?.name ? `, ${admin.name}` : ""}
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-gray-600">
              Manage products, review orders, and keep inventory moving from one focused workspace.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-pink-100 bg-white px-4 py-3 shadow-sm">
              <div className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500">Products</div>
              <div className="mt-1 text-2xl font-black text-gray-900">{products.length}</div>
            </div>
            <div className="rounded-2xl border border-pink-100 bg-white px-4 py-3 shadow-sm">
              <div className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500">Status</div>
              <div className="mt-1 text-2xl font-black text-emerald-600">Online</div>
            </div>
            <div className="rounded-2xl border border-pink-100 bg-white px-4 py-3 shadow-sm">
              <div className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500">Access</div>
              <div className="mt-1 text-2xl font-black text-gray-900">Admin</div>
            </div>
            <div className="rounded-2xl border border-pink-100 bg-white px-4 py-3 shadow-sm">
              <div className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500">Mode</div>
              <div className="mt-1 text-2xl font-black text-gray-900">Live</div>
            </div>
          </div>
        </div>
      </section>

      <AdminPanel products={products} />
    </div>
  );
}
