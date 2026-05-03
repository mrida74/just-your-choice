export function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export const DEFAULT_PRODUCT_IMAGE = "/placeholder-product.svg";

export function getSafeImageSrc(src?: string | null) {
  if (typeof src !== "string") {
    return DEFAULT_PRODUCT_IMAGE;
  }

  const value = src.trim();
  if (!value) {
    return DEFAULT_PRODUCT_IMAGE;
  }

  if (value.startsWith("/") && !/\s/.test(value)) {
    return value;
  }

  try {
    const parsed = new URL(value);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.href;
    }
  } catch {
    return DEFAULT_PRODUCT_IMAGE;
  }

  return DEFAULT_PRODUCT_IMAGE;
}

export function getSafeImageList(images: string[] | null | undefined) {
  const safeImages = (images ?? [])
    .map((image) => getSafeImageSrc(image))
    .filter((image, index, list) => list.indexOf(image) === index);

  return safeImages.length > 0 ? safeImages : [DEFAULT_PRODUCT_IMAGE];
}
