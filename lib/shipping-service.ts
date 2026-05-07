import { connectToDatabase } from "@/lib/mongodb";
import { Shipping, CarrierService } from "@/lib/models/Shipping";
import type { ShippingItem, ShippingPayload, ShippingFilterOptions, CarrierServiceItem, CarrierServicePayload, ShippingStatus } from "@/types/shipping";

function serializeShipping(doc: any): ShippingItem {
  return {
    id: doc._id.toString(),
    orderId: doc.orderId?.toString(),
    carrier: doc.carrier,
    trackingNumber: doc.trackingNumber,
    status: doc.status,
    estimatedDelivery: doc.estimatedDelivery?.toISOString(),
    actualDelivery: doc.actualDelivery?.toISOString(),
    weight: doc.weight ?? undefined,
    cost: doc.cost,
    insuranceAmount: doc.insuranceAmount ?? undefined,
    signature: Boolean(doc.signature),
    notes: doc.notes ?? undefined,
    events: (doc.events || []).map((e: any) => ({
      timestamp: e.timestamp?.toISOString(),
      status: e.status,
      location: e.location ?? undefined,
      message: e.message,
    })),
    createdAt: doc.createdAt?.toISOString(),
    updatedAt: doc.updatedAt?.toISOString(),
  };
}

function serializeCarrier(doc: any): CarrierServiceItem {
  return {
    id: doc._id.toString(),
    name: doc.name,
    apiKey: undefined, // Never return API key
    enabled: Boolean(doc.enabled),
    baseUrl: doc.baseUrl ?? undefined,
    contact: doc.contact
      ? {
          email: doc.contact.email ?? undefined,
          phone: doc.contact.phone ?? undefined,
        }
      : undefined,
    createdAt: doc.createdAt?.toISOString(),
    updatedAt: doc.updatedAt?.toISOString(),
  };
}

/**
 * Create a shipping record.
 */
export async function createShipping(payload: ShippingPayload): Promise<ShippingItem> {
  await connectToDatabase();

  const shipping = new Shipping({
    orderId: payload.orderId,
    carrier: payload.carrier,
    trackingNumber: payload.trackingNumber,
    weight: payload.weight,
    cost: payload.cost,
    insuranceAmount: payload.insuranceAmount,
    signature: payload.signature,
    notes: payload.notes,
    estimatedDelivery: payload.estimatedDelivery,
    events: [
      {
        timestamp: new Date(),
        status: "processing",
        message: `Shipment created with ${payload.carrier.toUpperCase()} - Tracking: ${payload.trackingNumber}`,
      },
    ],
  });

  const saved = await shipping.save();
  return serializeShipping(saved);
}

/**
 * Get shipping records.
 */
export async function getShipping(options: ShippingFilterOptions = {}): Promise<ShippingItem[]> {
  await connectToDatabase();

  const query: any = {};
  if (options.orderId) query.orderId = options.orderId;
  if (options.carrier) query.carrier = options.carrier;
  if (options.status) query.status = options.status;
  if (options.trackingNumber) query.trackingNumber = options.trackingNumber;

  const skip = options.skip ?? 0;
  const limit = options.limit ?? 50;

  const docs = await Shipping.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return docs.map(serializeShipping);
}

/**
 * Get shipping by ID.
 */
export async function getShippingById(shippingId: string): Promise<ShippingItem | null> {
  await connectToDatabase();

  const doc = await Shipping.findById(shippingId).lean();
  return doc ? serializeShipping(doc) : null;
}

/**
 * Get shipping by tracking number.
 */
export async function getShippingByTracking(trackingNumber: string): Promise<ShippingItem | null> {
  await connectToDatabase();

  const doc = await Shipping.findOne({ trackingNumber }).lean();
  return doc ? serializeShipping(doc) : null;
}

/**
 * Get shipping for order.
 */
export async function getShippingForOrder(orderId: string): Promise<ShippingItem[]> {
  await connectToDatabase();

  const docs = await Shipping.find({ orderId }).lean();
  return docs.map(serializeShipping);
}

/**
 * Update shipping status.
 */
export async function updateShippingStatus(shippingId: string, status: ShippingStatus, location?: string, message?: string): Promise<ShippingItem | null> {
  await connectToDatabase();

  const updated = await Shipping.findByIdAndUpdate(
    shippingId,
    {
      $set: { status },
      $push: {
        events: {
          timestamp: new Date(),
          status,
          location,
          message: message || `Status updated to ${status}`,
        },
      },
    },
    { new: true }
  ).lean();

  return updated ? serializeShipping(updated) : null;
}

/**
 * Mark as delivered.
 */
export async function markAsDelivered(shippingId: string): Promise<ShippingItem | null> {
  await connectToDatabase();

  const updated = await Shipping.findByIdAndUpdate(
    shippingId,
    {
      $set: { status: "delivered", actualDelivery: new Date() },
      $push: {
        events: {
          timestamp: new Date(),
          status: "delivered",
          message: "Package delivered",
        },
      },
    },
    { new: true }
  ).lean();

  return updated ? serializeShipping(updated) : null;
}

/**
 * Count shipping records.
 */
export async function countShipping(options: ShippingFilterOptions = {}): Promise<number> {
  await connectToDatabase();

  const query: any = {};
  if (options.orderId) query.orderId = options.orderId;
  if (options.carrier) query.carrier = options.carrier;
  if (options.status) query.status = options.status;

  return Shipping.countDocuments(query);
}

/**
 * Carrier service functions
 */

export async function createCarrierService(payload: CarrierServicePayload): Promise<CarrierServiceItem> {
  await connectToDatabase();

  const carrier = new CarrierService({
    name: payload.name,
    apiKey: payload.apiKey,
    enabled: payload.enabled,
    baseUrl: payload.baseUrl,
    contact: payload.contact,
  });

  const saved = await carrier.save();
  return serializeCarrier(saved);
}

export async function getCarrierServices(): Promise<CarrierServiceItem[]> {
  await connectToDatabase();

  const docs = await CarrierService.find().lean();
  return docs.map(serializeCarrier);
}

export async function getCarrierService(carrier: string): Promise<CarrierServiceItem | null> {
  await connectToDatabase();

  const doc = await CarrierService.findOne({ name: carrier }).lean();
  return doc ? serializeCarrier(doc) : null;
}

export async function updateCarrierService(carrierId: string, payload: Partial<CarrierServicePayload>): Promise<CarrierServiceItem | null> {
  await connectToDatabase();

  const update: any = {};
  if (payload.enabled !== undefined) update.enabled = payload.enabled;
  if (payload.apiKey !== undefined) update.apiKey = payload.apiKey;
  if (payload.baseUrl !== undefined) update.baseUrl = payload.baseUrl;
  if (payload.contact !== undefined) update.contact = payload.contact;

  const updated = await CarrierService.findByIdAndUpdate(carrierId, { $set: update }, { new: true }).lean();
  return updated ? serializeCarrier(updated) : null;
}

export async function getShippingStats(): Promise<{
  totalShipments: number;
  byCarrier: Record<string, number>;
  byStatus: Record<string, number>;
}> {
  await connectToDatabase();

  const total = await Shipping.countDocuments();

  const byCarrier = await Shipping.aggregate([
    { $group: { _id: "$carrier", count: { $sum: 1 } } },
  ]);

  const byStatus = await Shipping.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const result: any = {
    totalShipments: total,
    byCarrier: {},
    byStatus: {},
  };

  for (const stat of byCarrier) {
    result.byCarrier[stat._id] = stat.count;
  }

  for (const stat of byStatus) {
    result.byStatus[stat._id] = stat.count;
  }

  return result;
}
