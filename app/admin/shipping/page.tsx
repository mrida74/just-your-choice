import ShippingManager from "@/components/admin/ShippingManager";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function AdminShippingPage() {
  return <ShippingManager />;
}
