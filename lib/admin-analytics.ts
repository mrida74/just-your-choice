import { connectToDatabase } from "@/lib/mongodb";
import { OrderModel } from "@/lib/models/Order";
import type { ProductCategory } from "@/lib/constants/categories";

export type RevenuePoint = {
  date: string;
  revenue: number;
  orders: number;
};

export type OrderFunnelEntry = {
  status: string;
  count: number;
  revenue: number;
};

export type CategoryPerformance = {
  category: ProductCategory | "unknown";
  revenue: number;
  units: number;
};

export type TopProduct = {
  id: string;
  title: string;
  category?: ProductCategory | "unknown";
  revenue: number;
  units: number;
};

export type CustomerRepeatStats = {
  totalCustomers: number;
  repeatCustomers: number;
  repeatRate: number;
  avgOrdersPerCustomer: number;
  avgOrderValue: number;
};

const DEFAULT_DAYS = 30;

function getStartDate(days: number) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - Math.max(days - 1, 0));
  startDate.setHours(0, 0, 0, 0);
  return startDate;
}

export async function getRevenueTrend(days = DEFAULT_DAYS): Promise<RevenuePoint[]> {
  await connectToDatabase();

  const startDate = getStartDate(days);

  const summary = await OrderModel.aggregate([
    { $match: { createdAt: { $gte: startDate }, status: { $ne: "cancelled" } } },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        revenue: { $sum: "$pricing.total" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const map = new Map<string, RevenuePoint>();
  summary.forEach((entry: { _id: string; revenue: number; orders: number }) => {
    map.set(entry._id, {
      date: entry._id,
      revenue: entry.revenue || 0,
      orders: entry.orders || 0,
    });
  });

  const result: RevenuePoint[] = [];
  for (let i = 0; i < days; i += 1) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    const key = date.toISOString().split("T")[0];
    result.push(
      map.get(key) || {
        date: key,
        revenue: 0,
        orders: 0,
      }
    );
  }

  return result;
}

export async function getOrderFunnel(): Promise<OrderFunnelEntry[]> {
  await connectToDatabase();

  const stats = await OrderModel.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        revenue: { $sum: "$pricing.total" },
      },
    },
  ]);

  return stats.map((entry: { _id: string; count: number; revenue: number }) => ({
    status: entry._id,
    count: entry.count || 0,
    revenue: entry.revenue || 0,
  }));
}

export async function getCategoryPerformance(days = 90): Promise<CategoryPerformance[]> {
  await connectToDatabase();

  const startDate = getStartDate(days);

  const results = await OrderModel.aggregate([
    { $match: { createdAt: { $gte: startDate }, status: { $ne: "cancelled" } } },
    { $unwind: "$items" },
    {
      $lookup: {
        from: "products",
        localField: "items.productId",
        foreignField: "_id",
        as: "product",
      },
    },
    {
      $addFields: {
        product: { $arrayElemAt: ["$product", 0] },
      },
    },
    {
      $group: {
        _id: { $ifNull: ["$product.category", "unknown"] },
        revenue: { $sum: "$items.total" },
        units: { $sum: "$items.quantity" },
      },
    },
    { $sort: { revenue: -1 } },
  ]);

  return results.map(
    (entry: { _id: ProductCategory | "unknown"; revenue: number; units: number }) => ({
      category: entry._id,
      revenue: entry.revenue || 0,
      units: entry.units || 0,
    })
  );
}

export async function getTopProducts(days = 90, limit = 8): Promise<TopProduct[]> {
  await connectToDatabase();

  const startDate = getStartDate(days);

  const results = await OrderModel.aggregate([
    { $match: { createdAt: { $gte: startDate }, status: { $ne: "cancelled" } } },
    { $unwind: "$items" },
    {
      $lookup: {
        from: "products",
        localField: "items.productId",
        foreignField: "_id",
        as: "product",
      },
    },
    {
      $addFields: {
        product: { $arrayElemAt: ["$product", 0] },
      },
    },
    {
      $group: {
        _id: "$items.productId",
        title: { $first: "$items.title" },
        category: { $first: { $ifNull: ["$product.category", "unknown"] } },
        revenue: { $sum: "$items.total" },
        units: { $sum: "$items.quantity" },
      },
    },
    { $sort: { revenue: -1 } },
    { $limit: Math.min(limit, 20) },
  ]);

  return results.map(
    (entry: {
      _id: { toString(): string };
      title: string;
      category?: ProductCategory | "unknown";
      revenue: number;
      units: number;
    }) => ({
      id: entry._id.toString(),
      title: entry.title,
      category: entry.category,
      revenue: entry.revenue || 0,
      units: entry.units || 0,
    })
  );
}

export async function getCustomerRepeatStats(): Promise<CustomerRepeatStats> {
  await connectToDatabase();

  const results = await OrderModel.aggregate([
    {
      $group: {
        _id: "$customer.email",
        orders: { $sum: 1 },
        revenue: { $sum: "$pricing.total" },
      },
    },
  ]);

  const totalCustomers = results.length;
  const repeatCustomers = results.filter((entry: { orders: number }) => entry.orders > 1).length;
  const totalOrders = results.reduce(
    (sum: number, entry: { orders: number }) => sum + entry.orders,
    0
  );
  const totalRevenue = results.reduce(
    (sum: number, entry: { revenue: number }) => sum + entry.revenue,
    0
  );

  return {
    totalCustomers,
    repeatCustomers,
    repeatRate: totalCustomers ? repeatCustomers / totalCustomers : 0,
    avgOrdersPerCustomer: totalCustomers ? totalOrders / totalCustomers : 0,
    avgOrderValue: totalOrders ? totalRevenue / totalOrders : 0,
  };
}
