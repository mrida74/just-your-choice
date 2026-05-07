import { connectToDatabase } from "@/lib/mongodb";
import CouponModel from "@/lib/models/Coupon";
import type { CouponItem, CouponPayload } from "@/types/coupon";
import { validateCustomerRedemptionLimit } from "@/lib/coupon-redemption-service";

function serializeCoupon(doc: any): CouponItem {
  return {
    id: doc._id.toString(),
    code: doc.code,
    description: doc.description ?? undefined,
    type: doc.type,
    amount: doc.amount,
    currency: doc.currency ?? undefined,
    appliesTo: doc.appliesTo
      ? {
          type: doc.appliesTo.type,
          categories: Array.isArray(doc.appliesTo.categories) ? doc.appliesTo.categories : undefined,
          products: Array.isArray(doc.appliesTo.products) ? doc.appliesTo.products : undefined,
        }
      : undefined,
    startDate: doc.startDate ? doc.startDate.toISOString() : undefined,
    expiryDate: doc.expiryDate ? doc.expiryDate.toISOString() : undefined,
    usageLimit: typeof doc.usageLimit === "number" ? doc.usageLimit : undefined,
    usageCount: typeof doc.usageCount === "number" ? doc.usageCount : 0,
    perCustomerLimit: typeof doc.perCustomerLimit === "number" ? doc.perCustomerLimit : undefined,
    active: Boolean(doc.active),
    createdAt: doc.createdAt?.toISOString(),
    updatedAt: doc.updatedAt?.toISOString(),
  };
}

export async function createCoupon(payload: CouponPayload) {
  await connectToDatabase();

  const coupon = new CouponModel({
    code: payload.code.trim().toUpperCase(),
    description: payload.description?.trim() || undefined,
    type: payload.type,
    amount: payload.amount,
    currency: payload.currency,
    appliesTo: payload.appliesTo,
    startDate: payload.startDate ? new Date(payload.startDate) : undefined,
    expiryDate: payload.expiryDate ? new Date(payload.expiryDate) : undefined,
    usageLimit: typeof payload.usageLimit === "number" ? payload.usageLimit : undefined,
    perCustomerLimit: typeof payload.perCustomerLimit === "number" ? payload.perCustomerLimit : undefined,
    active: payload.active ?? true,
  });

  const saved = await coupon.save();
  return serializeCoupon(saved);
}

export async function getCoupons() {
  await connectToDatabase();
  const docs = await CouponModel.find().sort({ createdAt: -1 }).lean();
  return docs.map(serializeCoupon);
}

export async function getCouponByCode(code: string) {
  await connectToDatabase();
  const doc = await CouponModel.findOne({ code: code.trim().toUpperCase() }).lean();
  return doc ? serializeCoupon(doc) : null;
}

export async function updateCoupon(code: string, payload: Partial<CouponPayload>) {
  await connectToDatabase();
  const update: any = {};
  if (payload.description !== undefined) update.description = payload.description?.trim() || undefined;
  if (payload.type !== undefined) update.type = payload.type;
  if (payload.amount !== undefined) update.amount = payload.amount;
  if (payload.currency !== undefined) update.currency = payload.currency;
  if (payload.appliesTo !== undefined) update.appliesTo = payload.appliesTo;
  if (payload.startDate !== undefined) update.startDate = payload.startDate ? new Date(payload.startDate) : undefined;
  if (payload.expiryDate !== undefined) update.expiryDate = payload.expiryDate ? new Date(payload.expiryDate) : undefined;
  if (payload.usageLimit !== undefined) update.usageLimit = payload.usageLimit;
  if (payload.perCustomerLimit !== undefined) update.perCustomerLimit = payload.perCustomerLimit;
  if (payload.active !== undefined) update.active = payload.active;

  const updated = await CouponModel.findOneAndUpdate({ code: code.trim().toUpperCase() }, { $set: update }, { new: true }).lean();
  return updated ? serializeCoupon(updated) : null;
}

export async function deleteCoupon(code: string) {
  await connectToDatabase();
  const res = await CouponModel.deleteOne({ code: code.trim().toUpperCase() });
  return res.deletedCount === 1;
}

// Validate coupon and optionally apply the usage increment.
export async function validateAndApplyCoupon(opts: {
  code: string;
  userId?: string;
  guestEmail?: string;
  cartTotal: number;
  apply?: boolean; // whether to increment usage
}) {
  await connectToDatabase();

  const code = opts.code.trim().toUpperCase();
  const doc = await CouponModel.findOne({ code }).exec();
  if (!doc) return { valid: false, reason: "not_found" };

  if (!doc.active) return { valid: false, reason: "inactive" };

  const now = new Date();
  if (doc.startDate && now < doc.startDate) return { valid: false, reason: "not_started" };
  if (doc.expiryDate && now > doc.expiryDate) return { valid: false, reason: "expired" };

  if (typeof doc.usageLimit === "number" && doc.usageCount >= doc.usageLimit) {
    return { valid: false, reason: "usage_limit_reached" };
  }

  // Check per-customer limit using redemption tracking
  if (typeof doc.perCustomerLimit === "number" && (opts.userId || opts.guestEmail)) {
    const limitCheck = await validateCustomerRedemptionLimit({
      couponCode: code,
      userId: opts.userId,
      guestEmail: opts.guestEmail,
    });
    if (!limitCheck.valid) {
      return { valid: false, reason: "customer_limit_reached" };
    }
  }

  // compute discount
  let discount = 0;
  if (doc.type === "percentage") {
    const pct = Math.max(0, Math.min(100, doc.amount));
    discount = Math.round((opts.cartTotal * pct) / 100);
  } else {
    discount = Math.max(0, Math.min(opts.cartTotal, doc.amount));
  }

  if (opts.apply) {
    // increment usageCount atomically
    await CouponModel.updateOne({ _id: doc._id }, { $inc: { usageCount: 1 } }).exec();
  }

  return { valid: true, discount, coupon: serializeCoupon(doc) };
}
