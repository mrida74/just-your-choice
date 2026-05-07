import Link from "next/link";
import { getRoles } from "@/lib/role-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminRolesPage() {
  const roles = await getRoles();

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">Roles</p>
            <h1 className="mt-2 text-2xl font-black text-zinc-900">Role Management</h1>
            <p className="mt-1 text-sm text-zinc-600">Define roles and assign granular permissions.</p>
          </div>
          <Link
            href="/admin/roles/new"
            className="inline-flex items-center justify-center rounded-2xl bg-pink-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-pink-700"
          >
            Create role
          </Link>
        </div>
      </section>

      <section className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-500">
                <th className="py-3">Name</th>
                <th className="py-3">Description</th>
                <th className="py-3">Permissions</th>
                <th className="py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-sm text-zinc-500">
                    No roles found.
                  </td>
                </tr>
              ) : (
                roles.map((role) => (
                  <tr key={role.id} className="border-b border-zinc-100 last:border-b-0">
                    <td className="py-4 font-semibold text-zinc-900">{role.name}</td>
                    <td className="py-4 text-sm text-zinc-600">{role.description || "—"}</td>
                    <td className="py-4 text-sm text-zinc-600">{role.permissions.length} permission{role.permissions.length !== 1 ? "s" : ""}</td>
                    <td className="py-4 text-right">
                      <Link
                        href={`/admin/roles/${role.id}`}
                        className="inline-flex items-center rounded-xl border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-600 transition-colors hover:border-pink-200 hover:text-pink-600 hover:bg-pink-50"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
