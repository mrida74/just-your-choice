export const PRODUCT_CATEGORIES = [
  "saree",
  "clothing",
  "bags",
  "cosmetics",
  "skincare",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  saree: "Saree",
  clothing: "Women's Clothing",
  bags: "Bags & Leather",
  cosmetics: "Cosmetics",
  skincare: "Skincare",
};

export const CATEGORY_DESCRIPTIONS: Record<ProductCategory, string> = {
  saree: "Elegant sarees for every celebration and everyday grace.",
  clothing: "Comfortable and stylish outfits including salwar sets and dresses.",
  bags: "Premium bags and leather accessories crafted for modern lifestyles.",
  cosmetics: "Beauty essentials designed for long-lasting confidence.",
  skincare: "Nourishing skincare products for healthy, glowing skin.",
};

export function isProductCategory(value: string): value is ProductCategory {
  return PRODUCT_CATEGORIES.includes(value as ProductCategory);
}
