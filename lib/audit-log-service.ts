import { connectToDatabase } from "@/lib/mongodb";
import AuditLogModel from "@/lib/models/AuditLog";
import type { AuditLogItem, AuditLogPayload, AuditLogFilterOptions } from "@/types/audit-log";

function serializeAuditLog(doc: any): AuditLogItem {
  return {
    id: doc._id.toString(),
    action: doc.action,
    resourceType: doc.resourceType,
    resourceId: doc.resourceId,
    resourceName: doc.resourceName ?? undefined,
    adminId: doc.adminId?.toString(),
    adminEmail: doc.adminEmail ?? undefined,
    adminName: doc.adminName ?? undefined,
    changes: doc.changes ?? undefined,
    metadata: doc.metadata ?? undefined,
    ipAddress: doc.ipAddress ?? undefined,
    userAgent: doc.userAgent ?? undefined,
    status: doc.status ?? "success",
    errorMessage: doc.errorMessage ?? undefined,
    createdAt: doc.createdAt?.toISOString(),
  };
}

/**
 * Create an audit log entry.
 */
export async function createAuditLog(payload: AuditLogPayload): Promise<AuditLogItem> {
  await connectToDatabase();

  const log = new AuditLogModel({
    action: payload.action,
    resourceType: payload.resourceType,
    resourceId: payload.resourceId,
    resourceName: payload.resourceName,
    adminId: payload.adminId,
    adminEmail: payload.adminEmail.toLowerCase().trim(),
    adminName: payload.adminName,
    changes: payload.changes,
    metadata: payload.metadata,
    ipAddress: payload.ipAddress,
    userAgent: payload.userAgent,
    status: payload.status,
    errorMessage: payload.errorMessage,
  });

  const saved = await log.save();
  return serializeAuditLog(saved);
}

/**
 * Get audit logs with filters.
 */
export async function getAuditLogs(options: AuditLogFilterOptions = {}): Promise<AuditLogItem[]> {
  await connectToDatabase();

  const query: any = {};

  if (options.adminId) query.adminId = options.adminId;
  if (options.action) query.action = options.action;
  if (options.resourceType) query.resourceType = options.resourceType;
  if (options.resourceId) query.resourceId = options.resourceId;
  if (options.status) query.status = options.status;

  if (options.startDate || options.endDate) {
    query.createdAt = {};
    if (options.startDate) query.createdAt.$gte = options.startDate;
    if (options.endDate) query.createdAt.$lte = options.endDate;
  }

  const skip = options.skip ?? 0;
  const limit = options.limit ?? 50;

  const docs = await AuditLogModel.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return docs.map(serializeAuditLog);
}

/**
 * Get total count of audit logs matching filters.
 */
export async function countAuditLogs(options: AuditLogFilterOptions = {}): Promise<number> {
  await connectToDatabase();

  const query: any = {};

  if (options.adminId) query.adminId = options.adminId;
  if (options.action) query.action = options.action;
  if (options.resourceType) query.resourceType = options.resourceType;
  if (options.resourceId) query.resourceId = options.resourceId;
  if (options.status) query.status = options.status;

  if (options.startDate || options.endDate) {
    query.createdAt = {};
    if (options.startDate) query.createdAt.$gte = options.startDate;
    if (options.endDate) query.createdAt.$lte = options.endDate;
  }

  return AuditLogModel.countDocuments(query);
}

/**
 * Get a single audit log by ID.
 */
export async function getAuditLogById(logId: string): Promise<AuditLogItem | null> {
  await connectToDatabase();

  const doc = await AuditLogModel.findById(logId).lean();
  return doc ? serializeAuditLog(doc) : null;
}

/**
 * Get audit logs for a specific resource.
 */
export async function getAuditLogsForResource(resourceType: string, resourceId: string): Promise<AuditLogItem[]> {
  await connectToDatabase();

  const docs = await AuditLogModel.find({ resourceType, resourceId })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  return docs.map(serializeAuditLog);
}

/**
 * Get audit logs by admin.
 */
export async function getAuditLogsByAdmin(adminId: string, limit = 50): Promise<AuditLogItem[]> {
  await connectToDatabase();

  const docs = await AuditLogModel.find({ adminId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return docs.map(serializeAuditLog);
}

/**
 * Get action statistics (count by action).
 */
export async function getAuditActionStats(options: AuditLogFilterOptions = {}): Promise<Record<string, number>> {
  await connectToDatabase();

  const query: any = {};

  if (options.adminId) query.adminId = options.adminId;
  if (options.resourceType) query.resourceType = options.resourceType;

  if (options.startDate || options.endDate) {
    query.createdAt = {};
    if (options.startDate) query.createdAt.$gte = options.startDate;
    if (options.endDate) query.createdAt.$lte = options.endDate;
  }

  const stats = await AuditLogModel.aggregate([
    { $match: query },
    { $group: { _id: "$action", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  const result: Record<string, number> = {};
  for (const stat of stats) {
    result[stat._id] = stat.count;
  }
  return result;
}

/**
 * Get resource type statistics.
 */
export async function getAuditResourceStats(options: AuditLogFilterOptions = {}): Promise<Record<string, number>> {
  await connectToDatabase();

  const query: any = {};

  if (options.adminId) query.adminId = options.adminId;

  if (options.startDate || options.endDate) {
    query.createdAt = {};
    if (options.startDate) query.createdAt.$gte = options.startDate;
    if (options.endDate) query.createdAt.$lte = options.endDate;
  }

  const stats = await AuditLogModel.aggregate([
    { $match: query },
    { $group: { _id: "$resourceType", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  const result: Record<string, number> = {};
  for (const stat of stats) {
    result[stat._id] = stat.count;
  }
  return result;
}

/**
 * Get admin activity summary (actions by admin).
 */
export async function getAdminActivitySummary(options: AuditLogFilterOptions = {}): Promise<Array<{ adminEmail: string; adminName: string; count: number }>> {
  await connectToDatabase();

  const query: any = {};

  if (options.startDate || options.endDate) {
    query.createdAt = {};
    if (options.startDate) query.createdAt.$gte = options.startDate;
    if (options.endDate) query.createdAt.$lte = options.endDate;
  }

  const stats = await AuditLogModel.aggregate([
    { $match: query },
    {
      $group: {
        _id: { email: "$adminEmail", name: "$adminName" },
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 50 },
  ]);

  return stats.map((stat) => ({
    adminEmail: stat._id.email,
    adminName: stat._id.name,
    count: stat.count,
  }));
}

/**
 * Delete old audit logs (for cleanup).
 */
export async function deleteOldAuditLogs(beforeDate: Date): Promise<number> {
  await connectToDatabase();

  const result = await AuditLogModel.deleteMany({
    createdAt: { $lt: beforeDate },
  });

  return result.deletedCount || 0;
}
