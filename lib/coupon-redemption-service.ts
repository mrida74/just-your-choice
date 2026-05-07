import { connectToDatabase } from "@/lib/mongodb";
import CouponRedemptionModel from "@/lib/models/CouponRedemption";
import CouponModel from "@/lib/models/Coupon";
import type { CouponRedemptionItem } from "@/types/coupon-redemption";

function serializeRedemption(doc: any): CouponRedemptionItem {
  return {
    id: doc._id.toString(),
    couponCode: doc.couponCode,
    userId: doc.userId ?? undefined,
    guestEmail: doc.guestEmail ?? undefined,
    orderId: doc.orderId,
    discountAmount: doc.discountAmount,
    createdAt: doc.createdAt?.toISOString(),
  };
}

/**
 * Record a coupon redemption after order is placed.
 * Atomically increments coupon usageCount and creates redemption record.
 */
export async function recordRedemption(opts: {
  couponCode: string;
  userId?: string;
  guestEmail?: string;
  orderId: string;
  discountAmount: number;
}) {
  await connectToDatabase();

  const code = opts.couponCode.trim().toUpperCase();

  // Verify coupon exists
  const coupon = await CouponModel.findOne({ code }).exec();
  if (!coupon) {
    throw new Error(`Coupon ${code} not found.`);
  }

  // Atomically increment coupon usage
  await CouponModel.updateOne({ _id: coupon._id }, { $inc: { usageCount: 1 } }).exec();

  // Create redemption record
  const redemption = new CouponRedemptionModel({
    couponCode: code,
    userId: opts.userId || undefined,
    guestEmail: opts.guestEmail?.toLowerCase() || undefined,
    orderId: opts.orderId,
    discountAmount: opts.discountAmount,
  });

  const saved = await redemption.save();
  return serializeRedemption(saved);
}

/**
 * Count customer's redemptions for a specific coupon.
 */
export async function getCustomerRedemptionCount(opts: {
  couponCode: string;
  userId?: string;
  guestEmail?: string;
}): Promise<number> {
  await connectToDatabase();

  const query: any = { couponCode: opts.couponCode.trim().toUpperCase() };
  if (opts.userId) {
    query.userId = opts.userId;
  } else if (opts.guestEmail) {
    query.guestEmail = opts.guestEmail.toLowerCase();
  } else {
    return 0;
  }

  const count = await CouponRedemptionModel.countDocuments(query).exec();
  return count;
}

/**
 * Validate if customer can redeem coupon (per-customer limit check).
 */
export async function validateCustomerRedemptionLimit(opts: {
  couponCode: string;
  userId?: string;
  guestEmail?: string;
}): Promise<{ valid: boolean; reason?: string; currentCount?: number }> {
  await connectToDatabase();

  const code = opts.couponCode.trim().toUpperCase();
  const coupon = await CouponModel.findOne({ code }).exec();

  if (!coupon || !coupon.perCustomerLimit) {
    return { valid: true };
  }

  const count = await getCustomerRedemptionCount({
    couponCode: code,
    userId: opts.userId,
    guestEmail: opts.guestEmail,
  });

  if (count >= coupon.perCustomerLimit) {
    return {
      valid: false,
      reason: `Customer limit (${coupon.perCustomerLimit}) reached.`,
      currentCount: count,
    };
  }

  return { valid: true, currentCount: count };
}

/**
 * Get all redemptions for a coupon (admin reporting).
 */
export async function getCouponRedemptions(opts: {
  couponCode: string;
  limit?: number;
  skip?: number;
}) {
  await connectToDatabase();

  const limit = Math.min(opts.limit || 100, 1000);
  const skip = opts.skip || 0;

  const docs = await CouponRedemptionModel.find({
    couponCode: opts.couponCode.trim().toUpperCase(),
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .lean();

  return docs.map(serializeRedemption);
}

/**
 * Get redemptions by customer (for order history context).
 */
export async function getCustomerRedemptions(opts: {
  userId?: string;
  guestEmail?: string;
  limit?: number;
  skip?: number;
}) {
  await connectToDatabase();

  const query: any = {};
  if (opts.userId) {
    query.userId = opts.userId;
  } else if (opts.guestEmail) {
    query.guestEmail = opts.guestEmail.toLowerCase();
  } else {
    return [];
  }

  const limit = Math.min(opts.limit || 50, 500);
  const skip = opts.skip || 0;

  const docs = await CouponRedemptionModel.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .lean();

  return docs.map(serializeRedemption);
}

/**
 * Get redemption stats for admin dashboard.
 */
export async function getCouponRedemptionStats(couponCode: string) {
  await connectToDatabase();

  const code = couponCode.trim().toUpperCase();
  const [totalCount, uniqueUsers, uniqueGuests] = await Promise.all([
    CouponRedemptionModel.countDocuments({ couponCode: code }).exec(),
    CouponRedemptionModel.countDocuments({ couponCode: code, userId: { $exists: true, $ne: null } }).exec(),
    CouponRedemptionModel.countDocuments({ couponCode: code, guestEmail: { $exists: true, $ne: null } }).exec(),
  ]);

  const totalDiscount = await CouponRedemptionModel.aggregate([
    { $match: { couponCode: code } },
    { $group: { _id: null, total: { $sum: "$discountAmount" } } },
  ]).exec();

  return {
    totalRedemptions: totalCount,
    uniqueRegisteredUsers: uniqueUsers,
    uniqueGuestEmails: uniqueGuests,
    totalDiscountGiven: totalDiscount[0]?.total || 0,
  };
}

/**
 * Delete redemption(s) for admin refund/adjustment.
 */
export async function deleteRedemption(orderId: string) {
  await connectToDatabase();
  const res = await CouponRedemptionModel.deleteOne({ orderId }).exec();
  return res.deletedCount === 1;
}
