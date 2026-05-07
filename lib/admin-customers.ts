import { connectToDatabase } from "@/lib/mongodb";
import { OrderModel } from "@/lib/models/Order";

export type CustomerSummary = {
  email: string;
  name: string;
  orders: number;
  totalSpent: number;
  lastOrderAt: string | null;
};

export async function getCustomerSummaries(limit = 20): Promise<CustomerSummary[]> {
  await connectToDatabase();

  const summaries = await OrderModel.aggregate([
    {
      $group: {
        _id: "$customer.email",
        name: { $first: "$customer.name" },
        orders: { $sum: 1 },
        totalSpent: { $sum: "$pricing.total" },
        lastOrderAt: { $max: "$createdAt" },
      },
    },
    { $sort: { totalSpent: -1 } },
    { $limit: Math.min(limit, 100) },
  ]);

  return summaries.map(
    (summary: {
      _id: string;
      name: string;
      orders: number;
      totalSpent: number;
      lastOrderAt: Date | null;
    }) => ({
      email: summary._id,
      name: summary.name || "Guest",
      orders: summary.orders,
      totalSpent: summary.totalSpent,
      lastOrderAt: summary.lastOrderAt
        ? summary.lastOrderAt.toISOString()
        : null,
    })
  );
}
