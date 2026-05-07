import { model, models, Schema, type InferSchemaType, type Model } from "mongoose";

const storeSettingsSchema = new Schema(
  {
    storeName: { type: String, required: true, trim: true, maxlength: 200 },
    storeDescription: { type: String, trim: true, maxlength: 1000 },
    logo: { type: String, trim: true },
    favicon: { type: String, trim: true },
    primaryColor: { type: String, trim: true },
    secondaryColor: { type: String, trim: true },
    contactEmail: { type: String, required: true, lowercase: true, trim: true },
    supportEmail: { type: String, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      zipCode: { type: String, trim: true },
      country: { type: String, trim: true },
    },
    socialLinks: {
      facebook: { type: String, trim: true },
      instagram: { type: String, trim: true },
      twitter: { type: String, trim: true },
      linkedin: { type: String, trim: true },
      tiktok: { type: String, trim: true },
    },
    shippingPolicy: { type: String, trim: true },
    returnPolicy: { type: String, trim: true },
    privacyPolicy: { type: String, trim: true },
    termsOfService: { type: String, trim: true },
    currency: { type: String, default: "USD", trim: true, maxlength: 10 },
    timezone: { type: String, default: "UTC", trim: true },
    taxRate: { type: Number, default: 0 },
    freeShippingThreshold: { type: Number },
    maxUploadSize: { type: Number, default: 50 },
  },
  { timestamps: true }
);

export type StoreSettingsDocument = InferSchemaType<typeof storeSettingsSchema>;

const StoreSettingsModel =
  (models.StoreSettings as Model<StoreSettingsDocument>) ||
  model<StoreSettingsDocument>("StoreSettings", storeSettingsSchema);

export default StoreSettingsModel;
