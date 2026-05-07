import { getRoleById } from "@/lib/role-service";
import RoleForm from "@/components/admin/RoleForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EditRolePage({ params }: { params: { id: string } }) {
  const role = await getRoleById(params.id);

  if (!role) {
    return (
      <div className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm">Role not found.</div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">Edit</p>
          <h1 className="mt-2 text-2xl font-black text-zinc-900">Edit role</h1>
        </div>
      </section>

      <section className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
        <RoleForm initial={role} />
      </section>
    </div>
  );
}
