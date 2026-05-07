import { connectToDatabase } from "@/lib/mongodb";
import { Refund, Return } from "@/lib/models/Refund";
import type {
  RefundItem,
  ReturnItem,
  RefundPayload,
  ReturnPayload,
  RefundFilterOptions,
  ReturnFilterOptions,
  RefundStatus,
  ReturnStatus,
} from "@/types/refund";

function serializeRefund(doc: any): RefundItem {
  return {
    id: doc._id.toString(),
    orderId: doc.orderId?.toString(),
    refundReason: doc.refundReason,
    refundAmount: doc.refundAmount,
    partialItems: doc.partialItems ?? undefined,
    status: doc.status,
    requestedAt: doc.requestedAt?.toISOString(),
    approvedAt: doc.approvedAt?.toISOString(),
    processedAt: doc.processedAt?.toISOString(),
    completedAt: doc.completedAt?.toISOString(),
    approvedBy: doc.approvedBy ?? undefined,
    notes: doc.notes ?? undefined,
    customerNotes: doc.customerNotes ?? undefined,
    trackingNumber: doc.trackingNumber ?? undefined,
    timeline: (doc.timeline || []).map((e: any) => ({
      timestamp: e.timestamp?.toISOString(),
      status: e.status,
      message: e.message,
      updatedBy: e.updatedBy ?? undefined,
    })),
  };
}

function serializeReturn(doc: any): ReturnItem {
  return {
    id: doc._id.toString(),
    orderId: doc.orderId?.toString(),
    shippingLabel: doc.shippingLabel ?? undefined,
    status: doc.status,
    reason: doc.reason,
    condition: doc.condition ?? undefined,
    initiatedAt: doc.initiatedAt?.toISOString(),
    approvedAt: doc.approvedAt?.toISOString(),
    receivedAt: doc.receivedAt?.toISOString(),
    inspectionNotes: doc.inspectionNotes ?? undefined,
    returnedItem: doc.returnedItem ?? undefined,
    refundId: doc.refundId?.toString() ?? undefined,
    timeline: (doc.timeline || []).map((e: any) => ({
      timestamp: e.timestamp?.toISOString(),
      status: e.status,
      message: e.message,
      updatedBy: e.updatedBy ?? undefined,
    })),
  };
}

/**
 * Refund functions
 */

export async function createRefund(payload: RefundPayload): Promise<RefundItem> {
  await connectToDatabase();

  const refund = new Refund({
    orderId: payload.orderId,
    refundReason: payload.refundReason,
    refundAmount: payload.refundAmount,
    partialItems: payload.partialItems,
    notes: payload.notes,
    timeline: [
      {
        timestamp: new Date(),
        status: "pending",
        message: "Refund request initiated",
      },
    ],
  });

  const saved = await refund.save();
  return serializeRefund(saved);
}

