import { getStoreSettings } from "@/lib/settings-service";
import StoreSettingsForm from "@/components/admin/StoreSettingsForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminSettingsPage() {
  const settings = await getStoreSettings();

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">Settings</p>
          <h1 className="mt-2 text-2xl font-black text-zinc-900">Store Settings</h1>
          <p className="mt-1 text-sm text-zinc-600">Configure your store name, branding, policies, and business info.</p>
        </div>
      </section>

      <section className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
        <StoreSettingsForm initial={settings || undefined} />
      </section>
    </div>
  );
}
