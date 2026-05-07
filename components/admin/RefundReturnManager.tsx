"use client";

import { useEffect, useState } from "react";
import type { RefundItem, ReturnItem } from "@/types/refund";

type RefundStats = {
  totalRefunds: number;
  totalAmount: number;
  byStatus: Record<string, number>;
};

type ReturnStats = {
  totalReturns: number;
  byStatus: Record<string, number>;
};

type Tab = "refunds" | "returns";

export default function RefundReturnManager() {
  const [activeTab, setActiveTab] = useState<Tab>("refunds");

  // Refunds
  const [refunds, setRefunds] = useState<RefundItem[]>([]);
  const [refundStats, setRefundStats] = useState<RefundStats | null>(null);
  const [refundTotal, setRefundTotal] = useState(0);
  const [refundLoading, setRefundLoading] = useState(false);
  const [refundSkip, setRefundSkip] = useState(0);
  const refundLimit = 50;

  // Returns
  const [returns, setReturns] = useState<ReturnItem[]>([]);
  const [returnStats, setReturnStats] = useState<ReturnStats | null>(null);
  const [returnTotal, setReturnTotal] = useState(0);
  const [returnLoading, setReturnLoading] = useState(false);
  const [returnSkip, setReturnSkip] = useState(0);
  const returnLimit = 50;

  // Filters
  const [refundStatus, setRefundStatus] = useState("");
  const [returnStatus, setReturnStatus] = useState("");

  const fetchRefunds = async () => {
    setRefundLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("skip", refundSkip.toString());
      params.append("limit", refundLimit.toString());
      params.append("includeStats", "true");
      if (refundStatus) params.append("status", refundStatus);

      const res = await fetch(`/api/admin/refunds?${params}`);
      const data = await res.json();
      setRefunds(data.refunds || []);
      setRefundTotal(data.total || 0);
      setRefundStats(data.stats || null);
    } catch (err) {
      console.error("Failed to fetch refunds:", err);
    } finally {
      setRefundLoading(false);
    }
  };

  const fetchReturns = async () => {
    setReturnLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("skip", returnSkip.toString());
      params.append("limit", returnLimit.toString());
      params.append("includeStats", "true");
      if (returnStatus) params.append("status", returnStatus);

      const res = await fetch(`/api/admin/returns?${params}`);
      const data = await res.json();
      setReturns(data.returns || []);
      setReturnTotal(data.total || 0);
      setReturnStats(data.stats || null);
    } catch (err) {
      console.error("Failed to fetch returns:", err);
    } finally {
      setReturnLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, [refundSkip, refundStatus]);

  useEffect(() => {
    fetchReturns();
  }, [returnSkip, returnStatus]);

  const handleUpdateRefundStatus = async (refundId: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/refunds/${refundId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchRefunds();
      }
    } catch (err) {
      console.error("Failed to update refund:", err);
    }
  };

  const handleUpdateReturnStatus = async (returnId: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/returns/${returnId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchReturns();
      }
    } catch (err) {
      console.error("Failed to update return:", err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "received":
        return "bg-green-100 text-green-800";
      case "approved":
      case "processing":
      case "in_transit":
        return "bg-blue-100 text-blue-800";
      case "pending":
      case "initiated":
      case "inspected":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return "—";
    return new Date(isoString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">Orders</p>
          <h1 className="mt-2 text-2xl font-black text-zinc-900">Refunds & Returns</h1>
          <p className="mt-1 text-sm text-zinc-600">Manage customer refunds and return requests.</p>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
        <div className="flex gap-2 border-b border-zinc-200">
          <button
            onClick={() => setActiveTab("refunds")}
            className={`px-4 py-3 text-sm font-semibold transition-colors ${
              activeTab === "refunds"
                ? "border-b-2 border-pink-600 text-pink-600"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            Refunds
          </button>
          <button
            onClick={() => setActiveTab("returns")}
            className={`px-4 py-3 text-sm font-semibold transition-colors ${
              activeTab === "returns"
                ? "border-b-2 border-pink-600 text-pink-600"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            Returns
          </button>
        </div>
      </section>

      {/* Refunds Tab */}
      {activeTab === "refunds" && (
        <>
          {/* Stats */}
          {refundStats && (
            <section className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
              <h2 className="mb-4 text-lg font-semibold text-zinc-900">Refund Summary</h2>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">Total Refunds</p>
                  <p className="mt-2 text-2xl font-bold text-zinc-900">{refundStats.totalRefunds}</p>
                </div>

                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">Total Amount</p>
                  <p className="mt-2 text-2xl font-bold text-zinc-900">{formatCurrency(refundStats.totalAmount)}</p>
                </div>

                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">Pending</p>
                  <p className="mt-2 text-2xl font-bold text-zinc-900">{refundStats.byStatus.pending || 0}</p>
                </div>
              </div>
            </section>
          )}

          {/* Filters */}
          <section className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900">Filters</h2>
            <div className="flex gap-3">
              <select
                value={refundStatus}
                onChange={(e) => {
                  setRefundStatus(e.target.value);
                  setRefundSkip(0);
                }}
                className="flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <button
                onClick={() => {
                  setRefundStatus("");
                  setRefundSkip(0);
                }}
                className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
              >
                Clear
              </button>
            </div>
          </section>

          {/* Refunds Table */}
          <section className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-zinc-600">
                Showing {refunds.length} of {refundTotal} refunds
              </p>
              {refundLoading && <span className="text-xs text-zinc-500">Loading...</span>}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-max text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-500">
                    <th className="py-3">Amount</th>
                    <th className="py-3">Reason</th>
                    <th className="py-3">Status</th>
                    <th className="py-3">Requested</th>
                    <th className="py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {refunds.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-sm text-zinc-500">
                        No refunds found.
                      </td>
                    </tr>
                  ) : (
                    refunds.map((refund) => (
                      <tr key={refund.id} className="border-b border-zinc-100 last:border-b-0">
                        <td className="py-4 font-semibold text-zinc-900">{formatCurrency(refund.refundAmount)}</td>
                        <td className="py-4 text-sm text-zinc-600">{refund.refundReason.replace(/_/g, " ")}</td>
                        <td className="py-4">
                          <span className={`inline-block rounded-lg px-2 py-1 text-xs font-semibold ${getStatusColor(refund.status)}`}>
                            {refund.status}
                          </span>
                        </td>
                        <td className="py-4 text-sm text-zinc-600">{formatDate(refund.requestedAt)}</td>
                        <td className="py-4 text-right">
                          {refund.status === "pending" && (
                            <button
                              onClick={() => handleUpdateRefundStatus(refund.id, "approved")}
                              className="rounded-lg border border-green-300 px-3 py-1 text-xs font-semibold text-green-700 hover:bg-green-50"
                            >
                              Approve
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {refundTotal > refundLimit && (
              <div className="mt-6 flex items-center justify-between border-t border-zinc-200 pt-6">
                <div className="text-sm text-zinc-600">
                  Page {Math.floor(refundSkip / refundLimit) + 1} of {Math.ceil(refundTotal / refundLimit)}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setRefundSkip(Math.max(0, refundSkip - refundLimit))}
                    disabled={refundSkip === 0}
                    className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setRefundSkip(refundSkip + refundLimit)}
                    disabled={refundSkip + refundLimit >= refundTotal}
                    className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </section>
        </>
      )}

      {/* Returns Tab */}
      {activeTab === "returns" && (
        <>
          {/* Stats */}
          {returnStats && (
            <section className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
              <h2 className="mb-4 text-lg font-semibold text-zinc-900">Return Summary</h2>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">Total Returns</p>
                  <p className="mt-2 text-2xl font-bold text-zinc-900">{returnStats.totalReturns}</p>
                </div>

                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">In Transit</p>
                  <p className="mt-2 text-2xl font-bold text-zinc-900">{returnStats.byStatus.in_transit || 0}</p>
                </div>

                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">Completed</p>
                  <p className="mt-2 text-2xl font-bold text-zinc-900">{returnStats.byStatus.completed || 0}</p>
                </div>
              </div>
            </section>
          )}

          {/* Filters */}
          <section className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900">Filters</h2>
            <div className="flex gap-3">
              <select
                value={returnStatus}
                onChange={(e) => {
                  setReturnStatus(e.target.value);
                  setReturnSkip(0);
                }}
                className="flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none"
              >
                <option value="">All Status</option>
                <option value="initiated">Initiated</option>
                <option value="approved">Approved</option>
                <option value="in_transit">In Transit</option>
                <option value="received">Received</option>
                <option value="completed">Completed</option>
              </select>

              <button
                onClick={() => {
                  setReturnStatus("");
                  setReturnSkip(0);
                }}
                className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
              >
                Clear
              </button>
            </div>
          </section>

          {/* Returns Table */}
          <section className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-zinc-600">
                Showing {returns.length} of {returnTotal} returns
              </p>
              {returnLoading && <span className="text-xs text-zinc-500">Loading...</span>}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-max text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-500">
                    <th className="py-3">Reason</th>
                    <th className="py-3">Status</th>
                    <th className="py-3">Initiated</th>
                    <th className="py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {returns.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-sm text-zinc-500">
                        No returns found.
                      </td>
                    </tr>
                  ) : (
                    returns.map((ret) => (
                      <tr key={ret.id} className="border-b border-zinc-100 last:border-b-0">
                        <td className="py-4 text-sm text-zinc-600">{ret.reason.replace(/_/g, " ")}</td>
                        <td className="py-4">
                          <span className={`inline-block rounded-lg px-2 py-1 text-xs font-semibold ${getStatusColor(ret.status)}`}>
                            {ret.status.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="py-4 text-sm text-zinc-600">{formatDate(ret.initiatedAt)}</td>
                        <td className="py-4 text-right">
                          {ret.status === "initiated" && (
                            <button
                              onClick={() => handleUpdateReturnStatus(ret.id, "approved")}
                              className="rounded-lg border border-blue-300 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                            >
                              Approve
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {returnTotal > returnLimit && (
              <div className="mt-6 flex items-center justify-between border-t border-zinc-200 pt-6">
                <div className="text-sm text-zinc-600">
                  Page {Math.floor(returnSkip / returnLimit) + 1} of {Math.ceil(returnTotal / returnLimit)}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setReturnSkip(Math.max(0, returnSkip - returnLimit))}
                    disabled={returnSkip === 0}
                    className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setReturnSkip(returnSkip + returnLimit)}
                    disabled={returnSkip + returnLimit >= returnTotal}
                    className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
