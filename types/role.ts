// Define all available permissions
export const AVAILABLE_PERMISSIONS = [
  // Category management
  "view_categories",
  "manage_categories",
  
  // Product management
  "view_products",
  "create_products",
  "edit_products",
  "delete_products",
  "manage_inventory",
  
  // Coupon management
  "view_coupons",
  "manage_coupons",
  
  // Review moderation
  "view_reviews",
  "moderate_reviews",
  
  // Order management
  "view_orders",
  "manage_orders",
  "refund_orders",
  
  // Customer management
  "view_customers",
  "manage_customers",
  
  // Settings
  "view_settings",
  "manage_settings",
  
  // Admin users & roles
  "view_admins",
  "manage_admins",
  "manage_roles",
  
  // Audit logs
  "view_audit_logs",
  "export_audit_logs",
  
  // Media management
  "upload_media",
  "delete_media",
  
  // Shipping
  "view_shipping",
  "manage_shipping",
  
  // Analytics & reports
  "view_analytics",
  "export_reports",
] as const;

export type Permission = (typeof AVAILABLE_PERMISSIONS)[number];

export interface RoleItem {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface RolePayload {
  name: string;
  description?: string;
  permissions: Permission[];
}
