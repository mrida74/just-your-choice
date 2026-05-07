"use client";

import { useEffect, useState } from "react";
import type { ShippingItem } from "@/types/shipping";

type ShippingStats = {
  totalShipments: number;
  byCarrier: Record<string, number>;
  byStatus: Record<string, number>;
};

export default function ShippingManager() {
  const [shipping, setShipping] = useState<ShippingItem[]>([]);
  const [stats, setStats] = useState<ShippingStats | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(50);

  // Filters
  const [carrierFilter, setCarrierFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchShipping = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("skip", skip.toString());
      params.append("limit", limit.toString());
      params.append("includeStats", "true");
      if (carrierFilter) params.append("carrier", carrierFilter);
      if (statusFilter) params.append("status", statusFilter);

      const res = await fetch(`/api/admin/shipping?${params}`);
      const data = await res.json();
      setShipping(data.shipping || []);
      setTotal(data.total || 0);
      setStats(data.stats || null);
    } catch (err) {
      console.error("Failed to fetch shipping:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipping();
  }, [skip, carrierFilter, statusFilter]);

  const handleMarkDelivered = async (shippingId: string) => {
    try {
      const res = await fetch(`/api/admin/shipping/${shippingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markDelivered: true }),
      });
      if (res.ok) {
        fetchShipping();
      }
    } catch (err) {
      console.error("Failed to mark as delivered:", err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "in_transit":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return "—";
    return new Date(isoString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">Shipping</p>
          <h1 className="mt-2 text-2xl font-black text-zinc-900">Shipping & Tracking</h1>
          <p className="mt-1 text-sm text-zinc-600">Manage shipments and track deliveries.</p>
        </div>
      </section>

      {/* Stats Cards */}
      {stats && (
        <section className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900">Overview</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">Total Shipments</p>
              <p className="mt-2 text-2xl font-bold text-zinc-900">{stats.totalShipments}</p>
            </div>

            {Object.entries(stats.byStatus).slice(0, 3).map(([status, count]) => (
              <div key={status} className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">{status.replace(/_/g, " ")}</p>
                <p className="mt-2 text-2xl font-bold text-zinc-900">{count}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Filters */}
      <section className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900">Filters</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <select
            value={carrierFilter}
            onChange={(e) => {
              setCarrierFilter(e.target.value);
              setSkip(0);
            }}
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none"
          >
            <option value="">All Carriers</option>
            <option value="fedex">FedEx</option>
            <option value="ups">UPS</option>
            <option value="usps">USPS</option>
            <option value="dhl">DHL</option>
            <option value="other">Other</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setSkip(0);
            }}
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="in_transit">In Transit</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <button
            onClick={() => {
              setCarrierFilter("");
              setStatusFilter("");
              setSkip(0);
            }}
            className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
          >
            Clear Filters
          </button>
        </div>
      </section>

      {/* Shipments Table */}
      <section className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-zinc-600">
            Showing {shipping.length} of {total} shipments
          </p>
          {loading && <span className="text-xs text-zinc-500">Loading...</span>}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-max text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-500">
                <th className="py-3">Tracking #</th>
                <th className="py-3">Carrier</th>
                <th className="py-3">Status</th>
                <th className="py-3">Est. Delivery</th>
                <th className="py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shipping.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-sm text-zinc-500">
                    No shipments found.
                  </td>
                </tr>
              ) : (
                shipping.map((item) => (
                  <tr key={item.id} className="border-b border-zinc-100 last:border-b-0">
                    <td className="py-4 font-semibold text-zinc-900">{item.trackingNumber}</td>
                    <td className="py-4 text-sm text-zinc-600">{item.carrier.toUpperCase()}</td>
                    <td className="py-4">
                      <span className={`inline-block rounded-lg px-2 py-1 text-xs font-semibold ${getStatusColor(item.status)}`}>
                        {item.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-4 text-sm text-zinc-600">{formatDate(item.estimatedDelivery)}</td>
                    <td className="py-4 text-right">
                      {item.status !== "delivered" && (
                        <button
                          onClick={() => handleMarkDelivered(item.id)}
                          className="rounded-lg border border-green-300 px-3 py-1 text-xs font-semibold text-green-700 hover:bg-green-50"
                        >
                          Mark Delivered
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
        {total > limit && (
          <div className="mt-6 flex items-center justify-between border-t border-zinc-200 pt-6">
            <div className="text-sm text-zinc-600">
              Page {Math.floor(skip / limit) + 1} of {Math.ceil(total / limit)}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setSkip(Math.max(0, skip - limit))}
                disabled={skip === 0}
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setSkip(skip + limit)}
                disabled={skip + limit >= total}
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
