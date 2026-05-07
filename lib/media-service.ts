import { connectToDatabase } from "@/lib/mongodb";
import MediaModel from "@/lib/models/Media";
import type { MediaItem, MediaPayload, MediaFilterOptions } from "@/types/media";

function serializeMedia(doc: any): MediaItem {
  return {
    id: doc._id.toString(),
    filename: doc.filename,
    originalName: doc.originalName,
    mimetype: doc.mimetype,
    size: doc.size,
    type: doc.type,
    url: doc.url,
    thumbnailUrl: doc.thumbnailUrl ?? undefined,
    uploadedBy: doc.uploadedBy?.toString(),
    uploadedByEmail: doc.uploadedByEmail ?? undefined,
    uploadedByName: doc.uploadedByName ?? undefined,
    metadata: doc.metadata
      ? {
          width: doc.metadata.width ?? undefined,
          height: doc.metadata.height ?? undefined,
          duration: doc.metadata.duration ?? undefined,
          pages: doc.metadata.pages ?? undefined,
        }
      : undefined,
    tags: doc.tags ?? undefined,
    description: doc.description ?? undefined,
    uploadedAt: doc.createdAt?.toISOString(),
  };
}

/**
 * Create a media entry.
 */
export async function createMedia(payload: MediaPayload): Promise<MediaItem> {
  await connectToDatabase();

  const media = new MediaModel({
    filename: payload.filename,
    originalName: payload.originalName,
    mimetype: payload.mimetype,
    size: payload.size,
    type: payload.type,
    url: payload.url,
    thumbnailUrl: payload.thumbnailUrl,
    uploadedBy: payload.uploadedBy,
    uploadedByEmail: payload.uploadedByEmail.toLowerCase().trim(),
    uploadedByName: payload.uploadedByName,
    metadata: payload.metadata,
    tags: payload.tags || [],
    description: payload.description,
  });

  const saved = await media.save();
  return serializeMedia(saved);
}

/**
 * Get media items with filters.
 */
export async function getMedia(options: MediaFilterOptions = {}): Promise<MediaItem[]> {
  await connectToDatabase();

  const query: any = { isPublic: true };

  if (options.type) query.type = options.type;
  if (options.uploadedBy) query.uploadedBy = options.uploadedBy;

  if (options.search) {
    query.$text = { $search: options.search };
  }

  if (options.tags && options.tags.length > 0) {
    query.tags = { $in: options.tags };
  }

  const skip = options.skip ?? 0;
  const limit = options.limit ?? 50;

  const docs = await MediaModel.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return docs.map(serializeMedia);
}

/**
 * Get media by ID.
 */
export async function getMediaById(mediaId: string): Promise<MediaItem | null> {
  await connectToDatabase();

  const doc = await MediaModel.findById(mediaId).lean();
  return doc ? serializeMedia(doc) : null;
}

/**
 * Get all media (admin view, no public filter).
 */
export async function getAllMedia(options: MediaFilterOptions = {}): Promise<MediaItem[]> {
  await connectToDatabase();

  const query: any = {};

  if (options.type) query.type = options.type;
  if (options.uploadedBy) query.uploadedBy = options.uploadedBy;

  if (options.search) {
    query.$text = { $search: options.search };
  }

  if (options.tags && options.tags.length > 0) {
    query.tags = { $in: options.tags };
  }

  const skip = options.skip ?? 0;
  const limit = options.limit ?? 50;

  const docs = await MediaModel.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return docs.map(serializeMedia);
}

/**
 * Count media items.
 */
export async function countMedia(options: MediaFilterOptions = {}): Promise<number> {
  await connectToDatabase();

  const query: any = {};

  if (options.type) query.type = options.type;
  if (options.uploadedBy) query.uploadedBy = options.uploadedBy;

  if (options.search) {
    query.$text = { $search: options.search };
  }

  if (options.tags && options.tags.length > 0) {
    query.tags = { $in: options.tags };
  }

  return MediaModel.countDocuments(query);
}

/**
 * Update media metadata.
 */
export async function updateMedia(
  mediaId: string,
  updates: Partial<Pick<MediaPayload, "tags" | "description">>
): Promise<MediaItem | null> {
  await connectToDatabase();

  const update: any = {};
  if (updates.tags !== undefined) update.tags = updates.tags;
  if (updates.description !== undefined) update.description = updates.description;

  const updated = await MediaModel.findByIdAndUpdate(mediaId, { $set: update }, { new: true }).lean();
  return updated ? serializeMedia(updated) : null;
}

/**
 * Delete media.
 */
export async function deleteMedia(mediaId: string): Promise<boolean> {
  await connectToDatabase();

  const result = await MediaModel.deleteOne({ _id: mediaId });
  return result.deletedCount === 1;
}

/**
 * Get media by type.
 */
export async function getMediaByType(type: "image" | "document" | "video", limit = 50): Promise<MediaItem[]> {
  await connectToDatabase();

  const docs = await MediaModel.find({ type, isPublic: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return docs.map(serializeMedia);
}

/**
 * Get recently uploaded media.
 */
export async function getRecentMedia(limit = 20): Promise<MediaItem[]> {
  await connectToDatabase();

  const docs = await MediaModel.find({ isPublic: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return docs.map(serializeMedia);
}

/**
 * Get storage statistics.
 */
export async function getMediaStats(): Promise<{
  totalFiles: number;
  totalSize: number;
  byType: Record<"image" | "document" | "video", { count: number; size: number }>;
}> {
  await connectToDatabase();

  const stats = await MediaModel.aggregate([
    {
      $group: {
        _id: "$type",
        count: { $sum: 1 },
        totalSize: { $sum: "$size" },
      },
    },
  ]);

  const totalFiles = await MediaModel.countDocuments();
  const totalSize = await MediaModel.aggregate([
    {
      $group: {
        _id: null,
        totalSize: { $sum: "$size" },
      },
    },
  ]);

  const result: any = {
    totalFiles,
    totalSize: totalSize[0]?.totalSize || 0,
    byType: {
      image: { count: 0, size: 0 },
      document: { count: 0, size: 0 },
      video: { count: 0, size: 0 },
    },
  };

  for (const stat of stats) {
    result.byType[stat._id] = { count: stat.count, size: stat.totalSize };
  }

  return result;
}
