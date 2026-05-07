import { model, models, Schema, type InferSchemaType, type Model } from "mongoose";

const couponRedemptionSchema = new Schema(
  {
    couponCode: { type: String, required: true, uppercase: true, trim: true },
    userId: { type: String },
    guestEmail: { type: String, lowercase: true, trim: true },
    orderId: { type: String, required: true },
    discountAmount: { type: Number, required: true },
  },
  { timestamps: true }
);

couponRedemptionSchema.index({ couponCode: 1 });
couponRedemptionSchema.index({ userId: 1 });
couponRedemptionSchema.index({ guestEmail: 1 });
couponRedemptionSchema.index({ orderId: 1 }, { unique: true });
couponRedemptionSchema.index({ couponCode: 1, userId: 1 });
couponRedemptionSchema.index({ couponCode: 1, guestEmail: 1 });
couponRedemptionSchema.index({ createdAt: 1 });

export type CouponRedemptionDocument = InferSchemaType<typeof couponRedemptionSchema>;

const CouponRedemptionModel =
  (models.CouponRedemption as Model<CouponRedemptionDocument>) ||
  model<CouponRedemptionDocument>("CouponRedemption", couponRedemptionSchema);

export default CouponRedemptionModel;
