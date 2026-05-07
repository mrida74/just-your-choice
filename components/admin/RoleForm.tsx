"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AVAILABLE_PERMISSIONS } from "@/types/role";
import type { RoleItem } from "@/types/role";

type Props = {
  initial?: Partial<RoleItem>;
  isNew?: boolean;
};

export default function RoleForm({ initial = {}, isNew = false }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initial.name || "");
  const [description, setDescription] = useState(initial.description || "");
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(
    new Set(initial.permissions || [])
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const togglePermission = (permission: string) => {
    const newSet = new Set(selectedPermissions);
    if (newSet.has(permission)) {
      newSet.delete(permission);
    } else {
      newSet.add(permission);
    }
    setSelectedPermissions(newSet);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const payload = {
      name,
      description,
      permissions: Array.from(selectedPermissions),
    };

    try {
      const url = isNew ? "/api/admin/roles" : `/api/admin/roles/${initial.id}`;
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
      router.push("/admin/roles");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  // Group permissions by category
  const groupedPermissions = {
    categories: AVAILABLE_PERMISSIONS.filter((p) => p.includes("categor")),
    products: AVAILABLE_PERMISSIONS.filter((p) => p.includes("product")),
    coupons: AVAILABLE_PERMISSIONS.filter((p) => p.includes("coupon")),
    reviews: AVAILABLE_PERMISSIONS.filter((p) => p.includes("review")),
    orders: AVAILABLE_PERMISSIONS.filter((p) => p.includes("order")),
    customers: AVAILABLE_PERMISSIONS.filter((p) => p.includes("customer")),
    settings: AVAILABLE_PERMISSIONS.filter((p) => p.includes("setting")),
    admins: AVAILABLE_PERMISSIONS.filter((p) => p.includes("admin") || p.includes("role")),
    audit: AVAILABLE_PERMISSIONS.filter((p) => p.includes("audit")),
    media: AVAILABLE_PERMISSIONS.filter((p) => p.includes("media")),
    shipping: AVAILABLE_PERMISSIONS.filter((p) => p.includes("shipping")),
    analytics: AVAILABLE_PERMISSIONS.filter((p) => p.includes("analytic") || p.includes("report")),
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">Role</p>
          <h1 className="mt-2 text-2xl font-black text-zinc-900">{isNew ? "Create role" : `Edit ${name}`}</h1>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Role name"
            className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none"
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="md:col-span-2 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none"
          />
        </div>
      </section>

      <section className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">Permissions</p>

        {Object.entries(groupedPermissions).map(([group, perms]) => (
          perms.length > 0 && (
            <div key={group} className="mt-6">
              <h3 className="mb-3 text-sm font-semibold text-zinc-900 capitalize">{group}</h3>
              <div className="grid gap-2 md:grid-cols-2">
                {perms.map((perm) => (
                  <label key={perm} className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2 cursor-pointer hover:bg-white">
                    <input
                      type="checkbox"
                      checked={selectedPermissions.has(perm)}
                      onChange={() => togglePermission(perm)}
                      className="h-4 w-4 rounded border-zinc-300 text-pink-600"
                    />
                    <span className="text-sm text-zinc-700">{perm.replace(/_/g, " ")}</span>
                  </label>
                ))}
              </div>
            </div>
          )
        ))}
      </section>

      {message && <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-600">{message}</div>}

      <div className="flex items-center justify-end gap-3">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center rounded-2xl bg-pink-600 px-5 py-3 text-sm font-semibold text-white hover:bg-pink-700 disabled:opacity-60"
        >
          {saving ? "Saving..." : isNew ? "Create role" : "Save role"}
        </button>
      </div>
    </form>
  );
}
