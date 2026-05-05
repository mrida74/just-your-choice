import { model, models, Schema, type InferSchemaType } from "mongoose";

const adminSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Invalid email"],
      index: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    
    // Password (hashed with bcrypt)
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false, // Don't return password by default
    },
    
    // Role
    role: {
      type: String,
      enum: ["admin", "manager"],
      required: true,
      index: true,
    },
    
    // Permissions
    permissions: {
      canManageProducts: {
        type: Boolean,
        default: false,
      },
      canManageOrders: {
        type: Boolean,
        default: false,
      },
      canManageInventory: {
        type: Boolean,
        default: false,
      },
      canManageUsers: {
        type: Boolean,
        default: false,
      },
      canManageSettings: {
        type: Boolean,
        default: false,
      },
      canManagePromotions: {
        type: Boolean,
        default: false,
      },
      canInviteUsers: {
        type: Boolean,
        default: false,
      },
      canViewAnalytics: {
        type: Boolean,
        default: false,
      },
      canManageReports: {
        type: Boolean,
        default: false,
      },
    },
    
    // MFA Settings
    mfa_factors: [
      {
        type: {
          type: String,
          enum: ["totp", "passkey"],
          required: true,
        },
        enabled: {
          type: Boolean,
          default: false,
        },
        secret: String, // For TOTP
        credentialId: String, // For Passkey
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    
    // Account status
    account_status: {
      type: String,
      enum: ["pending", "active", "disabled"],
      default: "pending",
      index: true,
    },
    
    // Invitation tracking
    invited_by: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
    },
    invited_at: Date,
    account_activated_at: Date,
    
    // Activity tracking
    last_login: Date,
    last_login_ip: String,
    failed_login_attempts: {
      type: Number,
      default: 0,
    },
    last_failed_login: Date,
  },
  {
    timestamps: true,
  }
);

adminSchema.index({ role: 1, account_status: 1 });
adminSchema.index({ last_login: -1 });

// Set permissions based on role
adminSchema.pre("save", function () {
  if (this.role === "admin") {
    // Admin gets all permissions
    this.permissions = {
      canManageProducts: true,
      canManageOrders: true,
      canManageInventory: true,
      canManageUsers: true,
      canManageSettings: true,
      canManagePromotions: true,
      canInviteUsers: true,
      canViewAnalytics: true,
      canManageReports: true,
    };
  } else if (this.role === "manager") {
    // Manager gets limited permissions
    this.permissions = {
      canManageProducts: true,
      canManageOrders: true,
      canManageInventory: true,
      canManageUsers: false,
      canManageSettings: false,
      canManagePromotions: true,
      canInviteUsers: false,
      canViewAnalytics: true,
      canManageReports: true,
    };
  }
});

export type IAdmin = InferSchemaType<typeof adminSchema>;

export const Admin = models.Admin || model<IAdmin>("Admin", adminSchema);
