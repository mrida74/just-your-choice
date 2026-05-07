export type ShippingCarrier = "fedex" | "ups" | "usps" | "dhl" | "other";
export type ShippingStatus = "pending" | "processing" | "shipped" | "in_transit" | "delivered" | "returned" | "lost" | "cancelled";

export interface ShippingRate {
  id: string;
  carrier: ShippingCarrier;
  weight: number; // in lbs
  maxWeight: number;
  zone: number; // shipping zone
  price: number;
  estimatedDays: number;
}

export interface ShippingItem {
  id: string;
  orderId: string;
  carrier: ShippingCarrier;
  trackingNumber: string;
  status: ShippingStatus;
  estimatedDelivery?: string;
  actualDelivery?: string;
  weight?: number;
  cost: number;
  insuranceAmount?: number;
  signature?: boolean;
  notes?: string;
  events: ShippingEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface ShippingEvent {
  timestamp: string;
  status: ShippingStatus;
  location?: string;
  message: string;
}

export interface ShippingPayload {
  orderId: string;
  carrier: ShippingCarrier;
  trackingNumber: string;
  weight?: number;
  cost: number;
  insuranceAmount?: number;
  signature?: boolean;
  notes?: string;
  estimatedDelivery?: string;
}

export interface CarrierServiceItem {
  id: string;
  name: ShippingCarrier;
  apiKey?: string;
  enabled: boolean;
  baseUrl?: string;
  contact?: {
    email?: string;
    phone?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CarrierServicePayload {
  name: ShippingCarrier;
  apiKey?: string;
  enabled: boolean;
  baseUrl?: string;
  contact?: {
    email?: string;
    phone?: string;
  };
}

export interface ShippingFilterOptions {
  orderId?: string;
  carrier?: ShippingCarrier;
  status?: ShippingStatus;
  trackingNumber?: string;
  skip?: number;
  limit?: number;
}
