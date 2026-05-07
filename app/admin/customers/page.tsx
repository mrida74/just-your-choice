import { getCustomerSummaries } from "@/lib/admin-customers";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminCustomersPage() {
  const customers = await getCustomerSummaries(25);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">
            Customer insights
          </p>
          <h1 className="mt-2 text-2xl font-black text-zinc-900">Customers</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Track top customers, spending, and repeat purchase behavior.
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-500">
                <th className="py-3">Customer</th>
                <th className="py-3">Email</th>
                <th className="py-3">Orders</th>
                <th className="py-3 text-right">Total spent</th>
                <th className="py-3">Last order</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-sm text-zinc-500">
                    No customers yet.
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.email} className="border-b border-zinc-100 last:border-b-0">
                    <td className="py-4 text-sm font-semibold text-zinc-900">
                      {customer.name}
                    </td>
                    <td className="py-4 text-zinc-600">{customer.email}</td>
                    <td className="py-4 text-zinc-600">{customer.orders}</td>
                    <td className="py-4 text-right font-semibold text-zinc-900">
                      {formatPrice(customer.totalSpent)}
                    </td>
                    <td className="py-4 text-zinc-500">
                      {customer.lastOrderAt
                        ? new Date(customer.lastOrderAt).toLocaleDateString()
                        : "--"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
