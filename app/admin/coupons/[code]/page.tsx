import { getCouponByCode } from "@/lib/coupon-service";
import CouponForm from "@/components/admin/CouponForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EditCouponPage({ params }: { params: { code: string } }) {
  const coupon = await getCouponByCode(params.code);

  if (!coupon) {
    return (
      <div className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm">Coupon not found.</div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">Edit</p>
          <h1 className="mt-2 text-2xl font-black text-zinc-900">Edit coupon</h1>
        </div>
      </section>

      <section className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
        <CouponForm initial={coupon} />
      </section>
    </div>
  );
}
