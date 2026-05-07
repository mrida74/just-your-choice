import { NextRequest, NextResponse } from "next/server";
import { checkPermission, forbiddenResponse, unauthorizedResponse, verifyAdminAuth } from "@/lib/admin-auth";
import { getAuditLogs, countAuditLogs, getAuditActionStats, getAuditResourceStats, getAdminActivitySummary } from "@/lib/audit-log-service";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminAuth(request);
  if (!auth.authenticated) return unauthorizedResponse(auth.error);

  // Permission check: must have view_audit_logs
  if (!checkPermission(auth.admin, "view_audit_logs")) return forbiddenResponse();

  try {
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get("adminId");
    const action = searchParams.get("action");
    const resourceType = searchParams.get("resourceType");
    const resourceId = searchParams.get("resourceId");
    const status = searchParams.get("status") as "success" | "failed" | null;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const skip = parseInt(searchParams.get("skip") || "0", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const includeStats = searchParams.get("includeStats") === "true";

    const filters: any = {};
    if (adminId) filters.adminId = adminId;
    if (action) filters.action = action;
    if (resourceType) filters.resourceType = resourceType;
    if (resourceId) filters.resourceId = resourceId;
    if (status) filters.status = status;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    filters.skip = skip;
    filters.limit = limit;

    const logs = await getAuditLogs(filters);
    const total = await countAuditLogs(filters);

    const response: any = {
      logs,
      total,
      skip,
      limit,
    };

    // Include stats if requested
    if (includeStats) {
      response.stats = {
        actionCounts: await getAuditActionStats(filters),
        resourceTypeCounts: await getAuditResourceStats(filters),
        topAdmins: await getAdminActivitySummary(filters),
      };
    }

    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch audit logs.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
