import { model, models, Schema } from "mongoose";

const auditLogSchema = new Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        "view", "create", "update", "delete",
        "publish", "archive", "approve", "reject",
        "export", "import", "download",
        "login", "logout", "signin",
        "permissions_change", "role_assign", "role_remove",
      ],
      index: true,
    },
    
    resourceType: {
      type: String,
      required: true,
      enum: [
        "product", "category", "order", "customer",
        "coupon", "review", "admin", "role", "setting",
        "media", "shipping", "refund",
      ],
      index: true,
    },
    
    resourceId: {
      type: String,
      required: true,
      index: true,
    },
    
    resourceName: String,
    
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
      index: true,
    },
    
    adminEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    
    adminName: {
      type: String,
      required: true,
    },
    
    // Track changes for update operations
    changes: {
      type: Schema.Types.Mixed,
    },
    
    // Additional metadata
    metadata: {
      type: Schema.Types.Mixed,
    },
    
    ipAddress: String,
    userAgent: String,
    
    status: {
      type: String,
      enum: ["success", "failed"],
      default: "success",
      index: true,
    },
    
    errorMessage: String,
  },
  {
    timestamps: true,
  }
);

// Compound indexes for common queries
auditLogSchema.index({ adminId: 1, createdAt: -1 });
auditLogSchema.index({ resourceType: 1, resourceId: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ adminEmail: 1, createdAt: -1 });

// TTL index: Keep logs for 1 year (365 days = 31536000 seconds)
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 });

export default models.AuditLog || model("AuditLog", auditLogSchema);
