import { connectToDatabase } from "@/lib/mongodb";
import StoreSettingsModel from "@/lib/models/StoreSettings";
import type { StoreSettingsItem, StoreSettingsPayload } from "@/types/settings";

function serializeSettings(doc: any): StoreSettingsItem {
  return {
    id: doc._id.toString(),
    storeName: doc.storeName,
    storeDescription: doc.storeDescription ?? undefined,
    logo: doc.logo ?? undefined,
    favicon: doc.favicon ?? undefined,
    primaryColor: doc.primaryColor ?? undefined,
    secondaryColor: doc.secondaryColor ?? undefined,
    contactEmail: doc.contactEmail,
    supportEmail: doc.supportEmail ?? undefined,
    phone: doc.phone ?? undefined,
    address: doc.address
      ? {
          street: doc.address.street ?? undefined,
          city: doc.address.city ?? undefined,
          state: doc.address.state ?? undefined,
          zipCode: doc.address.zipCode ?? undefined,
          country: doc.address.country ?? undefined,
        }
      : undefined,
    socialLinks: doc.socialLinks
      ? {
          facebook: doc.socialLinks.facebook ?? undefined,
          instagram: doc.socialLinks.instagram ?? undefined,
          twitter: doc.socialLinks.twitter ?? undefined,
          linkedin: doc.socialLinks.linkedin ?? undefined,
          tiktok: doc.socialLinks.tiktok ?? undefined,
        }
      : undefined,
    shippingPolicy: doc.shippingPolicy ?? undefined,
    returnPolicy: doc.returnPolicy ?? undefined,
    privacyPolicy: doc.privacyPolicy ?? undefined,
    termsOfService: doc.termsOfService ?? undefined,
    currency: doc.currency || "USD",
    timezone: doc.timezone || "UTC",
    taxRate: doc.taxRate ?? undefined,
    freeShippingThreshold: doc.freeShippingThreshold ?? undefined,
    maxUploadSize: doc.maxUploadSize ?? 50,
    updatedAt: doc.updatedAt?.toISOString(),
  };
}

/**
 * Get current store settings (singleton).
 */
export async function getStoreSettings(): Promise<StoreSettingsItem | null> {
  await connectToDatabase();

  const doc = await StoreSettingsModel.findOne().lean();
  return doc ? serializeSettings(doc) : null;
}

/**
 * Update store settings.
 */
export async function updateStoreSettings(payload: StoreSettingsPayload) {
  await connectToDatabase();

  // Ensure settings document exists
  let settings = await StoreSettingsModel.findOne().exec();

  if (!settings) {
    // Create default settings if none exist
    settings = new StoreSettingsModel({
      storeName: payload.storeName || "My Store",
      contactEmail: payload.contactEmail || "info@example.com",
      currency: payload.currency || "USD",
    });
  }

  // Update fields
  const update: any = {};
  if (payload.storeName !== undefined) update.storeName = payload.storeName?.trim();
  if (payload.storeDescription !== undefined) update.storeDescription = payload.storeDescription?.trim();
  if (payload.logo !== undefined) update.logo = payload.logo?.trim();
  if (payload.favicon !== undefined) update.favicon = payload.favicon?.trim();
  if (payload.primaryColor !== undefined) update.primaryColor = payload.primaryColor?.trim();
  if (payload.secondaryColor !== undefined) update.secondaryColor = payload.secondaryColor?.trim();
  if (payload.contactEmail !== undefined) update.contactEmail = payload.contactEmail?.toLowerCase().trim();
  if (payload.supportEmail !== undefined) update.supportEmail = payload.supportEmail?.toLowerCase().trim();
  if (payload.phone !== undefined) update.phone = payload.phone?.trim();
  if (payload.address !== undefined) update.address = payload.address;
  if (payload.socialLinks !== undefined) update.socialLinks = payload.socialLinks;
  if (payload.shippingPolicy !== undefined) update.shippingPolicy = payload.shippingPolicy?.trim();
  if (payload.returnPolicy !== undefined) update.returnPolicy = payload.returnPolicy?.trim();
  if (payload.privacyPolicy !== undefined) update.privacyPolicy = payload.privacyPolicy?.trim();
  if (payload.termsOfService !== undefined) update.termsOfService = payload.termsOfService?.trim();
  if (payload.currency !== undefined) update.currency = payload.currency?.trim();
  if (payload.timezone !== undefined) update.timezone = payload.timezone?.trim();
  if (typeof payload.taxRate === "number") update.taxRate = Math.max(0, Math.min(100, payload.taxRate));
  if (typeof payload.freeShippingThreshold === "number") update.freeShippingThreshold = payload.freeShippingThreshold;
  if (typeof payload.maxUploadSize === "number") update.maxUploadSize = Math.max(1, payload.maxUploadSize);

  const updated = await StoreSettingsModel.findByIdAndUpdate(settings._id, { $set: update }, { new: true }).lean();
  return updated ? serializeSettings(updated) : null;
}

/**
 * Initialize default settings if none exist.
 */
export async function initializeDefaultSettings() {
  await connectToDatabase();

  const existing = await StoreSettingsModel.findOne().exec();
  if (existing) return serializeSettings(existing);

  const defaults = new StoreSettingsModel({
    storeName: "Just Your Choice",
    contactEmail: "info@justyourchoice.com",
    currency: "USD",
    timezone: "UTC",
    taxRate: 0,
  });

  const saved = await defaults.save();
  return serializeSettings(saved);
}

/**
 * Get public-facing store info.
 */
export async function getPublicStoreInfo() {
  const settings = await getStoreSettings();
  if (!settings) return null;

  return {
    storeName: settings.storeName,
    logo: settings.logo,
    phone: settings.phone,
    contactEmail: settings.contactEmail,
    address: settings.address,
    socialLinks: settings.socialLinks,
    currency: settings.currency,
    shippingPolicy: settings.shippingPolicy,
    returnPolicy: settings.returnPolicy,
    privacyPolicy: settings.privacyPolicy,
    termsOfService: settings.termsOfService,
  };
}
