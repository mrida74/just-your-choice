import { model, models, Schema, type InferSchemaType } from "mongoose";

const invitationSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Invalid email"],
      index: true,
    },
    
    // Who invited
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    
    // Role being invited
    role: {
      type: String,
      enum: ["admin", "manager"],
      required: true,
    },
    
    // Invitation token
    invitationToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    
    // Token expiry
    tokenExpiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    
    // Status
    status: {
      type: String,
      enum: ["pending", "accepted", "expired", "revoked"],
      default: "pending",
      index: true,
    },
    
    // When accepted
    inviteAcceptedAt: Date,
    acceptedBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
    },
    
    // Resend tracking
    resendCount: {
      type: Number,
      default: 0,
    },
    lastResentAt: Date,
  },
  {
    timestamps: true,
  }
);

// Index for finding valid pending invitations
invitationSchema.index({ email: 1, status: 1 });
invitationSchema.index({ tokenExpiresAt: 1, status: 1 });

// Auto-expire invitations
invitationSchema.pre("find", function () {
  this.where({ tokenExpiresAt: { $gt: new Date() } });
});

export type IInvitation = InferSchemaType<typeof invitationSchema>;

export const Invitation =
  models.Invitation || model<IInvitation>("Invitation", invitationSchema);
