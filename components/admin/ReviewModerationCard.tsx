"use client";

import { useState } from "react";
import type { ReviewItem } from "@/types/review";

type Props = {
  review: ReviewItem;
  onApprove?: (id: string) => void;
  onReject?: (id: string, reason: string) => void;
  onDelete?: (id: string) => void;
  onFeatureToggle?: (id: string) => void;
};

export default function ReviewModerationCard({ review, onApprove, onReject, onDelete, onFeatureToggle }: Props) {
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  const handleReject = () => {
    if (!rejectReason.trim()) return;
    onReject?.(review.id, rejectReason);
    setRejectReason("");
    setShowRejectForm(false);
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold text-zinc-900">{review.guestName || review.userId}</div>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={i < review.rating ? "text-yellow-500" : "text-zinc-300"}>
                  ★
                </span>
              ))}
            </div>
          </div>
          {review.title && <h3 className="mt-2 font-semibold text-zinc-900">{review.title}</h3>}
          {review.content && <p className="mt-1 text-sm text-zinc-600">{review.content}</p>}
          <div className="mt-2 flex gap-2 text-xs text-zinc-500">
            <span>{new Date(review.createdAt || "").toLocaleDateString()}</span>
            {review.status === "pending" && <span className="rounded bg-yellow-50 px-2 py-1 text-yellow-700">Pending</span>}
            {review.status === "approved" && <span className="rounded bg-green-50 px-2 py-1 text-green-700">Approved</span>}
            {review.featured && <span className="rounded bg-blue-50 px-2 py-1 text-blue-700">Featured</span>}
          </div>
        </div>
      </div>

      {review.status === "pending" && (
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => onApprove?.(review.id)}
            className="inline-flex rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700"
          >
            Approve
          </button>
          <button
            onClick={() => setShowRejectForm(!showRejectForm)}
            className="inline-flex rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
          >
            Reject
          </button>
          <button
            onClick={() => onDelete?.(review.id)}
            className="inline-flex rounded-lg border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-50"
          >
            Delete
          </button>
        </div>
      )}

      {review.status === "approved" && (
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => onFeatureToggle?.(review.id)}
            className={`inline-flex rounded-lg px-3 py-2 text-xs font-semibold ${
              review.featured
                ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                : "border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            {review.featured ? "Unfeature" : "Feature"}
          </button>
          <button
            onClick={() => onDelete?.(review.id)}
            className="inline-flex rounded-lg border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-50"
          >
            Delete
          </button>
        </div>
      )}

      {showRejectForm && (
        <div className="mt-4 space-y-2">
          <input
            type="text"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Rejection reason (visible to customer)"
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none"
          />
          <div className="flex gap-2">
            <button
              onClick={handleReject}
              className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
            >
              Reject
            </button>
            <button
              onClick={() => setShowRejectForm(false)}
              className="rounded-lg border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
