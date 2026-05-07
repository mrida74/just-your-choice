"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

type AdminItem = {
  id: string;
  email: string;
  name?: string;
  role?: string;
  roleId?: string | null;
  account_status?: string;
};

export default function AdminsList() {
  const [admins, setAdmins] = useState<AdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function fetchAdmins() {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/admins", { credentials: "include" });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.message || body?.error || `Status ${res.status}`);
        }
        const data = await res.json();
        if (!mounted) return;
        setAdmins(data.admins || []);
      } catch (err: any) {
        console.error("Failed to load admins:", err);
        setError(err?.message || String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchAdmins();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div className="py-6 text-center text-zinc-500">Loading admins...</div>;
  if (error) return <div className="py-6 text-center text-red-600">Error: {error}</div>;

  if (admins.length === 0) return <div className="py-6 text-center text-zinc-500">No admins found.</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-max text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-200 text-zinc-500">
            <th className="py-3">Email</th>
            <th className="py-3">Name</th>
            <th className="py-3">Role</th>
            <th className="py-3">Role Id</th>
            <th className="py-3">Status</th>
            <th className="py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {admins.map((a) => (
            <tr key={a.id} className="border-b border-zinc-100 last:border-b-0">
              <td className="py-4 font-semibold text-zinc-900">{a.email}</td>
              <td className="py-4 text-sm text-zinc-600">{a.name || "—"}</td>
              <td className="py-4 text-sm text-zinc-600">{a.role || "—"}</td>
              <td className="py-4 text-sm text-zinc-600">
                {a.roleId ? (
                  <Link href={`/admin/roles/${a.roleId}`} className="text-pink-600 hover:underline">
                    {a.roleId}
                  </Link>
                ) : (
                  "—"
                )}
              </td>
              <td className="py-4 text-sm text-zinc-600">{a.account_status}</td>
              <td className="py-4 text-right">
                <Link
                  href={`/admin/admins/${a.id}`}
                  className="inline-flex items-center rounded-xl border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-600 transition-colors hover:border-pink-200 hover:text-pink-600 hover:bg-pink-50"
                >
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
