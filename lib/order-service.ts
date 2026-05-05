import { OrderModel } from "./models/Order";
import { User } from "./models/User";

/**
 * Create a new order
 */
export async function createOrder(orderData: {
  userId?: string;
  guestEmail?: string;
  guestPhone?: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  items: any[];
  shipping: any;
  pricing: any;
  shippingMethod: string;
  paymentMethod: string;
  notes?: string;
}) {
  try {
    const order = new OrderModel({
      userId: orderData.userId || null,
      guestEmail: orderData.guestEmail || null,
      guestPhone: orderData.guestPhone || null,
      customer: orderData.customer,
      items: orderData.items,
      shipping: orderData.shipping,
      pricing: orderData.pricing,
      shippingMethod: orderData.shippingMethod,
      paymentMethod: orderData.paymentMethod,
      notes: orderData.notes,
      status: "pending",
      paymentStatus: "pending",
    });

    return await order.save();
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
}

/**
 * Get orders by user ID
 */
export async function getUserOrders(userId: string) {
  try {
    return await OrderModel.find({ userId }).sort({ createdAt: -1 });
  } catch (error) {
    console.error("Error getting user orders:", error);
    return [];
  }
}

/**
 * Get guest orders by email
 */
export async function getGuestOrders(email: string, phone?: string) {
  try {
    const query: any = { guestEmail: email.toLowerCase() };
    if (phone) {
      query.guestPhone = phone;
    }
    return await OrderModel.find(query).sort({ createdAt: -1 });
  } catch (error) {
    console.error("Error getting guest orders:", error);
    return [];
  }
}

/**
 * Get order by ID
 */
export async function getOrderById(orderId: string) {
  try {
    return await OrderModel.findById(orderId).populate("items.productId");
  } catch (error) {
    console.error("Error getting order:", error);
    return null;
  }
}

/**
 * Get order by order number
 */
export async function getOrderByNumber(orderNumber: string) {
  try {
    return await OrderModel.findOne({ orderNumber }).populate("items.productId");
  } catch (error) {
    console.error("Error getting order:", error);
    return null;
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string,
  status: string,
  updates?: Record<string, any>
) {
  try {
    const updateData: any = { status };

    // Set timestamps based on status
    switch (status) {
      case "confirmed":
        updateData.confirmedAt = new Date();
        break;
      case "shipped":
        updateData.shippedAt = new Date();
        break;
      case "delivered":
        updateData.deliveredAt = new Date();
        break;
      case "cancelled":
        updateData.cancelledAt = new Date();
        break;
    }

    // Merge additional updates
    if (updates) {
      Object.assign(updateData, updates);
    }

    return await OrderModel.findByIdAndUpdate(orderId, updateData, {
      new: true,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    throw error;
  }
}

/**
 * Link guest order to user account
 */
export async function linkGuestOrderToUser(
  userId: string,
  guestEmail: string,
  guestPhone?: string
) {
  try {
    const query: any = { guestEmail: guestEmail.toLowerCase() };
    if (guestPhone) {
      query.guestPhone = guestPhone;
    }

    // Find all guest orders for this email
    const guestOrders = await OrderModel.find(query);

    if (guestOrders.length === 0) {
      return { success: false, message: "No guest orders found" };
    }

    // Update all guest orders to link with user
    const updateResult = await OrderModel.updateMany(query, {
      userId,
      guestEmail: null,
      guestPhone: null,
    });

    return {
      success: true,
      ordersLinked: updateResult.modifiedCount,
      message: `${updateResult.modifiedCount} order(s) linked to your account`,
    };
  } catch (error) {
    console.error("Error linking guest orders:", error);
    throw error;
  }
}

/**
 * Get all orders (admin)
 */
export async function getAllOrders(filters?: {
  status?: string;
  paymentStatus?: string;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  skip?: number;
}) {
  try {
    const query: any = {};

    if (filters?.status) {
      query.status = filters.status;
    }
    if (filters?.paymentStatus) {
      query.paymentStatus = filters.paymentStatus;
    }
    if (filters?.dateFrom || filters?.dateTo) {
      query.createdAt = {};
      if (filters.dateFrom) {
        query.createdAt.$gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        query.createdAt.$lte = filters.dateTo;
      }
    }

    const limit = Math.min(filters?.limit || 50, 100);
    const skip = filters?.skip || 0;

    return await OrderModel.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate("userId", "email name phone");
  } catch (error) {
    console.error("Error getting orders:", error);
    return [];
  }
}

/**
 * Get order statistics
 */
export async function getOrderStats() {
  try {
    const stats = await OrderModel.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalRevenue: { $sum: "$pricing.total" },
        },
      },
    ]);

    return stats;
  } catch (error) {
    console.error("Error getting order stats:", error);
    return [];
  }
}

/**
 * Check if customer with email exists
 */
export async function customerEmailExists(email: string): Promise<{
  exists: boolean;
  userId?: string;
  hasAccount: boolean;
}> {
  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      return {
        exists: true,
        userId: user._id.toString(),
        hasAccount: true,
      };
    }

    // Check for guest orders
    const guestOrders = await OrderModel.findOne({
      guestEmail: email.toLowerCase(),
    });

    return {
      exists: !!guestOrders,
      hasAccount: false,
    };
  } catch (error) {
    console.error("Error checking customer email:", error);
    return { exists: false, hasAccount: false };
  }
}
