import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createOrder, customerEmailExists, linkGuestOrderToUser } from "@/lib/order-service";
import { findUserByEmail, createUser, updateUserProfile } from "@/lib/user-service";
import { isValidEmail, isValidPhone } from "@/lib/auth-utils";
import { logAdminAction } from "@/lib/user-service";
import { AuditLog } from "@/lib/models/AuditLog";

interface CheckoutRequest {
  items: Array<{
    productId: string;
    title: string;
    sku?: string;
    price: number;
    quantity: number;
    size?: string;
  }>;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      state?: string;
      zipCode: string;
      country: string;
    };
  };
  pricing: {
    subtotal: number;
    shipping: number;
    tax: number;
    discount?: number;
    couponCode?: string;
    total: number;
  };
  shippingMethod: "standard" | "express";
  paymentMethod: "creditcard" | "mobilemoney" | "cod";
  createAccount?: boolean;
  notes?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutRequest = await request.json();

    // Validate request
    const validation = validateCheckoutRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);

    let userId: string | undefined;
    let guestEmail: string | undefined;
    let guestPhone: string | undefined;
    let newAccountCreated = false;
    let accountMerged = false;

    // Handle user identification
    if (session?.user?.id) {
      // User is logged in
      userId = session.user.id;

      // Update user profile with latest info if different
      await updateUserProfile(userId!, {
        phone: body.customerInfo.phone,
        "profile.addresses": [
          {
            street: body.customerInfo.address.street,
            city: body.customerInfo.address.city,
            state: body.customerInfo.address.state,
            zipCode: body.customerInfo.address.zipCode,
            country: body.customerInfo.address.country,
            isDefault: true,
          },
        ],
      });
    } else if (body.createAccount) {
      // User wants to create account (or link to existing)
      const existingUser = await findUserByEmail(body.customerInfo.email);

      if (existingUser) {
        // Account exists - merge
        userId = existingUser._id.toString();
        accountMerged = true;

        // Update their profile
        await updateUserProfile(userId!, {
          phone: body.customerInfo.phone,
          "profile.addresses": [
            {
              street: body.customerInfo.address.street,
              city: body.customerInfo.address.city,
              state: body.customerInfo.address.state,
              zipCode: body.customerInfo.address.zipCode,
              country: body.customerInfo.address.country,
              isDefault: true,
            },
          ],
        });

        // Link any guest orders
        const guestOrders = await linkGuestOrderToUser(
          userId!,
          body.customerInfo.email,
          body.customerInfo.phone
        );

        console.log("Guest orders linked:", guestOrders);
      } else {
        // Create new account
        const newUser = await createUser({
          email: body.customerInfo.email,
          phone: body.customerInfo.phone,
          name: body.customerInfo.name,
          auth_method: "direct_signup", // Mark as directly created during checkout
        });

        userId = newUser._id.toString();
        newAccountCreated = true;

        // Add address to profile
        await updateUserProfile(userId!, {
          "profile.addresses": [
            {
              street: body.customerInfo.address.street,
              city: body.customerInfo.address.city,
              state: body.customerInfo.address.state,
              zipCode: body.customerInfo.address.zipCode,
              country: body.customerInfo.address.country,
              isDefault: true,
            },
          ],
        });
      }
    } else {
      // Guest checkout
      guestEmail = body.customerInfo.email;
      guestPhone = body.customerInfo.phone;
    }

    // Prepare order items with calculated totals
    const orderItems = body.items.map((item) => ({
      ...item,
      total: item.price * item.quantity,
    }));

    // Create order
    const order = await createOrder({
      userId,
      guestEmail,
      guestPhone,
      customer: {
        name: body.customerInfo.name,
        email: body.customerInfo.email,
        phone: body.customerInfo.phone,
      },
      items: orderItems,
      shipping: {
        address: body.customerInfo.address,
        method: body.shippingMethod,
      },
      pricing: body.pricing,
      shippingMethod: body.shippingMethod,
      paymentMethod: body.paymentMethod,
      notes: body.notes,
    });

    // Log the action
    try {
      const logEntry = new AuditLog({
        adminId: null,
        adminEmail: "system",
        action: "create_order",
        resource: "order",
        resourceId: order._id.toString(),
        description: `Order created - ${newAccountCreated ? "new account" : accountMerged ? "account merged" : "guest"} - ${body.customerInfo.email}`,
        status: "success",
      });
      await logEntry.save();
    } catch (logError) {
      console.error("Error logging order creation:", logError);
    }

    return NextResponse.json(
      {
        success: true,
        order: {
          id: order._id.toString(),
          orderNumber: order.orderNumber,
          total: order.pricing?.total,
        },
        accountStatus: newAccountCreated
          ? "created"
          : accountMerged
            ? "merged"
            : "guest",
        message: newAccountCreated
          ? "Order placed and account created successfully!"
          : accountMerged
            ? "Order placed and linked to your existing account!"
            : "Order placed successfully as guest!",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to place order. Please try again.",
        error: process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * Validate checkout request
 */
function validateCheckoutRequest(data: CheckoutRequest): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate customer info
  if (!data.customerInfo.name || data.customerInfo.name.trim().length < 2) {
    errors.push("Valid customer name is required");
  }

  if (!isValidEmail(data.customerInfo.email)) {
    errors.push("Valid email address is required");
  }

  if (!isValidPhone(data.customerInfo.phone)) {
    errors.push("Valid phone number is required");
  }

  // Validate address
  const addr = data.customerInfo.address;
  if (!addr.street || addr.street.trim().length < 3) {
    errors.push("Valid street address is required");
  }
  if (!addr.city || addr.city.trim().length < 2) {
    errors.push("Valid city is required");
  }
  if (!addr.zipCode || addr.zipCode.trim().length < 2) {
    errors.push("Valid zip code is required");
  }
  if (!addr.country || addr.country.trim().length < 2) {
    errors.push("Valid country is required");
  }

  // Validate items
  if (!Array.isArray(data.items) || data.items.length === 0) {
    errors.push("At least one item is required");
  }

  data.items.forEach((item, index) => {
    if (!item.productId) {
      errors.push(`Item ${index + 1}: Product ID is required`);
    }
    if (!item.title || item.title.trim().length < 2) {
      errors.push(`Item ${index + 1}: Product title is required`);
    }
    if (typeof item.price !== "number" || item.price <= 0) {
      errors.push(`Item ${index + 1}: Valid price is required`);
    }
    if (typeof item.quantity !== "number" || item.quantity < 1) {
      errors.push(`Item ${index + 1}: Valid quantity is required`);
    }
  });

  // Validate pricing
  if (typeof data.pricing.subtotal !== "number" || data.pricing.subtotal <= 0) {
    errors.push("Valid subtotal is required");
  }
  if (typeof data.pricing.shipping !== "number" || data.pricing.shipping < 0) {
    errors.push("Valid shipping cost is required");
  }
  if (typeof data.pricing.tax !== "number" || data.pricing.tax < 0) {
    errors.push("Valid tax is required");
  }
  if (typeof data.pricing.total !== "number" || data.pricing.total <= 0) {
    errors.push("Valid total is required");
  }

  // Validate shipping and payment methods
  if (!["standard", "express"].includes(data.shippingMethod)) {
    errors.push("Valid shipping method is required");
  }

  if (!["creditcard", "mobilemoney", "cod"].includes(data.paymentMethod)) {
    errors.push("Valid payment method is required");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// GET - Get checkout info (for prefill)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { isLoggedIn: false },
        { status: 200 }
      );
    }

    // User is logged in - return their info for prefill
    const { findUserByEmail } = await import("@/lib/user-service");
    const user = await findUserByEmail(session.user.email || "");

    if (!user) {
      return NextResponse.json(
        { isLoggedIn: true, user: null },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        isLoggedIn: true,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.profile?.addresses?.[0] || null,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error getting checkout info:", error);
    return NextResponse.json(
      { error: "Failed to get checkout info" },
      { status: 500 }
    );
  }
}
