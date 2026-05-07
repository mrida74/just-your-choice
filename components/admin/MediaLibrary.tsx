"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { MediaItem } from "@/types/media";

type MediaStats = {
  totalFiles: number;
  totalSize: number;
  byType: Record<"image" | "document" | "video", { count: number; size: number }>;
};

export default function MediaLibrary() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [stats, setStats] = useState<MediaStats | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(50);

  // Filters
  const [typeFilter, setTypeFilter] = useState<"image" | "document" | "video" | "">("");
  const [searchFilter, setSearchFilter] = useState("");

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("skip", skip.toString());
      params.append("limit", limit.toString());
      params.append("includeStats", "true");
      if (typeFilter) params.append("type", typeFilter);
      if (searchFilter) params.append("search", searchFilter);

      const res = await fetch(`/api/admin/media?${params}`);
      const data = await res.json();
      setMedia(data.media || []);
      setTotal(data.total || 0);
      setStats(data.stats || null);
    } catch (err) {
      console.error("Failed to fetch media:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [skip, typeFilter, searchFilter]);

  const handleDelete = async (mediaId: string) => {
    if (!confirm("Delete this media?")) return;

    try {
      const res = await fetch(`/api/admin/media/${mediaId}`, { method: "DELETE" });
      if (res.ok) {
        setMedia(media.filter((m) => m.id !== mediaId));
      }
    } catch (err) {
      console.error("Failed to delete media:", err);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "image":
        return "🖼️";
      case "document":
        return "📄";
      case "video":
        return "🎬";
      default:
        return "📦";
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">Media</p>
          <h1 className="mt-2 text-2xl font-black text-zinc-900">Media Library</h1>
          <p className="mt-1 text-sm text-zinc-600">Manage all uploaded images, documents, and videos.</p>
        </div>
      </section>

      {/* Stats Cards */}
      {stats && (
        <section className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900">Storage</h2>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">Total Files</p>
              <p className="mt-2 text-2xl font-bold text-zinc-900">{stats.totalFiles}</p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">Total Size</p>
              <p className="mt-2 text-2xl font-bold text-zinc-900">{formatBytes(stats.totalSize)}</p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">Images</p>
              <p className="mt-2 text-lg font-bold text-zinc-900">{stats.byType.image.count}</p>
              <p className="text-xs text-zinc-600">{formatBytes(stats.byType.image.size)}</p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-600">Documents</p>
              <p className="mt-2 text-lg font-bold text-zinc-900">{stats.byType.document.count}</p>
              <p className="text-xs text-zinc-600">{formatBytes(stats.byType.document.size)}</p>
            </div>
          </div>
        </section>
      )}

      {/* Filters */}
      <section className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900">Filters</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value as any);
              setSkip(0);
            }}
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none"
          >
            <option value="">All Types</option>
            <option value="image">Images</option>
            <option value="document">Documents</option>
            <option value="video">Videos</option>
          </select>

          <input
            type="text"
            placeholder="Search media..."
            value={searchFilter}
            onChange={(e) => {
              setSearchFilter(e.target.value);
              setSkip(0);
            }}
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none"
          />

          <button
            onClick={() => {
              setTypeFilter("");
              setSearchFilter("");
              setSkip(0);
            }}
            className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
          >
            Clear Filters
          </button>
        </div>
      </section>

      {/* Media Grid */}
      <section className="rounded-3xl border border-pink-100 bg-white/90 p-6 shadow-sm backdrop-blur">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-zinc-600">
            Showing {media.length} of {total} files
          </p>
          {loading && <span className="text-xs text-zinc-500">Loading...</span>}
        </div>

        {media.length === 0 ? (
          <div className="py-12 text-center text-sm text-zinc-500">No media found.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {media.map((item) => (
              <div key={item.id} className="rounded-xl border border-zinc-200 bg-zinc-50 overflow-hidden hover:shadow-md transition-shadow">
                {/* Thumbnail */}
                <div className="relative h-32 bg-zinc-100 flex items-center justify-center overflow-hidden">
                  {item.type === "image" && item.url ? (
                    <Image
                      src={item.url}
                      alt={item.originalName}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 25vw"
                    />
                  ) : (
                    <span className="text-4xl">{getTypeIcon(item.type)}</span>
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className="text-xs font-semibold text-zinc-600 truncate">{item.originalName}</p>
                  <p className="text-xs text-zinc-500 mt-1">{formatBytes(item.size)}</p>
                  <p className="text-xs text-zinc-500">{item.uploadedByName}</p>

                  {/* Actions */}
                  <div className="mt-3 flex gap-2">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 rounded-lg border border-zinc-300 px-2 py-1 text-xs font-semibold text-zinc-700 hover:bg-white text-center"
                    >
                      View
                    </a>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="flex-1 rounded-lg border border-red-300 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > limit && (
          <div className="mt-6 flex items-center justify-between border-t border-zinc-200 pt-6">
            <div className="text-sm text-zinc-600">
              Page {Math.floor(skip / limit) + 1} of {Math.ceil(total / limit)}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setSkip(Math.max(0, skip - limit))}
                disabled={skip === 0}
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setSkip(skip + limit)}
                disabled={skip + limit >= total}
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
