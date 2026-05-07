import { model, models, Schema } from "mongoose";

const refundTimelineSchema = new Schema(
  {
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "processing", "completed", "failed", "cancelled"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    updatedBy: String,
  },
  { _id: true }
);

const refundSchema = new Schema(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },

    refundReason: {
      type: String,
      enum: ["defective", "wrong_item", "not_as_described", "damaged_in_shipping", "customer_request", "other"],
      required: true,
      index: true,
    },

    refundAmount: {
      type: Number,
      required: true,
    },

    partialItems: [
      {
        productId: String,
        quantity: Number,
        amount: Number,
      },
    ],

    status: {
      type: String,
      enum: ["pending", "approved", "processing", "completed", "failed", "cancelled"],
      default: "pending",
      index: true,
    },

    requestedAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },

    approvedAt: Date,

    processedAt: Date,

    completedAt: Date,

    approvedBy: String,

    notes: String,

    customerNotes: String,

    trackingNumber: String,

    timeline: [refundTimelineSchema],
  },
  {
    timestamps: true,
  }
);

const returnTimelineSchema = new Schema(
  {
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    status: {
      type: String,
      enum: ["initiated", "approved", "in_transit", "received", "inspected", "completed", "cancelled", "rejected"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    updatedBy: String,
  },
  { _id: true }
);

const returnSchema = new Schema(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },

    shippingLabel: String,

    status: {
      type: String,
      enum: ["initiated", "approved", "in_transit", "received", "inspected", "completed", "cancelled", "rejected"],
      default: "initiated",
      index: true,
    },

    reason: {
      type: String,
      enum: ["defective", "wrong_item", "not_as_described", "damaged_in_shipping", "customer_request", "other"],
      required: true,
      index: true,
    },

    condition: String,

    initiatedAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },

    approvedAt: Date,

    receivedAt: Date,

    inspectionNotes: String,

    returnedItem: {
      productId: String,
      quantity: Number,
    },

    refundId: {
      type: Schema.Types.ObjectId,
      ref: "Refund",
    },

    timeline: [returnTimelineSchema],
  },
  {
    timestamps: true,
  }
);

// Indexes
refundSchema.index({ orderId: 1, createdAt: -1 });
refundSchema.index({ status: 1, createdAt: -1 });
refundSchema.index({ refundReason: 1 });

returnSchema.index({ orderId: 1, createdAt: -1 });
returnSchema.index({ status: 1, createdAt: -1 });
returnSchema.index({ refundId: 1 });

export const Refund = models.Refund || model("Refund", refundSchema);
export const Return = models.Return || model("Return", returnSchema);
