import type { ProductItem } from "@/types/product";
import type { CartItem } from "@/types/cart";

const CART_KEY = "just-your-choice-cart";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getCartItems(): CartItem[] {
  if (!isBrowser()) {
    return [];
  }

  const raw = window.localStorage.getItem(CART_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as CartItem[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch {
    return [];
  }
}

function saveCartItems(items: CartItem[]) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cart:updated"));
}

export function getCartCount() {
  return getCartItems().reduce((total, item) => total + item.quantity, 0);
}

export function addToCart(product: ProductItem, quantity: number = 1) {
  const items = getCartItems();
  const existing = items.find((item) => item.id === product._id);

  if (existing) {
    existing.quantity = Math.min(existing.quantity + quantity, product.stock);
  } else {
    items.push({
      id: product._id,
      title: product.title,
      price: product.price,
      image: product.images[0] || "/placeholder-product.svg",
      category: product.category,
      quantity: Math.min(quantity, product.stock),
      stock: product.stock,
    });
  }

  saveCartItems(items);
  return items;
}

export function removeFromCart(id: string) {
  const items = getCartItems().filter((item) => item.id !== id);
  saveCartItems(items);
  return items;
}

export function updateCartQuantity(id: string, quantity: number) {
  const items = getCartItems()
    .map((item) => {
      if (item.id !== id) {
        return item;
      }

      return {
        ...item,
        quantity: Math.min(Math.max(quantity, 1), item.stock),
      };
    })
    .filter((item) => item.quantity > 0);

  saveCartItems(items);
  return items;
}

export function clearCart() {
  const items: CartItem[] = [];
  saveCartItems(items);
  return items;
}
