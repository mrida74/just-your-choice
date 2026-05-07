import { NextRequest, NextResponse } from "next/server";
import { checkPermission, forbiddenResponse, unauthorizedResponse, verifyAdminAuth } from "@/lib/admin-auth";
import { getRoles, createRole } from "@/lib/role-service";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminAuth(request);
  if (!auth.authenticated) return unauthorizedResponse(auth.error);
  if (!checkPermission(auth.admin, "manage_roles")) return forbiddenResponse();

  try {
    const roles = await getRoles();
    return NextResponse.json({ roles });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch roles.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminAuth(request);
  if (!auth.authenticated) return unauthorizedResponse(auth.error);
  if (!checkPermission(auth.admin, "manage_roles")) return forbiddenResponse();

  try {
    const body = await request.json();
    const role = await createRole(body);
    return NextResponse.json({ role }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create role.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
