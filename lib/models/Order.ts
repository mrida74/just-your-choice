import { model, models, Schema, type InferSchemaType, type Model } from "mongoose";

const orderSchema = new Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      index: true,
    },
    
    // User reference (optional - for registered users)
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      sparse: true,
      index: true,
    },
    
    // Guest identifiers (optional - for guest checkout)
    guestEmail: {
      type: String,
      lowercase: true,
      sparse: true,
    },
    guestPhone: {
      type: String,
      sparse: true,
    },
    
    status: {
      type: String,
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
      index: true,
    },
    
    customer: {
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
        lowercase: true,
      },
      phone: {
        type: String,
        required: true,
      },
    },
    shipping: {
      address: {
        street: {
          type: String,
          required: true,
        },
        city: {
          type: String,
          required: true,
        },
        state: String,
        postalCode: {
          type: String,
          required: true,
        },
        country: {
          type: String,
          required: true,
        },
      },
      method: {
        type: String,
        enum: ["standard", "express"],
        default: "standard",
      },
      trackingNumber: String,
      estimatedDelivery: Date,
      shippedAt: Date,
      deliveredAt: Date,
    },
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
        sku: String,
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        size: String,
        total: {
          type: Number,
          required: true,
        },
      },
    ],
    pricing: {
      subtotal: {
        type: Number,
        required: true,
        min: 0,
      },
      shipping: {
        type: Number,
        required: true,
        min: 0,
      },
      tax: {
        type: Number,
        required: true,
        min: 0,
      },
      discount: {
        type: Number,
        default: 0,
        min: 0,
      },
      couponCode: String,
      total: {
        type: Number,
        required: true,
        min: 0,
      },
    },
    
    shippingMethod: {
      type: String,
      enum: ["standard", "express"],
      default: "standard",
    },
    paymentMethod: {
      type: String,
      enum: ["creditcard", "mobilemoney", "cod"],
      default: "cod",
    },
    
    // Timeline
    confirmedAt: Date,
    cancelledAt: Date,
    
    // Notes
    notes: String,
    adminNotes: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ guestEmail: 1, guestPhone: 1 });
orderSchema.index({ "customer.email": 1 });
orderSchema.index({ status: 1, paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });

// Generate order number before saving
orderSchema.pre("save", async function () {
  if (!this.orderNumber) {
    const date = new Date();
    const dateStr = date.toISOString().split("T")[0].replace(/-/g, "");
    const count = await (models.Order as any)?.countDocuments() || 0;
    this.orderNumber = `ORD-${dateStr}-${(count + 1).toString().padStart(5, "0")}`;
  }
});

export type Order = InferSchemaType<typeof orderSchema>;
export const OrderModel: Model<Order> =
  models.Order || model<Order>("Order", orderSchema);
