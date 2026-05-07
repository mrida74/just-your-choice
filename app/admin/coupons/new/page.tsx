import CouponForm from "@/components/admin/CouponForm";

export default function NewCouponPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">Create</p>
          <h1 className="mt-2 text-2xl font-black text-zinc-900">New coupon</h1>
          <p className="mt-1 text-sm text-zinc-600">Define discount codes and rules.</p>
        </div>
      </section>

      <section className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
        <CouponForm isNew />
      </section>
    </div>
  );
}
