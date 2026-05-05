"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { ChevronRight, Loader2, AlertCircle } from "lucide-react";

import { clearCart, getCartItems } from "@/lib/cart";
import { formatPrice, getSafeImageSrc } from "@/lib/utils";
import type { CartItem } from "@/types/cart";

type FormData = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  shippingMethod: "standard" | "express";
  paymentMethod: "creditcard" | "mobilemoney" | "cod";
  notes: string;
};

const SHIPPING_COST = {
  standard: 100,
  express: 200,
};

const TAX_RATE = 0.1; // 10% VAT

export default function CheckoutView() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1: Shipping, 2: Review, 3: Payment
  const [createAccount, setCreateAccount] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "Bangladesh",
    shippingMethod: "standard",
    paymentMethod: "cod",
    notes: "",
  });

  const { data: session } = useSession();

  useEffect(() => {
    setItems(getCartItems());
    setIsHydrated(true);

    const sync = () => setItems(getCartItems());
    window.addEventListener("cart:updated", sync);

    return () => window.removeEventListener("cart:updated", sync);
  }, []);

  // If user is signed in, fetch profile and prefill address
  useEffect(() => {
    if (!session?.user?.email) return;

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/me");
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;

        setFormData((prev) => ({
          ...prev,
          email: data.email || prev.email,
          firstName: data.profile?.firstName || data.name?.split(" ")?.[0] || prev.firstName,
          lastName: data.profile?.lastName || data.name?.split(" ")?.slice(1).join(" ") || prev.lastName,
          phone: data.phone || prev.phone,
          address: data.profile?.address?.street || prev.address,
          city: data.profile?.address?.city || prev.city,
          postalCode: data.profile?.address?.postalCode || prev.postalCode,
          country: data.profile?.address?.country || prev.country,
        }));
      } catch (err) {
        // ignore
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [session?.user?.email]);

  const subtotal = useMemo(
    () => (items ?? []).reduce((total, item) => total + item.price * item.quantity, 0),
    [items]
  );

  const shipping = SHIPPING_COST[formData.shippingMethod];
  const tax = Math.round((subtotal + shipping) * TAX_RATE);
  const total = subtotal + shipping + tax;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCreateAccount(e.target.checked);
  };

  const validateShippingStep = () => {
    if (!formData.email || !formData.firstName || !formData.lastName || !formData.phone) {
      setError("Please fill in all contact information");
      return false;
    }
    if (!formData.address || !formData.city || !formData.postalCode) {
      setError("Please fill in all address information");
      return false;
    }
    setError("");
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateShippingStep()) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country,
          shippingMethod: formData.shippingMethod,
          paymentMethod: formData.paymentMethod,
          notes: formData.notes,
          items: items.map((item) => ({
            productId: item.id,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            size: "", // Add size if needed
          })),
          createAccount: createAccount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to place order");
      }

      // Clear cart
      clearCart();

      // Redirect to success page
      router.push(`/order-success/${data.order.orderNumber}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsLoading(false);
    }
  };

  if (!isHydrated) {
    return (
      <div className="rounded-3xl border border-pink-100 bg-white p-8 shadow-sm">
        <p className="text-sm text-zinc-600">Loading checkout...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-pink-100 bg-white p-8 shadow-sm">
        <p className="text-sm text-zinc-600">Your cart is empty. Add products to continue.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
      {/* Checkout Form */}
      <section className="space-y-6">
        {/* Step 1: Shipping Address */}
        <div className="rounded-3xl border border-pink-100 bg-white p-4 sm:p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-600 text-white font-bold text-sm">
              1
            </div>
            <h2 className="text-lg font-bold text-zinc-900">Shipping Address</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-pink-100 px-4 py-2 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none"
                placeholder="your@email.com"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-pink-100 px-4 py-2 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-pink-100 px-4 py-2 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-pink-100 px-4 py-2 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none"
                placeholder="+880 1712 345678"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1">
                Street Address *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-pink-100 px-4 py-2 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none"
                placeholder="123 Main Street"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-pink-100 px-4 py-2 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none"
                  placeholder="Dhaka"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1">
                  Postal Code *
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-pink-100 px-4 py-2 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none"
                  placeholder="1200"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1">
                Country
              </label>
              <select
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-pink-100 px-4 py-2 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none"
              >
                <option>Bangladesh</option>
                <option>India</option>
                <option>Pakistan</option>
                <option>Sri Lanka</option>
                <option>Nepal</option>
              </select>
            </div>
          </div>
        </div>

        {/* Step 2: Shipping & Payment */}
        <div className="rounded-3xl border border-pink-100 bg-white p-4 sm:p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-600 text-white font-bold text-sm">
              2
            </div>
            <h2 className="text-lg font-bold text-zinc-900">Shipping & Payment</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-3">
                Shipping Method
              </label>
              <div className="space-y-2">
                {[
                  { id: "standard", label: "Standard Shipping", desc: "3-7 days inside Dhaka, 4-7 days outside", cost: 100 },
                  { id: "express", label: "Express Shipping", desc: "24-48 hours inside Dhaka only", cost: 200 },
                ].map((method) => (
                  <label key={method.id} className="flex items-center gap-3 rounded-2xl border border-pink-100 p-3 cursor-pointer hover:bg-pink-50 transition-colors">
                    <input
                      type="radio"
                      name="shippingMethod"
                      value={method.id}
                      checked={formData.shippingMethod === method.id}
                      onChange={handleInputChange}
                      className="accent-pink-600"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-zinc-900">{method.label}</div>
                      <div className="text-xs text-zinc-600">{method.desc}</div>
                    </div>
                    <div className="font-semibold text-pink-600">৳ {method.cost}</div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-3">
                Payment Method
              </label>
              <div className="space-y-2">
                {[
                  { id: "cod", label: "Cash on Delivery", icon: "💳" },
                  { id: "mobilemoney", label: "Mobile Money (bKash, Nagad)", icon: "📱" },
                  { id: "creditcard", label: "Credit/Debit Card", icon: "💰" },
                ].map((method) => (
                  <label key={method.id} className="flex items-center gap-3 rounded-2xl border border-pink-100 p-3 cursor-pointer hover:bg-pink-50 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={formData.paymentMethod === method.id}
                      onChange={handleInputChange}
                      className="accent-pink-600"
                    />
                    <span className="text-lg">{method.icon}</span>
                    <span className="font-semibold text-sm text-zinc-900">{method.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1">
                Order Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full rounded-2xl border border-pink-100 px-4 py-2 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none"
                placeholder="Any special instructions for delivery..."
              />
            </div>
          </div>
        </div>

          {/* Create account checkbox for guests */}
          {!session?.user && (
            <div className="rounded-2xl border border-pink-100 bg-white p-4 flex items-center gap-3">
              <input
                id="createAccount"
                type="checkbox"
                checked={createAccount}
                onChange={handleCheckboxChange}
                className="accent-pink-600 h-4 w-4"
              />
              <label htmlFor="createAccount" className="text-sm text-zinc-700">
                Create an account with this email after placing the order
              </label>
            </div>
          )}

          {/* Error Message */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Place Order Button */}
        <button
          onClick={handlePlaceOrder}
          disabled={isLoading}
          className="w-full bg-black text-white font-bold py-3 rounded-full transition-all hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Place Order
              <ChevronRight size={18} />
            </>
          )}
        </button>
      </section>

      {/* Order Summary */}
      <section className="rounded-3xl border border-pink-100 bg-white p-4 sm:p-6 shadow-sm h-fit lg:sticky lg:top-6">
        <h2 className="mb-4 text-lg font-bold text-zinc-900">Order Summary</h2>

        <div className="space-y-3 border-b border-pink-100 pb-4 mb-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-3 text-sm">
              <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-pink-50 shrink-0">
                <Image
                  src={getSafeImageSrc(item.image)}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
              <div className="flex-1">
                <p className="line-clamp-1 font-semibold text-zinc-900">{item.title}</p>
                <p className="text-xs text-zinc-600">Qty: {item.quantity}</p>
                <p className="font-bold text-pink-600">{formatPrice(item.price * item.quantity)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2 text-sm mb-4">
          <div className="flex justify-between text-zinc-600">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-zinc-600">
            <span>Shipping</span>
            <span>{formatPrice(shipping)}</span>
          </div>
          <div className="flex justify-between text-zinc-600">
            <span>VAT (10%)</span>
            <span>{formatPrice(tax)}</span>
          </div>
          <div className="flex justify-between border-t border-pink-100 pt-2 font-bold text-lg text-zinc-900">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>

        <p className="text-xs text-zinc-600 leading-relaxed">
          By placing an order, you agree to our terms and conditions. Your order is secure and your data is protected.
        </p>
      </section>
    </div>
  );
}
