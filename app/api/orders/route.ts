import { connectToDatabase } from "@/lib/mongodb";
import { OrderModel } from "@/lib/models/Order";
import ProductModel from "@/lib/models/Product";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      email,
      firstName,
      lastName,
      phone,
      address,
      city,
      postalCode,
      country,
      items,
      shippingMethod,
      paymentMethod,
      notes,
    } = body;

    // Validate required fields
    if (!email || !firstName || !lastName || !phone || !address || !city || !postalCode || !country) {
      return NextResponse.json(
        { error: "Missing required shipping information" },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Order must contain at least one item" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Calculate totals
    const subtotal = items.reduce(
      (total: number, item: any) => total + item.price * item.quantity,
      0
    );

    // Shipping cost
    const shipping = shippingMethod === "express" ? 200 : 100;

    // Tax calculation (VAT 10%)
    const tax = Math.round((subtotal + shipping) * 0.1);

    const total = subtotal + shipping + tax;

    // Verify stock and prepare items
    const verifiedItems = [];
    for (const item of items) {
      const product = await ProductModel.findById(item.productId);

      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.title} not found` },
          { status: 404 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.title}` },
          { status: 400 }
        );
      }

      verifiedItems.push({
        productId: item.productId,
        title: product.title,
        price: product.price,
        quantity: item.quantity,
        size: item.size || undefined,
      });

      // Reduce stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Create order
    const order = new OrderModel({
      customer: {
        email: email.toLowerCase(),
        firstName,
        lastName,
        phone,
      },
      shipping: {
        address,
        city,
        postalCode,
        country,
      },
      items: verifiedItems,
      pricing: {
        subtotal,
        shipping,
        tax,
        total,
      },
      shippingMethod,
      paymentMethod,
      notes,
      status: "pending",
    });

    await order.save();

    return NextResponse.json(
      {
        success: true,
        order: {
          id: order._id,
          orderNumber: order.orderNumber,
          total: order.pricing.total,
          email: order.customer.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create order. Please try again." },
      { status: 500 }
    );
  }
}

// GET all orders (admin use)
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const orders = await OrderModel.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

