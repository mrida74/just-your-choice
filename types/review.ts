export type ReviewStatus = "pending" | "approved" | "rejected";

export interface ReviewItem {
  id: string;
  productId: string;
  userId?: string;
  guestEmail?: string;
  guestName?: string;
  rating: number; // 1-5
  title?: string;
  content?: string;
  status: ReviewStatus;
  featured?: boolean;
  helpful: number; // count of helpful votes
  unhelpful: number; // count of unhelpful votes
  rejectionReason?: string;
  moderatedBy?: string;
  moderatedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReviewPayload {
  productId: string;
  userId?: string;
  guestEmail?: string;
  guestName?: string;
  rating: number;
  title?: string;
  content?: string;
}

export interface ReviewModerationPayload {
  status: ReviewStatus;
  featured?: boolean;
  rejectionReason?: string;
}
