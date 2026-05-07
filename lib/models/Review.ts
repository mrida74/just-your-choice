import { model, models, Schema, type InferSchemaType, type Model } from "mongoose";

const reviewSchema = new Schema(
  {
    productId: { type: String, required: true },
    userId: { type: String },
    guestEmail: { type: String, lowercase: true, trim: true },
    guestName: { type: String, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, trim: true, maxlength: 200 },
    content: { type: String, trim: true, maxlength: 5000 },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    featured: { type: Boolean, default: false },
    helpful: { type: Number, default: 0 },
    unhelpful: { type: Number, default: 0 },
    rejectionReason: { type: String, trim: true },
    moderatedBy: { type: String },
    moderatedAt: { type: Date },
  },
  { timestamps: true }
);

reviewSchema.index({ productId: 1 });
reviewSchema.index({ status: 1 });
reviewSchema.index({ featured: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ productId: 1, status: 1 });
reviewSchema.index({ productId: 1, featured: 1 });
reviewSchema.index({ userId: 1 });
reviewSchema.index({ guestEmail: 1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ moderatedAt: -1 });

export type ReviewDocument = InferSchemaType<typeof reviewSchema>;

const ReviewModel =
  (models.Review as Model<ReviewDocument>) ||
  model<ReviewDocument>("Review", reviewSchema);

export default ReviewModel;
