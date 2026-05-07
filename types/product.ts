import type { ProductCategory } from "@/lib/constants/categories";

export interface ProductItem {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: ProductCategory;
  images: string[];
  stock: number;
  status?: "active" | "draft" | "out_of_stock";
  featured?: boolean;
  slug?: string;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  variants?: Array<{
    sku?: string;
    size?: string;
    color?: string;
    price?: number;
    stock?: number;
  }>;
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
  status?: "active" | "draft" | "out_of_stock";
  featured?: boolean;
  slug?: string;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  variants?: Array<{
    sku?: string;
    size?: string;
    color?: string;
    price?: number;
    stock?: number;
  }>;
}
