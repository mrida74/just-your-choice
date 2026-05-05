"use client";

import { useCallback, useState } from "react";
import type { CheckoutRequest, CheckoutResponse, CheckoutInfoResponse } from "@/types/checkout";

export function useCheckout() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Get checkout info (for prefill if user is logged in)
   */
  const getCheckoutInfo = useCallback(async (): Promise<CheckoutInfoResponse | null> => {
    try {
      setError(null);
      const response = await fetch("/api/checkout/place-order", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load checkout info");
      }

      return await response.json();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load checkout info";
      setError(message);
      return null;
    }
  }, []);

  /**
   * Place order
   */
  const placeOrder = useCallback(
    async (checkoutData: CheckoutRequest): Promise<CheckoutResponse | null> => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/checkout/place-order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(checkoutData),
        });

        const data: CheckoutResponse = await response.json();

        if (!response.ok) {
          setError(data.message || "Checkout failed");
          return null;
        }

        return data;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Checkout failed";
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Check if email exists (for account merge detection)
   */
  const checkEmailExists = useCallback(async (email: string): Promise<{
    exists: boolean;
    hasAccount: boolean;
    userId?: string;
  } | null> => {
    try {
      // This endpoint doesn't exist yet - we'd call place-order validation endpoint
      // For now, we'll check during actual checkout
      return null;
    } catch (err) {
      console.error("Error checking email:", err);
      return null;
    }
  }, []);

  return {
    isLoading,
    error,
    getCheckoutInfo,
    placeOrder,
    checkEmailExists,
  };
}
