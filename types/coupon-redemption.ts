export interface CouponRedemptionItem {
  id: string;
  couponCode: string;
  userId?: string;
  guestEmail?: string;
  orderId: string;
  discountAmount: number;
  createdAt?: string;
}
