import Link from "next/link";
import { getCoupons } from "@/lib/coupon-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminCouponsPage() {
  const coupons = await getCoupons();

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">Coupons</p>
            <h1 className="mt-2 text-2xl font-black text-zinc-900">Coupons & Discounts</h1>
            <p className="mt-1 text-sm text-zinc-600">Create and manage promotional codes.</p>
          </div>
          <Link
            href="/admin/coupons/new"
            className="inline-flex items-center justify-center rounded-2xl bg-pink-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-pink-700"
          >
            Add coupon
          </Link>
        </div>
      </section>

      <section className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-500">
                <th className="py-3">Code</th>
                <th className="py-3">Type</th>
                <th className="py-3">Amount</th>
                <th className="py-3">Active</th>
                <th className="py-3">Expiry</th>
                <th className="py-3">Usage</th>
                <th className="py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-sm text-zinc-500">
                    No coupons created yet.
                  </td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c.id} className="border-b border-zinc-100 last:border-b-0">
                    <td className="py-4 font-mono font-semibold text-zinc-900">{c.code}</td>
                    <td className="py-4 text-zinc-600">{c.type}</td>
                    <td className="py-4 font-semibold text-zinc-900">{c.type === "percentage" ? `${c.amount}%` : c.amount}</td>
                    <td className="py-4">{c.active ? "Yes" : "No"}</td>
                    <td className="py-4 text-sm text-zinc-500">
                      {c.expiryDate ? new Date(c.expiryDate).toLocaleDateString() : "—"}
                    </td>
                    <td className="py-4">{c.usageCount ?? 0}{c.usageLimit ? ` / ${c.usageLimit}` : ""}</td>
                    <td className="py-4 text-right">
                      <Link
                        href={`/admin/coupons/${encodeURIComponent(c.code)}`}
                        className="inline-flex items-center rounded-xl border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-600 transition-colors hover:border-pink-200 hover:text-pink-600 hover:bg-pink-50"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
