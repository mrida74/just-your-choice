import MediaLibrary from "@/components/admin/MediaLibrary";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function AdminMediaPage() {
  return <MediaLibrary />;
}
