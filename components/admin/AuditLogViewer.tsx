"use client";

import { useEffect, useState } from "react";
import type { AuditLogItem } from "@/types/audit-log";

type AuditStats = {
  actionCounts: Record<string, number>;
  resourceTypeCounts: Record<string, number>;
  topAdmins: Array<{ adminEmail: string; adminName: string; count: number }>;
};

export default function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [reauthing, setReauthing] = useState(false);
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(50);

  // Filters
  const [actionFilter, setActionFilter] = useState("");
  const [resourceTypeFilter, setResourceTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [adminFilter, setAdminFilter] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("skip", skip.toString());
      params.append("limit", limit.toString());
      params.append("includeStats", "true");
      if (actionFilter) params.append("action", actionFilter);
      if (resourceTypeFilter) params.append("resourceType", resourceTypeFilter);
      if (statusFilter) params.append("status", statusFilter);
      if (adminFilter) params.append("adminId", adminFilter);

      const res = await fetch(`/api/admin/audit-logs?${params}`);
      const data = await res.json();
      setLogs(data.logs || []);
      setTotal(data.total || 0);
      setStats(data.stats || null);
    } catch (err) {
      console.error("Failed to fetch audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [skip, actionFilter, resourceTypeFilter, statusFilter, adminFilter]);

  const buildCsv = (items: AuditLogItem[]) => {
    return [
      "Timestamp,Admin,Email,Action,Resource,Resource ID,Status",
      ...items.map((log) =>
        [
          new Date(log.createdAt).toLocaleString(),
          log.adminName,
          log.adminEmail,
          log.action,
          log.resourceType,
          log.resourceId,
          log.status,
        ]
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");
  };

  const downloadCsv = (csv: string) => {
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
    anchor.style.display = "none";

    document.body.appendChild(anchor);
    anchor.click();

    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      anchor.remove();
    }, 0);
  };

  const handleExport = async () => {
    setExporting(true);
    setExportError(null);

    try {
      const pageSize = 500;
      let exportSkip = 0;
      let collected: AuditLogItem[] = [];
      let expectedTotal: number | null = null;

      while (true) {
        const params = new URLSearchParams();
        params.append("skip", exportSkip.toString());
        params.append("limit", pageSize.toString());
        if (actionFilter) params.append("action", actionFilter);
        if (resourceTypeFilter) params.append("resourceType", resourceTypeFilter);
        if (statusFilter) params.append("status", statusFilter);
        if (adminFilter) params.append("adminId", adminFilter);

        const res = await fetch(`/api/admin/audit-logs?${params}`);
        const data = await res.json().catch(() => null);

        if (!res.ok) {
          console.error("Export API error", { status: res.status, body: data });
          throw new Error(data?.message || data?.error || `Failed to export audit logs (${res.status})`);
        }

        const pageLogs = Array.isArray(data?.logs) ? (data.logs as AuditLogItem[]) : [];
        const pageTotal = typeof data?.total === "number" ? data.total : null;

        if (expectedTotal === null && pageTotal !== null) {
          expectedTotal = pageTotal;
        }

        collected = collected.concat(pageLogs);
        exportSkip += pageLogs.length;

        if (pageLogs.length === 0) {
          break;
        }

        if (expectedTotal !== null && collected.length >= expectedTotal) {
          break;
        }
      }

      downloadCsv(buildCsv(collected.length > 0 ? collected : logs));
    } catch (err) {
      console.error("Failed to export logs:", err);
      const msg = err instanceof Error ? err.message : String(err);
      setExportError(msg);
      if (logs.length > 0) {
        downloadCsv(buildCsv(logs));
      }
      // If unauthorized, attempt re-auth flow automatically
      if (String(msg).toLowerCase().includes("unauthorized")) {
        try {
          setReauthing(true);
          const ok = await reauthAndWait();
          setReauthing(false);
          if (ok) {
            // retry export once
            handleExport();
          }
        } catch (reErr) {
          console.error("Reauth failed:", reErr);
          setReauthing(false);
        }
      }
    } finally {
      setExporting(false);
    }
  };

  // Open a login popup and poll /api/auth/session until authenticated or timeout
  const reauthAndWait = async (timeoutMs = 60000): Promise<boolean> => {
    // Open popup to /admin/login
    const popup = window.open("/admin/login", "_blank", "width=900,height=700");
    if (!popup) return false;

    const start = Date.now();
    return new Promise((resolve) => {
      const check = async () => {
        try {
          const res = await fetch("/api/auth/session");
          if (res.ok) {
            const body = await res.json().catch(() => null);
            // If session exists, consider authenticated
            if (body && (body.user || body.email || body.admin)) {
              try {
                popup.close();
              } catch {}
              resolve(true);
              return;
            }
          }
        } catch (e) {
          // ignore
        }

        if (Date.now() - start > timeoutMs) {
          try {
            popup.close();
          } catch {}
          resolve(false);
          return;
        }

        setTimeout(check, 1000);
      };

      check();
    });
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString();
  };

  const getActionBadgeColor = (action: string) => {
    if (action.includes("create") || action.includes("upload")) return "bg-green-100 text-green-800";
    if (action.includes("update")) return "bg-blue-100 text-blue-800";
    if (action.includes("delete")) return "bg-red-100 text-red-800";
    if (action.includes("export")) return "bg-purple-100 text-purple-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">Audit Logs</p>
            <h1 className="mt-2 text-2xl font-black text-zinc-900">Activity History</h1>
            <p className="mt-1 text-sm text-zinc-600">Track all admin actions and system events.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
            onClick={handleExport}
            disabled={exporting}
            className="inline-flex items-center justify-center rounded-2xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700"
          >
            {exporting ? "Exporting..." : "Export CSV"}
          </button>
            {exportError ? (
              <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">
                <strong className="font-semibold">{exportError}</strong>
                <span className="ml-2"> — <a href="/admin/login" className="underline">Sign in</a> and try again.</span>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      {stats && (
        <section className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900">Summary</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">Top Actions</p>
              <div className="mt-2 space-y-1 text-sm">
                {Object.entries(stats.actionCounts)
                  .slice(0, 3)
                  .map(([action, count]) => (
                    <div key={action} className="flex justify-between">
                      <span className="text-zinc-600">{action}</span>
                      <span className="font-semibold text-zinc-900">{count}</span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">Resources</p>
              <div className="mt-2 space-y-1 text-sm">
                {Object.entries(stats.resourceTypeCounts)
                  .slice(0, 3)
                  .map(([resource, count]) => (
                    <div key={resource} className="flex justify-between">
                      <span className="text-zinc-600">{resource}</span>
                      <span className="font-semibold text-zinc-900">{count}</span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">Top Admins</p>
              <div className="mt-2 space-y-1 text-sm">
                {stats.topAdmins.slice(0, 3).map((admin) => (
                  <div key={admin.adminEmail} className="flex justify-between">
                    <span className="truncate text-zinc-600">{admin.adminName}</span>
                    <span className="font-semibold text-zinc-900">{admin.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Filters */}
      <section className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900">Filters</h2>
        <div className="grid gap-3 md:grid-cols-4">
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setSkip(0);
            }}
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none"
          >
            <option value="">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="view">View</option>
            <option value="export">Export</option>
            <option value="approve">Approve</option>
            <option value="reject">Reject</option>
          </select>

          <select
            value={resourceTypeFilter}
            onChange={(e) => {
              setResourceTypeFilter(e.target.value);
              setSkip(0);
            }}
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none"
          >
            <option value="">All Resources</option>
            <option value="product">Product</option>
            <option value="order">Order</option>
            <option value="customer">Customer</option>
            <option value="coupon">Coupon</option>
            <option value="review">Review</option>
            <option value="admin">Admin</option>
            <option value="role">Role</option>
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
            <option value="success">Success</option>
            <option value="failed">Failed</option>
          </select>

          <button
            onClick={() => {
              setActionFilter("");
              setResourceTypeFilter("");
              setStatusFilter("");
              setAdminFilter("");
              setSkip(0);
            }}
            className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
          >
            Clear Filters
          </button>
        </div>
      </section>

      {/* Logs Table */}
      <section className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-zinc-600">
            Showing {logs.length} of {total} logs
          </p>
          {loading && <span className="text-xs text-zinc-500">Loading...</span>}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-max text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-500">
                <th className="py-3">Timestamp</th>
                <th className="py-3">Admin</th>
                <th className="py-3">Action</th>
                <th className="py-3">Resource</th>
                <th className="py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-sm text-zinc-500">
                    No logs found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="border-b border-zinc-100 last:border-b-0">
                    <td className="py-4 text-xs text-zinc-600">{formatDate(log.createdAt)}</td>
                    <td className="py-4 text-sm font-medium text-zinc-900">{log.adminName}</td>
                    <td className="py-4">
                      <span className={`inline-block rounded-lg px-2 py-1 text-xs font-semibold ${getActionBadgeColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-4 text-sm text-zinc-600">
                      <div>{log.resourceType}</div>
                      {log.resourceName && <div className="text-xs text-zinc-500">{log.resourceName}</div>}
                    </td>
                    <td className="py-4">
                      <span
                        className={`inline-block rounded-lg px-2 py-1 text-xs font-semibold ${
                          log.status === "success"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {log.status}
                      </span>
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