export async function getRefunds(options: RefundFilterOptions = {}): Promise<RefundItem[]> {
  await connectToDatabase();

  const query: any = {};
  if (options.orderId) query.orderId = options.orderId;
  if (options.status) query.status = options.status;
  if (options.refundReason) query.refundReason = options.refundReason;

  const skip = options.skip ?? 0;
  const limit = options.limit ?? 50;

  const docs = await Refund.find(query)
    .sort({ requestedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return docs.map(serializeRefund);
}

export async function getRefundById(refundId: string): Promise<RefundItem | null> {
  await connectToDatabase();

  const doc = await Refund.findById(refundId).lean();
  return doc ? serializeRefund(doc) : null;
}

export async function getRefundByOrderId(orderId: string): Promise<RefundItem | null> {
  await connectToDatabase();

  const doc = await Refund.findOne({ orderId }).lean();
  return doc ? serializeRefund(doc) : null;
}

export async function updateRefundStatus(refundId: string, status: RefundStatus, approvedBy?: string, notes?: string): Promise<RefundItem | null> {
  await connectToDatabase();

  const dateUpdates: any = {};
  if (status === "approved") dateUpdates.approvedAt = new Date();
  if (status === "processing") dateUpdates.processedAt = new Date();
  if (status === "completed") dateUpdates.completedAt = new Date();

  const updated = await Refund.findByIdAndUpdate(
    refundId,
    {
      $set: { status, ...dateUpdates },
      $push: {
        timeline: {
          timestamp: new Date(),
          status,
          message: `Refund status updated to ${status}`,
          updatedBy: approvedBy,
        },
      },
    },
    { new: true }
  ).lean();

  return updated ? serializeRefund(updated) : null;
}

export async function countRefunds(options: RefundFilterOptions = {}): Promise<number> {
  await connectToDatabase();

  const query: any = {};
  if (options.orderId) query.orderId = options.orderId;
  if (options.status) query.status = options.status;

  return Refund.countDocuments(query);
}

/**
 * Return functions
 */

export async function createReturn(payload: ReturnPayload): Promise<ReturnItem> {
  await connectToDatabase();

  const ret = new Return({
    orderId: payload.orderId,
    reason: payload.reason,
    condition: payload.condition,
    timeline: [
      {
        timestamp: new Date(),
        status: "initiated",
        message: "Return request initiated",
      },
    ],
  });

  const saved = await ret.save();
  return serializeReturn(saved);
}

export async function getReturns(options: ReturnFilterOptions = {}): Promise<ReturnItem[]> {
  await connectToDatabase();

  const query: any = {};
  if (options.orderId) query.orderId = options.orderId;
  if (options.status) query.status = options.status;

  const skip = options.skip ?? 0;
  const limit = options.limit ?? 50;

  const docs = await Return.find(query)
    .sort({ initiatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return docs.map(serializeReturn);
}

export async function getReturnById(returnId: string): Promise<ReturnItem | null> {
  await connectToDatabase();

  const doc = await Return.findById(returnId).lean();
  return doc ? serializeReturn(doc) : null;
}

export async function getReturnByOrderId(orderId: string): Promise<ReturnItem | null> {
  await connectToDatabase();

  const doc = await Return.findOne({ orderId }).lean();
  return doc ? serializeReturn(doc) : null;
}

export async function updateReturnStatus(returnId: string, status: ReturnStatus, updatedBy?: string): Promise<ReturnItem | null> {
  await connectToDatabase();

  const dateUpdates: any = {};
  if (status === "approved") dateUpdates.approvedAt = new Date();
  if (status === "received") dateUpdates.receivedAt = new Date();

  const updated = await Return.findByIdAndUpdate(
    returnId,
    {
      $set: { status, ...dateUpdates },
      $push: {
        timeline: {
          timestamp: new Date(),
          status,
          message: `Return status updated to ${status}`,
          updatedBy,
        },
      },
    },
    { new: true }
  ).lean();

  return updated ? serializeReturn(updated) : null;
}

export async function countReturns(options: ReturnFilterOptions = {}): Promise<number> {
  await connectToDatabase();

  const query: any = {};
  if (options.orderId) query.orderId = options.orderId;
  if (options.status) query.status = options.status;

  return Return.countDocuments(query);
}

/**
 * Get refund and return stats
 */
export async function getRefundStats(): Promise<{
  totalRefunds: number;
  totalAmount: number;
  byStatus: Record<string, number>;
}> {
  await connectToDatabase();

  const total = await Refund.countDocuments();

  const stats = await Refund.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 }, amount: { $sum: "$refundAmount" } } },
  ]);

  const result: any = {
    totalRefunds: total,
    totalAmount: 0,
    byStatus: {},
  };

  const totalAmount = await Refund.aggregate([
    { $group: { _id: null, total: { $sum: "$refundAmount" } } },
  ]);

  result.totalAmount = totalAmount[0]?.total || 0;

  for (const stat of stats) {
    result.byStatus[stat._id] = stat.count;
  }

  return result;
}

export async function getReturnStats(): Promise<{
  totalReturns: number;
  byStatus: Record<string, number>;
}> {
  await connectToDatabase();

  const total = await Return.countDocuments();

  const stats = await Return.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const result: any = {
    totalReturns: total,
    byStatus: {},
  };

  for (const stat of stats) {
    result.byStatus[stat._id] = stat.count;
  }

  return result;
}
