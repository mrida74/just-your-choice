"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

import StatusBadge from "@/components/admin/StatusBadge";

const STATUS_FLOW: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

type OrderDetailActionsProps = {
  orderId: string;
  status: string;
};

export default function OrderDetailActions({ orderId, status }: OrderDetailActionsProps) {
  const router = useRouter();
  const [nextStatus, setNextStatus] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const allowedTransitions = useMemo(() => STATUS_FLOW[status] || [], [status]);

  const handleUpdate = async () => {
    if (!nextStatus) return;
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await response.json();
      if (!response.ok) {
        setMessage(data?.error || "Failed to update status.");
        return;
      }

      setMessage("Order status updated.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Update failed.");
    } finally {
      setSaving(false);
      setNextStatus("");
    }
  };

  return (
    <div className="rounded-3xl border border-pink-100 bg-white/90 p-5 shadow-sm backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
            Workflow
          </p>
          <p className="mt-2 text-lg font-bold text-zinc-900">Order status</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge label={STATUS_LABELS[status] || status} />
            <span className="text-xs text-zinc-400">{orderId}</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => router.refresh()}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-600 transition-colors hover:border-pink-200 hover:text-pink-600 hover:bg-pink-50"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
        <select
          value={nextStatus}
          onChange={(event) => setNextStatus(event.target.value)}
          disabled={allowedTransitions.length === 0}
          className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none transition-colors focus:border-pink-500 focus:bg-white disabled:cursor-not-allowed disabled:opacity-70"
        >
          <option value="">Select next status</option>
          {allowedTransitions.map((option) => (
            <option key={option} value={option}>
              {STATUS_LABELS[option] || option}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleUpdate}
          disabled={!nextStatus || saving}
          className="inline-flex items-center justify-center rounded-2xl bg-pink-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Updating..." : "Update"}
        </button>
      </div>

      {message ? (
        <div className="mt-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-600">
          {message}
        </div>
      ) : null}
    </div>
  );
}
