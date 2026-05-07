export type MediaType = "image" | "document" | "video";

export interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  type: MediaType;
  url: string;
  thumbnailUrl?: string;
  uploadedBy: string;
  uploadedByEmail: string;
  uploadedByName: string;
  uploadedAt: string;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    pages?: number;
  };
  tags?: string[];
  description?: string;
}

export interface MediaPayload {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  type: MediaType;
  url: string;
  thumbnailUrl?: string;
  uploadedBy: string;
  uploadedByEmail: string;
  uploadedByName: string;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    pages?: number;
  };
  tags?: string[];
  description?: string;
}

export interface MediaUploadResponse {
  id: string;
  url: string;
  filename: string;
}

export interface MediaFilterOptions {
  type?: MediaType;
  uploadedBy?: string;
  search?: string;
  tags?: string[];
  skip?: number;
  limit?: number;
}
