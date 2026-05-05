"use client";

import React, { useState, useEffect } from "react";
import { useCheckout } from "@/lib/hooks/useCheckout";
import type { CheckoutRequest, CheckoutCustomerInfo } from "@/types/checkout";
import { useSession } from "next-auth/react";

interface CheckoutFormProps {
  items: Array<{
    productId: string;
    title: string;
    price: number;
    quantity: number;
  }>;
  onSuccess?: (orderNumber: string) => void;
  onError?: (error: string) => void;
}

export function CheckoutForm({ items, onSuccess, onError }: CheckoutFormProps) {
  const { data: session } = useSession();
  const { isLoading, error, placeOrder, getCheckoutInfo } = useCheckout();

  // Form state
  const [customerInfo, setCustomerInfo] = useState<CheckoutCustomerInfo>({
    name: "",
    email: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
  });

  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard");
  const [paymentMethod, setPaymentMethod] = useState<"creditcard" | "mobilemoney" | "cod">("cod");
  const [createAccount, setCreateAccount] = useState(false);
  const [notes, setNotes] = useState("");
  const [showMergeConfirm, setShowMergeConfirm] = useState(false);
  const [existingAccountEmail, setExistingAccountEmail] = useState<string | null>(null);

  // Load checkout info if user is logged in
  useEffect(() => {
    const loadCheckoutInfo = async () => {
      const info = await getCheckoutInfo();
      if (info?.isLoggedIn && info.user) {
        setCustomerInfo({
          name: info.user.name || "",
          email: info.user.email,
          phone: info.user.phone || "",
          address: info.user.address || {
            street: "",
            city: "",
            state: "",
            zipCode: "",
            country: "",
          },
        });
      }
    };

    loadCheckoutInfo();
  }, [getCheckoutInfo]);

  // Calculate pricing
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = shippingMethod === "express" ? 10 : 5; // Example costs
  const taxRate = 0.1; // 10% tax
  const tax = subtotal * taxRate;
  const total = subtotal + shippingCost + tax;

  const handleCustomerInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setCustomerInfo({
        ...customerInfo,
        address: {
          ...customerInfo.address,
          [addressField]: value,
        },
      });
    } else {
      setCustomerInfo({
        ...customerInfo,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const checkoutRequest: CheckoutRequest = {
        items,
        customerInfo,
        pricing: {
          subtotal,
          shipping: shippingCost,
          tax,
          total,
        },
        shippingMethod,
        paymentMethod,
        createAccount,
        notes: notes || undefined,
      };

      const response = await placeOrder(checkoutRequest);

      if (!response?.success) {
        const errorMsg = error || response?.message || "Checkout failed";
        onError?.(errorMsg);
        return;
      }

      if (response.accountStatus === "merged" && !showMergeConfirm) {
        // Account merge - show confirmation
        setExistingAccountEmail(customerInfo.email);
        setShowMergeConfirm(true);
        return;
      }

      // Success
      onSuccess?.(response.order?.orderNumber || "");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Checkout failed";
      onError?.(errorMsg);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information */}
        <section className="border rounded-lg p-4">
          <h2 className="text-xl font-bold mb-4">Delivery Information</h2>

          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={customerInfo.name}
              onChange={handleCustomerInfoChange}
              required
              className="col-span-2 px-3 py-2 border rounded"
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={customerInfo.email}
              onChange={handleCustomerInfoChange}
              required
              className="col-span-2 px-3 py-2 border rounded"
            />

            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={customerInfo.phone}
              onChange={handleCustomerInfoChange}
              required
              className="col-span-2 px-3 py-2 border rounded"
            />

            <input
              type="text"
              name="address.street"
              placeholder="Street Address"
              value={customerInfo.address.street}
              onChange={handleCustomerInfoChange}
              required
              className="col-span-2 px-3 py-2 border rounded"
            />

            <input
              type="text"
              name="address.city"
              placeholder="City"
              value={customerInfo.address.city}
              onChange={handleCustomerInfoChange}
              required
              className="px-3 py-2 border rounded"
            />

            <input
              type="text"
              name="address.state"
              placeholder="State/Province"
              value={customerInfo.address.state}
              onChange={handleCustomerInfoChange}
              className="px-3 py-2 border rounded"
            />

            <input
              type="text"
              name="address.zipCode"
              placeholder="Zip Code"
              value={customerInfo.address.zipCode}
              onChange={handleCustomerInfoChange}
              required
              className="px-3 py-2 border rounded"
            />

            <input
              type="text"
              name="address.country"
              placeholder="Country"
              value={customerInfo.address.country}
              onChange={handleCustomerInfoChange}
              required
              className="px-3 py-2 border rounded"
            />
          </div>

          {/* Create Account Checkbox */}
          <div className="mt-4 p-3 bg-blue-50 rounded">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={createAccount}
                onChange={(e) => setCreateAccount(e.target.checked)}
                className="mt-1"
              />
              <div>
                <p className="font-medium">Create account for faster checkout</p>
                <p className="text-sm text-gray-600">
                  Save your information, track orders, and enjoy exclusive offers
                </p>
              </div>
            </label>
          </div>
        </section>

        {/* Shipping Method */}
        <section className="border rounded-lg p-4">
          <h2 className="text-xl font-bold mb-4">Shipping Method</h2>

          <div className="space-y-2">
            <label className="flex items-center gap-3">
              <input
                type="radio"
                name="shipping"
                value="standard"
                checked={shippingMethod === "standard"}
                onChange={(e) => setShippingMethod(e.target.value as "standard")}
              />
              <span>Standard Shipping (5-7 days) - ৳{shippingCost}</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="radio"
                name="shipping"
                value="express"
                checked={shippingMethod === "express"}
                onChange={(e) => setShippingMethod(e.target.value as "express")}
              />
              <span>Express Shipping (2-3 days) - ৳10</span>
            </label>
          </div>
        </section>

        {/* Payment Method */}
        <section className="border rounded-lg p-4">
          <h2 className="text-xl font-bold mb-4">Payment Method</h2>

          <div className="space-y-2">
            <label className="flex items-center gap-3">
              <input
                type="radio"
                name="payment"
                value="cod"
                checked={paymentMethod === "cod"}
                onChange={(e) => setPaymentMethod(e.target.value as "creditcard" | "mobilemoney" | "cod")}
              />
              <span>Cash on Delivery</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="radio"
                name="payment"
                value="mobilemoney"
                checked={paymentMethod === "mobilemoney"}
                onChange={(e) => setPaymentMethod(e.target.value as "creditcard" | "mobilemoney" | "cod")}
              />
              <span>Mobile Money</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="radio"
                name="payment"
                value="creditcard"
                checked={paymentMethod === "creditcard"}
                onChange={(e) => setPaymentMethod(e.target.value as "creditcard" | "mobilemoney" | "cod")}
              />
              <span>Credit Card</span>
            </label>
          </div>
        </section>

        {/* Notes */}
        <section className="border rounded-lg p-4">
          <label>
            <p className="font-medium mb-2">Order Notes (Optional)</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special instructions..."
              className="w-full px-3 py-2 border rounded"
              rows={3}
            />
          </label>
        </section>

        {/* Order Summary */}
        <section className="border rounded-lg p-4 bg-gray-50">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>

          <div className="space-y-2 mb-4">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between">
                <span>
                  {item.title} x {item.quantity}
                </span>
                <span>৳{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>৳{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>৳{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>৳{shippingCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
              <span>Total</span>
              <span>৳{total.toFixed(2)}</span>
            </div>
          </div>
        </section>

        {/* Error Messages */}
        {error && <div className="p-4 bg-red-100 text-red-700 rounded">{error}</div>}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? "Processing..." : "Place Order"}
        </button>
      </form>

      {/* Merge Confirmation Modal */}
      {showMergeConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm">
            <h3 className="text-lg font-bold mb-3">Account Already Exists</h3>
            <p className="mb-4">
              An account with email {existingAccountEmail} already exists. Your order will be linked to this account.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowMergeConfirm(false);
                  setCreateAccount(false);
                }}
                className="flex-1 px-4 py-2 border rounded hover:bg-gray-50"
              >
                Continue as Guest
              </button>
              <button
                onClick={() => setShowMergeConfirm(false)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Link to Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
