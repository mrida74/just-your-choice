import { connectToDatabase } from "@/lib/mongodb";
import { OrderModel } from "@/lib/models/Order";
import ProductModel from "@/lib/models/Product";
import type { ProductCategory } from "@/lib/constants/categories";

export type AdminOrderSummary = {
  id: string;
  orderNumber: string;
  status: string;
  customerName: string;
  total: number;
  createdAt: string | null;
};

export type LowStockProduct = {
  id: string;
  title: string;
  category: ProductCategory;
  stock: number;
};

export type AdminDashboardSnapshot = {
  stats: {
    totalProducts: number;
    lowStockProducts: number;
    totalOrders: number;
    pendingOrders: number;
    deliveredOrders: number;
    revenueTotal: number;
  };
  recentOrders: AdminOrderSummary[];
  lowStock: LowStockProduct[];
};

export async function getAdminDashboardSnapshot(): Promise<AdminDashboardSnapshot> {
  await connectToDatabase();

  const [totalProducts, lowStockProducts] = await Promise.all([
    ProductModel.countDocuments(),
    ProductModel.countDocuments({ stock: { $lte: 5 } }),
  ]);

  const orderStats = await OrderModel.aggregate([
    {
      $match: {
        status: { $ne: "cancelled" },
      },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        revenue: { $sum: "$pricing.total" },
      },
    },
  ]);

  const statsMap = new Map(
    orderStats.map((entry: { _id: string; count: number; revenue: number }) => [
      entry._id,
      entry,
    ])
  );

  const totalOrders = orderStats.reduce(
    (sum: number, entry: { count: number }) => sum + entry.count,
    0
  );
  const revenueTotal = orderStats.reduce(
    (sum: number, entry: { revenue: number }) => sum + entry.revenue,
    0
  );

  const recentOrders = await OrderModel.find()
    .sort({ createdAt: -1 })
    .limit(6)
    .lean();

  const lowStock = await ProductModel.find({ stock: { $lte: 5 } })
    .sort({ stock: 1 })
    .limit(6)
    .lean();

  return {
    stats: {
      totalProducts,
      lowStockProducts,
      totalOrders,
      pendingOrders: statsMap.get("pending")?.count ?? 0,
      deliveredOrders: statsMap.get("delivered")?.count ?? 0,
      revenueTotal,
    },
    recentOrders: recentOrders.map((order) => ({
      id: order._id.toString(),
      orderNumber: order.orderNumber ?? "",
      status: order.status,
      customerName: order.customer?.name ?? "Guest",
      total: order.pricing?.total ?? 0,
      createdAt: order.createdAt ? order.createdAt.toISOString() : null,
    })),
    lowStock: lowStock.map((product) => ({
      id: product._id.toString(),
      title: product.title,
      category: product.category as ProductCategory,
      stock: product.stock,
    })),
  };
}
