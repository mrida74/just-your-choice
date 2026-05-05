import { model, models, Schema, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
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
      required: false,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    
    // OAuth identifiers
    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },
    facebookId: {
      type: String,
      sparse: true,
      unique: true,
    },
    image: {
      type: String,
      required: false,
      trim: true,
    },
    
    // Role
    role: {
      type: String,
      enum: ["customer"],
      default: "customer",
    },
    
    // Auth method
    auth_method: {
      type: String,
      enum: ["google", "facebook", "local"],
      required: false,
      default: "local",
    },
    
    // Profile
    profile: {
      firstName: {
        type: String,
      },
      lastName: {
        type: String,
      },
      phone: {
        type: String,
      },
      addresses: [
        {
          label: String,
          street: String,
          city: String,
          state: String,
          zipCode: String,
          country: String,
          isDefault: {
            type: Boolean,
            default: false,
          },
        },
      ],
    },
    
    // Email verification
    verified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    verificationTokenExpiry: Date,
    
    // Activity tracking
    account_created_at: {
      type: Date,
      default: Date.now,
    },
    last_login: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
userSchema.index({ email: 1, auth_method: 1 });
userSchema.index({ last_login: -1 });

export type IUser = InferSchemaType<typeof userSchema>;

export const User = models.User || model<IUser>("User", userSchema);
