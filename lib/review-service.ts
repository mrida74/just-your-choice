import { connectToDatabase } from "@/lib/mongodb";
import ReviewModel from "@/lib/models/Review";
import type { ReviewItem, ReviewPayload, ReviewModerationPayload } from "@/types/review";

function serializeReview(doc: any): ReviewItem {
  return {
    id: doc._id.toString(),
    productId: doc.productId,
    userId: doc.userId ?? undefined,
    guestEmail: doc.guestEmail ?? undefined,
    guestName: doc.guestName ?? undefined,
    rating: doc.rating,
    title: doc.title ?? undefined,
    content: doc.content ?? undefined,
    status: doc.status,
    featured: Boolean(doc.featured),
    helpful: doc.helpful ?? 0,
    unhelpful: doc.unhelpful ?? 0,
    rejectionReason: doc.rejectionReason ?? undefined,
    moderatedBy: doc.moderatedBy ?? undefined,
    moderatedAt: doc.moderatedAt?.toISOString() ?? undefined,
    createdAt: doc.createdAt?.toISOString(),
    updatedAt: doc.updatedAt?.toISOString(),
  };
}

/**
 * Submit a review (customer-facing).
 * Reviews start in "pending" status and require admin approval.
 */
export async function submitReview(payload: ReviewPayload) {
  await connectToDatabase();

  // Validate rating
  if (!Number.isFinite(payload.rating) || payload.rating < 1 || payload.rating > 5) {
    throw new Error("Rating must be between 1 and 5.");
  }

  // Validate at least rating or content
  if (!payload.content?.trim() && !payload.title?.trim()) {
    throw new Error("Review must include title or content.");
  }

  const review = new ReviewModel({
    productId: payload.productId,
    userId: payload.userId || undefined,
    guestEmail: payload.guestEmail?.toLowerCase() || undefined,
    guestName: payload.guestName?.trim() || undefined,
    rating: payload.rating,
    title: payload.title?.trim() || undefined,
    content: payload.content?.trim() || undefined,
    status: "pending",
  });

  const saved = await review.save();
  return serializeReview(saved);
}

/**
 * Get approved reviews for a product (customer-facing).
 */
export async function getProductReviews(opts: {
  productId: string;
  featured?: boolean;
  limit?: number;
  skip?: number;
}) {
  await connectToDatabase();

  const query: any = { productId: opts.productId, status: "approved" };
  if (opts.featured !== undefined) {
    query.featured = opts.featured;
  }

  const limit = Math.min(opts.limit || 20, 200);
  const skip = opts.skip || 0;

  const docs = await ReviewModel.find(query)
    .sort({ featured: -1, createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .lean();

  return docs.map(serializeReview);
}

/**
 * Get review stats for a product.
 */
export async function getProductReviewStats(productId: string) {
  await connectToDatabase();

  const stats = await ReviewModel.aggregate([
    { $match: { productId, status: "approved" } },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        avgRating: { $avg: "$rating" },
        helpfulTotal: { $sum: "$helpful" },
      },
    },
  ]).exec();

  if (stats.length === 0) {
    return { count: 0, avgRating: 0, helpfulTotal: 0 };
  }

  return {
    count: stats[0].count,
    avgRating: Math.round(stats[0].avgRating * 10) / 10,
    helpfulTotal: stats[0].helpfulTotal,
  };
}

/**
 * Get reviews for moderation (admin).
 */
export async function getReviewsForModeration(opts?: {
  status?: "pending" | "approved" | "rejected";
  limit?: number;
  skip?: number;
}) {
  await connectToDatabase();

  const query: any = {};
  if (opts?.status) {
    query.status = opts.status;
  }

  const limit = Math.min(opts?.limit || 50, 500);
  const skip = opts?.skip || 0;

  const docs = await ReviewModel.find(query)
    .sort({ createdAt: 1 })
    .limit(limit)
    .skip(skip)
    .lean();

  return docs.map(serializeReview);
}

/**
 * Moderate a review (admin action).
 */
export async function moderateReview(
  reviewId: string,
  payload: ReviewModerationPayload,
  moderatorId: string
) {
  await connectToDatabase();

  const update: any = {
    status: payload.status,
    moderatedBy: moderatorId,
    moderatedAt: new Date(),
  };

  if (payload.featured !== undefined) {
    update.featured = payload.featured;
  }

  if (payload.status === "rejected" && payload.rejectionReason) {
    update.rejectionReason = payload.rejectionReason.trim();
  }

  const updated = await ReviewModel.findByIdAndUpdate(reviewId, { $set: update }, { new: true }).lean();
  return updated ? serializeReview(updated) : null;
}

/**
 * Toggle featured status (admin).
 */
export async function toggleFeaturedReview(reviewId: string) {
  await connectToDatabase();

  const review = await ReviewModel.findById(reviewId).lean();
  if (!review) return null;

  const updated = await ReviewModel.findByIdAndUpdate(
    reviewId,
    { $set: { featured: !review.featured } },
    { new: true }
  ).lean();

  return updated ? serializeReview(updated) : null;
}

/**
 * Record helpful/unhelpful vote.
 */
export async function voteReviewHelpful(reviewId: string, helpful: boolean) {
  await connectToDatabase();

  const field = helpful ? "helpful" : "unhelpful";
  const updated = await ReviewModel.findByIdAndUpdate(
    reviewId,
    { $inc: { [field]: 1 } },
    { new: true }
  ).lean();

  return updated ? serializeReview(updated) : null;
}

/**
 * Delete a review (admin).
 */
export async function deleteReview(reviewId: string) {
  await connectToDatabase();

  const res = await ReviewModel.deleteOne({ _id: reviewId }).exec();
  return res.deletedCount === 1;
}

/**
 * Get pending review count (admin dashboard).
 */
export async function getPendingReviewCount() {
  await connectToDatabase();

  return ReviewModel.countDocuments({ status: "pending" }).exec();
}
