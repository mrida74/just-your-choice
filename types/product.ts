import type { ProductCategory } from "@/lib/constants/categories";

export interface ProductItem {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: ProductCategory;
  images: string[];
  stock: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductPayload {
  title: string;
  description: string;
  price: number;
  category: ProductCategory;
  images: string[];
  stock: number;
}
