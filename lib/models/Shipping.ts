import { model, models, Schema } from "mongoose";

const shippingEventSchema = new Schema(
  {
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "in_transit", "delivered", "returned", "lost", "cancelled"],
      required: true,
    },
    location: String,
    message: {
      type: String,
      required: true,
    },
  },
  { _id: true }
);

const shippingSchema = new Schema(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },

    carrier: {
      type: String,
      enum: ["fedex", "ups", "usps", "dhl", "other"],
      required: true,
      index: true,
    },

    trackingNumber: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },

    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "in_transit", "delivered", "returned", "lost", "cancelled"],
      default: "pending",
      index: true,
    },

    estimatedDelivery: Date,

    actualDelivery: Date,

    weight: Number,

    cost: {
      type: Number,
      required: true,
      default: 0,
    },

    insuranceAmount: {
      type: Number,
      default: 0,
    },

    signature: {
      type: Boolean,
      default: false,
    },

    notes: String,

    events: [shippingEventSchema],
  },
  {
    timestamps: true,
  }
);

// Indexes
shippingSchema.index({ orderId: 1, createdAt: -1 });
shippingSchema.index({ carrier: 1, status: 1 });
shippingSchema.index({ status: 1, createdAt: -1 });
shippingSchema.index({ trackingNumber: 1 });

const carrierServiceSchema = new Schema(
  {
    name: {
      type: String,
      enum: ["fedex", "ups", "usps", "dhl", "other"],
      required: true,
      unique: true,
      index: true,
    },

    apiKey: {
      type: String,
      select: false,
    },

    enabled: {
      type: Boolean,
      default: false,
      index: true,
    },

    baseUrl: String,

    contact: {
      email: String,
      phone: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Shipping = models.Shipping || model("Shipping", shippingSchema);
export const CarrierService =
  models.CarrierService || model("CarrierService", carrierServiceSchema);
