import Image from "next/image";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../lib/auth";
import SignOutButton from "../../components/SignOutButton";
import { connectToDatabase } from "../../lib/mongodb";
import { OrderModel } from "../../lib/models/Order";

export default async function AccountPage() {
  const session = (await getServerSession(authOptions as any)) as Session | null;

  if (!session) {
    redirect(`/login?callbackUrl=/account`);
  }

  const user = session?.user;

  // Fetch recent orders for this user (match by customer email)
  await connectToDatabase();
  const orders = await OrderModel.find({
    $or: [{ "customer.email": user?.email }, { guestEmail: user?.email }],
  })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow">
        <div className="flex items-center gap-6">
          {user?.image ? (
            <Image
              src={user.image}
              alt={user.name ?? "Avatar"}
              width={96}
              height={96}
              className="rounded-full"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-pink-50 text-pink-600">
              {user?.name?.charAt(0) ?? "U"}
            </div>
          )}

          <div>
            <h1 className="text-2xl font-semibold text-zinc-900">{user?.name}</h1>
            <p className="text-sm text-zinc-600">{user?.email}</p>
            <p className="mt-2 text-sm text-zinc-500">Member since your OAuth provider</p>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <SignOutButton />
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
          >
            Back to shop
          </a>
        </div>

        {/* Orders / Tracking */}
        <div id="order-tracking" className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900">Recent Orders</h2>
          {orders && orders.length > 0 ? (
            <ul className="space-y-4">
              {orders.map((order: any) => (
                <li key={order.orderNumber} className="rounded-lg border border-zinc-100 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-zinc-800">Order {order.orderNumber}</div>
                      <div className="text-xs text-zinc-500">{new Date(order.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="mb-1 text-sm font-semibold text-zinc-900">৳{order.pricing?.total?.toFixed(2) ?? order.pricing?.total}</div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-pink-50 px-3 py-1 text-xs font-medium text-pink-600">
                        {order.status}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <a
                      href={`/order-success/${order.orderNumber}`}
                      className="text-sm text-pink-600 hover:underline"
                    >
                      View details
                    </a>
                    <div className="text-sm text-zinc-600">{order.items?.length ?? 0} items</div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-zinc-600">No recent orders found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
