export type RefundStatus = "pending" | "approved" | "processing" | "completed" | "failed" | "cancelled";
export type RefundReason = "defective" | "wrong_item" | "not_as_described" | "damaged_in_shipping" | "customer_request" | "other";
export type ReturnStatus = "initiated" | "approved" | "in_transit" | "received" | "inspected" | "completed" | "cancelled" | "rejected";

export interface RefundItem {
  id: string;
  orderId: string;
  refundReason: RefundReason;
  refundAmount: number;
  partialItems?: Array<{
    productId: string;
    quantity: number;
    amount: number;
  }>;
  status: RefundStatus;
  requestedAt: string;
  approvedAt?: string;
  processedAt?: string;
  completedAt?: string;
  approvedBy?: string;
  notes?: string;
  customerNotes?: string;
  trackingNumber?: string;
  timeline: RefundTimeline[];
}

export interface RefundTimeline {
  timestamp: string;
  status: RefundStatus;
  message: string;
  updatedBy?: string;
}

export interface ReturnItem {
  id: string;
  orderId: string;
  shippingLabel?: string;
  status: ReturnStatus;
  reason: RefundReason;
  condition?: string;
  initiatedAt: string;
  approvedAt?: string;
  receivedAt?: string;
  inspectionNotes?: string;
  returnedItem?: {
    productId: string;
    quantity: number;
  };
  refundId?: string;
  timeline: ReturnTimeline[];
}

export interface ReturnTimeline {
  timestamp: string;
  status: ReturnStatus;
  message: string;
  updatedBy?: string;
}

export interface RefundPayload {
  orderId: string;
  refundReason: RefundReason;
  refundAmount: number;
  partialItems?: Array<{
    productId: string;
    quantity: number;
    amount: number;
  }>;
  notes?: string;
}

export interface ReturnPayload {
  orderId: string;
  reason: RefundReason;
  condition?: string;
}

export interface RefundFilterOptions {
  orderId?: string;
  status?: RefundStatus;
  refundReason?: RefundReason;
  skip?: number;
  limit?: number;
}

export interface ReturnFilterOptions {
  orderId?: string;
  status?: ReturnStatus;
  skip?: number;
  limit?: number;
}
