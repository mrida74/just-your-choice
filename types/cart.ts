import type { ProductCategory } from "@/lib/constants/categories";

export interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  category: ProductCategory;
  quantity: number;
  stock: number;
}
