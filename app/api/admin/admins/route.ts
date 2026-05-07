import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth, unauthorizedResponse, forbiddenResponse, checkPermission } from "@/lib/admin-auth";
import { getAdmins } from "@/lib/user-service";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminAuth(request);
  if (!auth.authenticated) return unauthorizedResponse(auth.error);
  if (!checkPermission(auth.admin, "view_admins")) return forbiddenResponse();

  try {
    const admins = await getAdmins();
    return NextResponse.json({ admins });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch admins";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
