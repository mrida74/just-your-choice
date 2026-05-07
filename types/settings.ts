export interface StoreSettingsItem {
  id: string;
  storeName: string;
  storeDescription?: string;
  logo?: string;
  favicon?: string;
  primaryColor?: string;
  secondaryColor?: string;
  contactEmail: string;
  supportEmail?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    tiktok?: string;
  };
  shippingPolicy?: string;
  returnPolicy?: string;
  privacyPolicy?: string;
  termsOfService?: string;
  currency: string;
  timezone?: string;
  taxRate?: number;
  freeShippingThreshold?: number;
  maxUploadSize?: number; // in MB
  updatedAt?: string;
}

export interface StoreSettingsPayload {
  storeName?: string;
  storeDescription?: string;
  logo?: string;
  favicon?: string;
  primaryColor?: string;
  secondaryColor?: string;
  contactEmail?: string;
  supportEmail?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    tiktok?: string;
  };
  shippingPolicy?: string;
  returnPolicy?: string;
  privacyPolicy?: string;
  termsOfService?: string;
  currency?: string;
  timezone?: string;
  taxRate?: number;
  freeShippingThreshold?: number;
  maxUploadSize?: number;
}
