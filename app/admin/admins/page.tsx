import AdminsList from "@/components/admin/AdminsList";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function AdminsPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">Admins</p>
            <h1 className="mt-2 text-2xl font-black text-zinc-900">Admin Management</h1>
            <p className="mt-1 text-sm text-zinc-600">List of admin accounts and role assignments.</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
        <AdminsList />
      </section>
    </div>
  );
}
