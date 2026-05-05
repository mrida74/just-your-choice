"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  LayoutDashboard,
  Package,
  PlusCircle,
  RefreshCw,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

import {
  CATEGORY_LABELS,
  PRODUCT_CATEGORIES,
  type ProductCategory,
} from "@/lib/constants/categories";
import { formatPrice } from "@/lib/utils";
import type { ProductItem } from "@/types/product";

type FormState = {
  title: string;
  description: string;
  price: string;
  category: ProductCategory;
  images: string;
  stock: string;
};

type Order = {
  _id: string;
  orderNumber: string;
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  customer: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
  pricing: {
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
  };
  items: Array<{
    productId: string;
    title: string;
    price: number;
    quantity: number;
  }>;
  createdAt: string;
};

const initialFormState: FormState = {
  title: "",
  description: "",
  price: "",
  category: "saree",
  images: "",
  stock: "",
};

const STATUS_COLORS: Record<Order["status"], string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function AdminPanel({ products }: { products: ProductItem[] }) {
  const [tab, setTab] = useState<"products" | "orders">("products");
  const [productList, setProductList] = useState(products);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoaded, setOrdersLoaded] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<ProductCategory>("saree");
  const [form, setForm] = useState<FormState>(initialFormState);
  const [statusMessage, setStatusMessage] = useState("");
  const [ordersLoading, setOrdersLoading] = useState(false);

  const filteredProducts = useMemo(
    () => productList.filter((item) => item.category === selectedCategory),
    [productList, selectedCategory]
  );

  const totalProducts = productList.length;
  const activeOrders = orders.filter((order) => order.status !== "delivered" && order.status !== "cancelled").length;
  const pendingOrders = orders.filter((order) => order.status === "pending").length;
  const lowStockProducts = productList.filter((item) => item.stock <= 5).length;

  const navigationItems = [
    {
      key: "overview",
      label: "Overview",
      icon: LayoutDashboard,
      hint: "Dashboard snapshot",
      active: true,
    },
    {
      key: "products",
      label: "Products",
      icon: Package,
      hint: `${totalProducts} items`,
      active: tab === "products",
      onClick: () => setTab("products"),
    },
    {
      key: "orders",
      label: "Orders",
      icon: ShoppingBag,
      hint: ordersLoaded ? `${orders.length} orders` : ordersLoading ? "Loading..." : "Not loaded",
      active: tab === "orders",
      onClick: () => setTab("orders"),
    },
  ];

  // Auto-load orders on mount
  useEffect(() => {
    if (!ordersLoaded) {
      fetchOrders();
    }
  }, []);

  // Fetch orders if not loaded when tab changes to orders
  useEffect(() => {
    if (tab === "orders" && !ordersLoaded) {
      fetchOrders();
    }
  }, [tab]);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const response = await fetch("/api/orders");
      const data = (await response.json()) as { orders: Order[] };
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setStatusMessage("Failed to load orders");
    } finally {
      setOrdersLoading(false);
      setOrdersLoaded(true);
    }
  };

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage("Saving product...");

    const response = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        description: form.description,
        price: Number(form.price),
        category: form.category,
        images: form.images,
        stock: Number(form.stock),
      }),
    });

    const data = (await response.json()) as {
      product?: ProductItem;
      error?: string;
    };

    if (!response.ok || !data.product) {
      setStatusMessage(data.error ?? "Failed to create product.");
      return;
    }

    setProductList((previous) => [data.product!, ...previous]);
    setForm({ ...initialFormState, category: form.category });
    setStatusMessage("Product added successfully.");
  };

  const handleDelete = async (id: string) => {
    setStatusMessage("Deleting product...");

    const response = await fetch(`/api/products/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      setStatusMessage("Failed to delete product.");
      return;
    }

    setProductList((previous) => previous.filter((item) => item._id !== id));
    setStatusMessage("Product deleted.");
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order["status"]) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId ? { ...order, status: newStatus } : order
          )
        );
      }
    } catch (error) {
      console.error("Failed to update order:", error);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="h-fit rounded-3xl border border-pink-100 bg-white/90 p-4 shadow-[0_18px_40px_-30px_rgba(236,72,153,0.45)] backdrop-blur">
        <div className="rounded-2xl bg-linear-to-br from-pink-600 via-pink-500 to-orange-400 px-4 py-4 text-white shadow-[0_18px_35px_-25px_rgba(236,72,153,0.7)]">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/80">
            <Sparkles size={14} />
            Command center
          </div>
          <p className="mt-3 text-sm leading-6 text-white/90">
            Fast access to product creation, stock review, and order triage.
          </p>
        </div>

        <nav className="mt-4 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.key}
                type="button"
                onClick={item.onClick}
                className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition-colors ${
                  item.active
                    ? "bg-pink-600 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                      item.active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <Icon size={18} />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{item.label}</span>
                    <span
                      className={`block text-xs ${
                        item.active ? "text-white/80" : "text-gray-500"
                      }`}
                    >
                      {item.hint}
                    </span>
                  </span>
                </span>
              </button>
            );
          })}
        </nav>

        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-800">
            <AlertTriangle size={16} />
            Attention
          </div>
          <p className="mt-2 text-sm text-amber-700">
            {lowStockProducts} product{lowStockProducts === 1 ? "" : "s"} have low stock and need review.
          </p>
        </div>
      </aside>

      <section className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-pink-100 bg-white/90 p-5 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-600">Total products</p>
                <p className="mt-2 text-3xl font-black text-gray-900">{totalProducts}</p>
              </div>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-100 text-pink-600">
                <Package size={22} />
              </span>
            </div>
          </div>

          <div className="rounded-3xl border border-pink-100 bg-white/90 p-5 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-600">Active orders</p>
                <p className="mt-2 text-3xl font-black text-gray-900">
                  {ordersLoaded ? activeOrders : "—"}
                </p>
              </div>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-100 text-pink-600">
                <BarChart3 size={22} />
              </span>
            </div>
          </div>

          <div className="rounded-3xl border border-pink-100 bg-white/90 p-5 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-600">Pending orders</p>
                <p className="mt-2 text-3xl font-black text-gray-900">
                  {ordersLoaded ? pendingOrders : "—"}
                </p>
              </div>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-100 text-pink-600">
                <ShoppingBag size={22} />
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-3xl border border-pink-100 bg-linear-to-r from-white via-white to-pink-50 px-5 py-4 shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-600">Workspace</p>
            <h2 className="text-lg font-bold text-gray-900">
              {tab === "products" ? "Product operations" : "Order operations"}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => (tab === "orders" ? fetchOrders() : setStatusMessage("Ready to create a new product."))}
            className="inline-flex items-center gap-2 rounded-xl border border-pink-200 px-4 py-2 text-sm font-semibold text-pink-700 transition-colors hover:border-pink-300 hover:bg-pink-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </section>

      {/* Products Tab */}
      {tab === "products" && (
        <>
          <section className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-600">Catalog</p>
                <h2 className="text-2xl font-black text-gray-900">Add product</h2>
              </div>
              <div className="hidden items-center gap-2 rounded-full bg-pink-50 px-3 py-2 text-sm text-pink-600 md:inline-flex">
                <PlusCircle size={16} />
                Create a new listing
              </div>
            </div>

            <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreate}>
              <input
                required
                value={form.title}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, title: event.target.value }))
                }
                placeholder="Product title"
                className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors placeholder:text-gray-400 focus:border-pink-500 focus:bg-white focus:ring-2 focus:ring-pink-100"
              />
              <input
                required
                type="number"
                min={0}
                value={form.price}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, price: event.target.value }))
                }
                placeholder="Price"
                className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors placeholder:text-gray-400 focus:border-pink-500 focus:bg-white focus:ring-2 focus:ring-pink-100"
              />
              <textarea
                required
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, description: event.target.value }))
                }
                placeholder="Description"
                rows={3}
                className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors placeholder:text-gray-400 focus:border-pink-500 focus:bg-white focus:ring-2 focus:ring-pink-100"
              />
              <div className="space-y-3">
                <select
                  required
                  value={form.category}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      category: event.target.value as ProductCategory,
                    }))
                  }
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-pink-500 focus:bg-white focus:ring-2 focus:ring-pink-100"
                >
                  {PRODUCT_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {CATEGORY_LABELS[category]}
                    </option>
                  ))}
                </select>
                <input
                  required
                  value={form.images}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, images: event.target.value }))
                  }
                  placeholder="Image URLs (comma separated)"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors placeholder:text-gray-400 focus:border-pink-500 focus:bg-white focus:ring-2 focus:ring-pink-100"
                />
                <input
                  required
                  type="number"
                  min={0}
                  value={form.stock}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, stock: event.target.value }))
                  }
                  placeholder="Stock"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors placeholder:text-gray-400 focus:border-pink-500 focus:bg-white focus:ring-2 focus:ring-pink-100"
                />
              </div>
              <button
                type="submit"
                className="md:col-span-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-pink-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-pink-700 hover:shadow-[0_16px_35px_-20px_rgba(236,72,153,0.8)]"
              >
                Create Product
              </button>
            </form>
            <p className="mt-4 text-sm text-gray-600">{statusMessage}</p>
          </section>

          <section className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
            <div className="mb-5 flex flex-wrap gap-2">
              {PRODUCT_CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    selectedCategory === category
                      ? "bg-pink-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {CATEGORY_LABELS[category]}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-150 text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-600">
                    <th className="py-3">Title</th>
                    <th className="py-3">Price</th>
                    <th className="py-3">Stock</th>
                    <th className="py-3">Category</th>
                    <th className="py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((item) => (
                    <tr key={item._id} className="border-b border-gray-100 last:border-b-0">
                      <td className="py-4 font-medium text-gray-900">{item.title}</td>
                      <td className="py-4 text-gray-700">{formatPrice(item.price)}</td>
                      <td className="py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                            item.stock <= 5 ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {item.stock}
                        </span>
                      </td>
                      <td className="py-4 text-gray-700">{CATEGORY_LABELS[item.category]}</td>
                      <td className="py-4">
                        <button
                          type="button"
                          className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition-colors hover:border-pink-300 hover:text-pink-600 hover:bg-pink-50"
                          onClick={() => handleDelete(item._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {/* Orders Tab */}
      {tab === "orders" && (
        <section className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-600">Operations</p>
              <h2 className="text-2xl font-black text-gray-900">Recent orders</h2>
            </div>
            <div className="text-sm text-gray-600">Update status inline and keep the queue moving.</div>
          </div>

          {ordersLoading ? (
            <p className="text-sm text-gray-600">Loading orders...</p>
          ) : orders.length === 0 ? (
            <p className="text-sm text-gray-600">No orders yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-max text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-600">
                    <th className="px-2 py-3">Order #</th>
                    <th className="px-2 py-3">Customer</th>
                    <th className="px-2 py-3">Email</th>
                    <th className="px-2 py-3">Total</th>
                    <th className="px-2 py-3">Items</th>
                    <th className="px-2 py-3">Status</th>
                    <th className="px-2 py-3">Date</th>
                    <th className="px-2 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id} className="border-b border-gray-100 last:border-b-0">
                      <td className="px-2 py-4 font-semibold text-gray-900">{order.orderNumber}</td>
                      <td className="px-2 py-4 text-gray-700">
                        {order.customer.firstName} {order.customer.lastName}
                      </td>
                      <td className="px-2 py-4 text-gray-700">{order.customer.email}</td>
                      <td className="px-2 py-4 font-bold text-gray-900">
                        {formatPrice(order.pricing.total)}
                      </td>
                      <td className="px-2 py-4 text-gray-700">{order.items.length}</td>
                      <td className="px-2 py-4">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            updateOrderStatus(order._id, e.target.value as Order["status"])
                          }
                          className={`cursor-pointer rounded-full border-0 px-3 py-2 text-xs font-semibold ${
                            STATUS_COLORS[order.status]
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-2 py-4 text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-2 py-4">
                        <button className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition-colors hover:border-pink-300 hover:text-pink-600 hover:bg-pink-50">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
