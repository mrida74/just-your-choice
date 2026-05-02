"use client";

import { useEffect, useMemo, useState } from "react";
import { Package, ShoppingBag } from "lucide-react";

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
  const [selectedCategory, setSelectedCategory] =
    useState<ProductCategory>("saree");
  const [form, setForm] = useState<FormState>(initialFormState);
  const [statusMessage, setStatusMessage] = useState("");
  const [ordersLoading, setOrdersLoading] = useState(false);

  const filteredProducts = useMemo(
    () => productList.filter((item) => item.category === selectedCategory),
    [productList, selectedCategory]
  );

  // Fetch orders when tab changes to orders
  useEffect(() => {
    if (tab === "orders" && orders.length === 0) {
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
    <div className="space-y-8">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-pink-100">
        <button
          onClick={() => setTab("products")}
          className={`flex items-center gap-2 px-4 py-3 font-bold transition-colors ${
            tab === "products"
              ? "border-b-2 border-pink-600 text-pink-600"
              : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          <Package size={18} />
          Products
        </button>
        <button
          onClick={() => setTab("orders")}
          className={`flex items-center gap-2 px-4 py-3 font-bold transition-colors ${
            tab === "orders"
              ? "border-b-2 border-pink-600 text-pink-600"
              : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          <ShoppingBag size={18} />
          Orders
        </button>
      </div>

      {/* Products Tab */}
      {tab === "products" && (
        <>
          <section className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-zinc-900">Add Product</h2>
            <form className="grid gap-3 md:grid-cols-2" onSubmit={handleCreate}>
              <input
                required
                value={form.title}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, title: event.target.value }))
                }
                placeholder="Product title"
                className="rounded-xl border border-pink-200 px-3 py-2 text-sm outline-none ring-pink-400 focus:ring-2"
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
                className="rounded-xl border border-pink-200 px-3 py-2 text-sm outline-none ring-pink-400 focus:ring-2"
              />
              <textarea
                required
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, description: event.target.value }))
                }
                placeholder="Description"
                rows={3}
                className="rounded-xl border border-pink-200 px-3 py-2 text-sm outline-none ring-pink-400 focus:ring-2"
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
                  className="w-full rounded-xl border border-pink-200 px-3 py-2 text-sm outline-none ring-pink-400 focus:ring-2"
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
                  className="w-full rounded-xl border border-pink-200 px-3 py-2 text-sm outline-none ring-pink-400 focus:ring-2"
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
                  className="w-full rounded-xl border border-pink-200 px-3 py-2 text-sm outline-none ring-pink-400 focus:ring-2"
                />
              </div>
              <button
                type="submit"
                className="md:col-span-2 rounded-xl bg-pink-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-pink-700"
              >
                Create Product
              </button>
            </form>
            <p className="mt-3 text-sm text-zinc-600">{statusMessage}</p>
          </section>

          <section className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap gap-2">
              {PRODUCT_CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                    selectedCategory === category
                      ? "bg-pink-600 text-white"
                      : "bg-pink-50 text-pink-600"
                  }`}
                >
                  {CATEGORY_LABELS[category]}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-150 text-left text-sm">
                <thead>
                  <tr className="border-b border-pink-100 text-zinc-500">
                    <th className="py-2">Title</th>
                    <th className="py-2">Price</th>
                    <th className="py-2">Stock</th>
                    <th className="py-2">Category</th>
                    <th className="py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((item) => (
                    <tr key={item._id} className="border-b border-pink-50">
                      <td className="py-2">{item.title}</td>
                      <td className="py-2">{formatPrice(item.price)}</td>
                      <td className="py-2">{item.stock}</td>
                      <td className="py-2">{CATEGORY_LABELS[item.category]}</td>
                      <td className="py-2">
                        <button
                          type="button"
                          className="rounded-lg border border-pink-300 px-3 py-1 text-xs font-semibold text-pink-600 transition-colors hover:bg-pink-50"
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
        <section className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-zinc-900">Recent Orders</h2>

          {ordersLoading ? (
            <p className="text-sm text-zinc-600">Loading orders...</p>
          ) : orders.length === 0 ? (
            <p className="text-sm text-zinc-600">No orders yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-max text-left text-sm">
                <thead>
                  <tr className="border-b border-pink-100 text-zinc-500">
                    <th className="py-2 px-2">Order #</th>
                    <th className="py-2 px-2">Customer</th>
                    <th className="py-2 px-2">Email</th>
                    <th className="py-2 px-2">Total</th>
                    <th className="py-2 px-2">Items</th>
                    <th className="py-2 px-2">Status</th>
                    <th className="py-2 px-2">Date</th>
                    <th className="py-2 px-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id} className="border-b border-pink-50">
                      <td className="py-2 px-2 font-semibold">{order.orderNumber}</td>
                      <td className="py-2 px-2">
                        {order.customer.firstName} {order.customer.lastName}
                      </td>
                      <td className="py-2 px-2">{order.customer.email}</td>
                      <td className="py-2 px-2 font-bold text-pink-600">
                        {formatPrice(order.pricing.total)}
                      </td>
                      <td className="py-2 px-2">{order.items.length}</td>
                      <td className="py-2 px-2">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            updateOrderStatus(order._id, e.target.value as Order["status"])
                          }
                          className={`rounded-lg px-2 py-1 text-xs font-semibold border-0 cursor-pointer ${
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
                      <td className="py-2 px-2 text-xs">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-2 px-2">
                        <button className="rounded-lg border border-pink-300 px-3 py-1 text-xs font-semibold text-pink-600 transition-colors hover:bg-pink-50">
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
