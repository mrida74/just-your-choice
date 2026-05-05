import { model, models, Schema, type InferSchemaType } from "mongoose";

const auditLogSchema = new Schema(
  {
    // Admin who performed action
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
      index: true,
    },
    adminEmail: {
      type: String,
      required: true,
    },
    
    // Action details
    action: {
      type: String,
      enum: [
        "create_product",
        "update_product",
        "delete_product",
        "create_order",
        "update_order",
        "cancel_order",
        "create_admin",
        "update_admin",
        "disable_admin",
        "revoke_session",
        "update_settings",
        "create_promotion",
        "delete_promotion",
        "view_analytics",
        "export_data",
        "login_failed",
        "login_success",
        "mfa_enabled",
        "mfa_disabled",
        "password_changed",
        "session_revoked",
      ],
      required: true,
      index: true,
    },
    
    // Resource affected
    resource: {
      type: String,
      enum: ["product", "order", "admin", "user", "promotion", "settings", "auth"],
    },
    resourceId: String,
    
    // Changes made
    changes: {
      before: Schema.Types.Mixed,
      after: Schema.Types.Mixed,
    },
    
    // Context
    description: String,
    ipAddress: String,
    userAgent: String,
    
    // Status
    status: {
      type: String,
      enum: ["success", "failed"],
      default: "success",
    },
    errorMessage: String,
  },
  {
    timestamps: true,
  }
);

// Indexes for queries
auditLogSchema.index({ adminId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ resource: 1, resourceId: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });

export type IAuditLog = InferSchemaType<typeof auditLogSchema>;

export const AuditLog =
  models.AuditLog || model<IAuditLog>("AuditLog", auditLogSchema);
