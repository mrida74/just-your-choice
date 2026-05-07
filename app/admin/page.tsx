import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import AdminOverview from "@/components/admin/AdminOverview";
import { getAdminFromToken } from "@/lib/admin-auth";
import { getAdminDashboardSnapshot } from "@/lib/admin-dashboard";

export const metadata: Metadata = {
  title: "Admin Panel | Just Your Choice",
  description: "Manage products by category and add inventory with strict category controls.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  const admin = token ? await getAdminFromToken(token) : null;

  if (!admin) {
    redirect("/admin/login");
  }

  const snapshot = await getAdminDashboardSnapshot();

  return <AdminOverview adminName={admin?.name} snapshot={snapshot} />;
}
