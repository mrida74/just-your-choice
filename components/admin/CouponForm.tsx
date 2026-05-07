"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CouponPayload, CouponItem } from "@/types/coupon";

type Props = {
  initial?: Partial<CouponItem>;
  isNew?: boolean;
};

export default function CouponForm({ initial = {}, isNew = false }: Props) {
  const router = useRouter();
  const [code, setCode] = useState(initial.code ?? "");
  const [description, setDescription] = useState(initial.description ?? "");
  const [type, setType] = useState<"percentage" | "fixed">((initial.type as any) ?? "percentage");
  const [amount, setAmount] = useState(String(initial.amount ?? ""));
  const [currency, setCurrency] = useState(initial.currency ?? "");
  const [appliesToType, setAppliesToType] = useState<"all" | "categories" | "products">(
    (initial.appliesTo?.type as any) ?? "all"
  );
  const [appliesToList, setAppliesToList] = useState((initial.appliesTo?.categories ?? []).join(", ") || (initial.appliesTo?.products ?? []).join(", ") || "");
  const [startDate, setStartDate] = useState(initial.startDate ?? "");
  const [expiryDate, setExpiryDate] = useState(initial.expiryDate ?? "");
  const [usageLimit, setUsageLimit] = useState(String(initial.usageLimit ?? ""));
  const [perCustomerLimit, setPerCustomerLimit] = useState(String(initial.perCustomerLimit ?? ""));
  const [active, setActive] = useState(initial.active ?? true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const payload: CouponPayload = {
      code: code.trim(),
      description: description.trim() || undefined,
      type,
      amount: Number(amount) || 0,
      currency: currency.trim() || undefined,
      appliesTo:
        appliesToType === "all"
          ? { type: "all" }
          : appliesToType === "categories"
          ? { type: "categories", categories: appliesToList.split(",").map((s) => s.trim()).filter(Boolean) }
          : { type: "products", products: appliesToList.split(",").map((s) => s.trim()).filter(Boolean) },
      startDate: startDate || undefined,
      expiryDate: expiryDate || undefined,
      usageLimit: usageLimit ? Number(usageLimit) : undefined,
      perCustomerLimit: perCustomerLimit ? Number(perCustomerLimit) : undefined,
      active,
    };

    try {
      const url = isNew ? "/api/admin/coupons" : `/api/admin/coupons/${encodeURIComponent(code)}`;
      const method = isNew ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data?.error || "Save failed");
        return;
      }
      router.push("/admin/coupons");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">Coupon</p>
          <h1 className="mt-2 text-2xl font-black text-zinc-900">{isNew ? "Create coupon" : `Edit ${code}`}</h1>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <input required value={code} onChange={(e) => setCode(e.target.value)} placeholder="Code (e.g. SPRING20)" className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none" />
          <select value={type} onChange={(e) => setType(e.target.value as any)} className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none">
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed amount</option>
          </select>
          <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none" />
          <input value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="Currency (optional)" className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none" />
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="md:col-span-2 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none" />
          <div className="md:col-span-2 grid gap-2">
            <label className="text-xs text-zinc-600">Applies to</label>
            <div className="flex gap-2">
              <select value={appliesToType} onChange={(e) => setAppliesToType(e.target.value as any)} className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none">
                <option value="all">All</option>
                <option value="categories">Categories (comma-separated slugs)</option>
                <option value="products">Products (comma-separated ids)</option>
              </select>
              <input value={appliesToList} onChange={(e) => setAppliesToList(e.target.value)} placeholder="categories or product ids" className="flex-1 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none" />
            </div>
          </div>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none" />
          <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none" />
          <input value={usageLimit} onChange={(e) => setUsageLimit(e.target.value)} placeholder="Usage limit (total)" className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none" />
          <input value={perCustomerLimit} onChange={(e) => setPerCustomerLimit(e.target.value)} placeholder="Per-customer limit" className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none" />
          <label className="md:col-span-2 flex items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-700">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-4 w-4 rounded border-zinc-300 text-pink-600" />
            Active
          </label>
        </div>
      </section>

      {message ? <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-600">{message}</div> : null}

      <div className="flex items-center justify-end gap-3">
        <button type="submit" disabled={saving} className="inline-flex items-center justify-center rounded-2xl bg-pink-600 px-5 py-3 text-sm font-semibold text-white">
          {saving ? "Saving..." : isNew ? "Create coupon" : "Save coupon"}
        </button>
      </div>
    </form>
  );
}
