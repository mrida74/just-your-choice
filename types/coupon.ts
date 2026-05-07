export type CouponType = "percentage" | "fixed";

export interface CouponItem {
  id: string;
  code: string;
  description?: string;
  type: CouponType;
  amount: number;
  currency?: string;
  appliesTo?: {
    type: "all" | "categories" | "products";
    categories?: string[];
    products?: string[];
  };
  startDate?: string;
  expiryDate?: string;
  usageLimit?: number; // total uses across store
  usageCount?: number;
  perCustomerLimit?: number;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CouponPayload {
  code: string;
  description?: string;
  type: CouponType;
  amount: number;
  currency?: string;
  appliesTo?: {
    type: "all" | "categories" | "products";
    categories?: string[];
    products?: string[];
  };
  startDate?: string;
  expiryDate?: string;
  usageLimit?: number;
  perCustomerLimit?: number;
  active?: boolean;
}
