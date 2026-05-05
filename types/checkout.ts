/**
 * Checkout-related types
 */

export interface CheckoutCustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state?: string;
    zipCode: string;
    country: string;
  };
}

export interface CheckoutItem {
  productId: string;
  title: string;
  sku?: string;
  price: number;
  quantity: number;
  size?: string;
}

export interface CheckoutPricing {
  subtotal: number;
  shipping: number;
  tax: number;
  discount?: number;
  couponCode?: string;
  total: number;
}

export interface CheckoutRequest {
  items: CheckoutItem[];
  customerInfo: CheckoutCustomerInfo;
  pricing: CheckoutPricing;
  shippingMethod: "standard" | "express";
  paymentMethod: "creditcard" | "mobilemoney" | "cod";
  createAccount?: boolean;
  notes?: string;
}

export interface CheckoutResponse {
  success: boolean;
  order?: {
    id: string;
    orderNumber: string;
    total: number;
  };
  accountStatus?: "created" | "merged" | "guest";
  message?: string;
  errors?: string[];
}

export interface CheckoutInfoResponse {
  isLoggedIn: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address?: CheckoutCustomerInfo["address"];
  };
}

export interface CheckoutState {
  // Customer info
  customerInfo: CheckoutCustomerInfo;
  
  // Items
  items: CheckoutItem[];
  
  // Pricing
  pricing: CheckoutPricing;
  
  // Shipping & Payment
  shippingMethod: "standard" | "express";
  paymentMethod: "creditcard" | "mobilemoney" | "cod";
  
  // Account creation
  createAccount: boolean;
  
  // UI State
  isLoading: boolean;
  error?: string;
  isSubmitted: boolean;
  accountMergeRequired: boolean;
  existingEmail?: string;
}

export interface AccountMergeData {
  email: string;
  existingAccountFound: boolean;
  confirmed: boolean;
}
