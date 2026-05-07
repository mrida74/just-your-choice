// Action types for audit logging
export type AuditAction = 
  | "view" | "create" | "update" | "delete"
  | "publish" | "archive" | "approve" | "reject"
  | "export" | "import" | "download"
  | "login" | "logout" | "signin"
  | "permissions_change" | "role_assign" | "role_remove";

// Resource types
export type AuditResourceType = 
  | "product" | "category" | "order" | "customer"
  | "coupon" | "review" | "admin" | "role" | "setting"
  | "media" | "shipping" | "refund";

export interface AuditLogItem {
  id: string;
  action: AuditAction;
  resourceType: AuditResourceType;
  resourceId: string;
  resourceName?: string;
  adminId: string;
  adminEmail: string;
  adminName: string;
  changes?: Record<string, { old: any; new: any }>;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  status: "success" | "failed";
  errorMessage?: string;
  createdAt: string;
}

export interface AuditLogPayload {
  action: AuditAction;
  resourceType: AuditResourceType;
  resourceId: string;
  resourceName?: string;
  adminId: string;
  adminEmail: string;
  adminName: string;
  changes?: Record<string, { old: any; new: any }>;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  status: "success" | "failed";
  errorMessage?: string;
}

export interface AuditLogFilterOptions {
  adminId?: string;
  action?: AuditAction;
  resourceType?: AuditResourceType;
  resourceId?: string;
  startDate?: Date;
  endDate?: Date;
  status?: "success" | "failed";
  skip?: number;
  limit?: number;
}
