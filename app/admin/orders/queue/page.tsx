export default function AdminOrderQueuePage() {
  return (
    <div className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">Orders</p>
      <h1 className="mt-2 text-2xl font-black text-zinc-900">Fulfillment queue</h1>
      <p className="mt-2 text-sm text-zinc-600">
        This queue will drive batch processing, packing slips, and shipment updates.
      </p>
      <p className="mt-4 text-sm text-zinc-500">Coming soon.</p>
    </div>
  );
}
