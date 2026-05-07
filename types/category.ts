export type CategoryStatus = "active" | "hidden";

export type CategorySEO = {
  title?: string;
  description?: string;
  keywords?: string[];
};

export type CategoryItem = {
  id: string;
  slug: string;
  label: string;
  description?: string;
  bannerImage?: string;
  heroImage?: string;
  featured?: boolean;
  status: CategoryStatus;
  sortOrder: number;
  seo?: CategorySEO;
  createdAt?: string;
  updatedAt?: string;
};

export type CategoryPayload = {
  slug: string;
  label: string;
  description?: string;
  bannerImage?: string;
  heroImage?: string;
  featured?: boolean;
  status?: CategoryStatus;
  sortOrder?: number;
  seo?: CategorySEO;
};
