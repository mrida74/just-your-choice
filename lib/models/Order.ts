import { model, models, Schema, type InferSchemaType, type Model } from "mongoose";

const orderSchema = new Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
      index: true,
    },
    customer: {
      email: {
        type: String,
        required: true,
        lowercase: true,
      },
      firstName: {
        type: String,
        required: true,
      },
      lastName: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
    },
    shipping: {
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      postalCode: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
    },
    items: [
      {
        productId: {
          type: String,
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
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
    notes: String,
  },
  {
    timestamps: true,
  }
);

// Generate order number before saving
orderSchema.pre("save", async function () {
  if (!this.orderNumber) {
    const count = await (models.Order as any)?.countDocuments() || 0;
    this.orderNumber = `ORD-${Date.now()}-${(count + 1).toString().padStart(5, "0")}`;
  }
});

export type Order = InferSchemaType<typeof orderSchema>;
export const OrderModel: Model<Order> =
  models.Order || model<Order>("Order", orderSchema);
