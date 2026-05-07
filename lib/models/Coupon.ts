import { model, models, Schema, type InferSchemaType, type Model } from "mongoose";

const couponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, trim: true, uppercase: true, maxlength: 64 },
    description: { type: String, trim: true, maxlength: 500 },
    type: { type: String, enum: ["percentage", "fixed"], required: true },
    amount: { type: Number, required: true },
    currency: { type: String, trim: true, maxlength: 8 },
    appliesTo: {
      type: {
        type: String,
        enum: ["all", "categories", "products"],
        default: "all",
      },
      categories: { type: [String], default: [] },
      products: { type: [String], default: [] },
    },
    startDate: { type: Date },
    expiryDate: { type: Date },
    usageLimit: { type: Number },
    usageCount: { type: Number, default: 0 },
    perCustomerLimit: { type: Number },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

couponSchema.index({ code: 1 }, { unique: true });
couponSchema.index({ expiryDate: 1 });
couponSchema.index({ active: 1 });

export type CouponDocument = InferSchemaType<typeof couponSchema>;

const CouponModel = (models.Coupon as Model<CouponDocument>) || model<CouponDocument>("Coupon", couponSchema);

export default CouponModel;
