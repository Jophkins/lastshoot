"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

type PhotoItem = {
  id: string;
  thumbUrl: string;
  title: string | null;
  isPublished: boolean;
  deletedAt: string | null;
  createdAt: string;
};

type Filter = "all" | "published" | "draft" | "deleted";

export default function AdminPhotosPage() {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [cursor, setCursor] = useState<string | null>("");
  const [filter, setFilter] = useState<Filter>("all");
  const [isLoading, setIsLoading] = useState(false);

  const loadPhotos = useCallback(async (reset = false) => {
    setIsLoading(true);
    const c = reset ? "" : cursor;
    const params = new URLSearchParams();
    if (c)
      params.set("cursor", c);
    if (filter !== "all")
      params.set("filter", filter);

    const res = await fetch(`/api/photos?${params.toString()}`);
    if (!res.ok) {
      setIsLoading(false);
      return;
    }

    const data = await res.json() as { photos: PhotoItem[]; nextCursor: string | null };

    setPhotos(prev => (reset ? data.photos : [...prev, ...data.photos]));
    setCursor(data.nextCursor);
    setIsLoading(false);
  }, [cursor, filter]);

  useEffect(() => {
    loadPhotos(true);
  }, [filter]);

  async function togglePublish(id: string, currentlyPublished: boolean) {
    await fetch(`/api/photos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !currentlyPublished }),
    });
    loadPhotos(true);
  }

  async function softDelete(id: string) {
    await fetch(`/api/photos/${id}/delete`, { method: "POST" });
    loadPhotos(true);
  }

  async function restore(id: string) {
    await fetch(`/api/photos/${id}/restore`, { method: "POST" });
    loadPhotos(true);
  }

  const filters: { label: string; value: Filter }[] = [
    { label: "All", value: "all" },
    { label: "Published", value: "published" },
    { label: "Drafts", value: "draft" },
    { label: "Deleted", value: "deleted" },
  ];

  return (
    <div className="mx-auto max-w-4xl py-8">
      <h1 className="mb-6 text-2xl font-bold">Manage Photos</h1>

      {/* Filter tabs */}
      <div className="mb-6 flex gap-2">
        {filters.map(f => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={`rounded-lg px-4 py-1.5 text-sm ${
              filter === f.value
                ? "bg-neutral-900 text-white"
                : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Photo grid */}
      {photos.length === 0 && !isLoading && (
        <p className="py-12 text-center text-neutral-400">No photos found.</p>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {photos.map(photo => (
          <div
            key={photo.id}
            className={`group relative overflow-hidden rounded-lg border ${
              photo.deletedAt ? "opacity-50" : ""
            }`}
          >
            <Image
              src={photo.thumbUrl}
              alt={photo.title ?? "Photo"}
              width={400}
              height={400}
              className="aspect-square w-full object-cover"
            />

            {/* Overlay with actions */}
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
              <p className="mb-2 truncate text-sm font-medium text-white">
                {photo.title ?? "Untitled"}
              </p>
              <div className="flex gap-1.5">
                {!photo.deletedAt && (
                  <>
                    <ActionButton
                      label={photo.isPublished ? "Unpublish" : "Publish"}
                      onClick={() => togglePublish(photo.id, photo.isPublished)}
                    />
                    <ActionButton
                      label="Delete"
                      onClick={() => softDelete(photo.id)}
                      destructive
                    />
                  </>
                )}
                {photo.deletedAt && (
                  <ActionButton
                    label="Restore"
                    onClick={() => restore(photo.id)}
                  />
                )}
              </div>
            </div>

            {/* Status badge */}
            <div className="absolute right-2 top-2">
              {photo.isPublished && !photo.deletedAt && (
                <span className="rounded bg-green-500/80 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  Published
                </span>
              )}
              {!photo.isPublished && !photo.deletedAt && (
                <span className="rounded bg-yellow-500/80 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  Draft
                </span>
              )}
              {photo.deletedAt && (
                <span className="rounded bg-red-500/80 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  Deleted
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Load more */}
      {cursor && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => loadPhotos(false)}
            disabled={isLoading}
            className="rounded-lg bg-neutral-100 px-6 py-2 text-sm hover:bg-neutral-200 disabled:opacity-50"
          >
            {isLoading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  destructive = false,
}: {
  label: string;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded px-2 py-1 text-[11px] font-medium ${
        destructive
          ? "bg-red-500 text-white hover:bg-red-600"
          : "bg-white/90 text-neutral-800 hover:bg-white"
      }`}
    >
      {label}
    </button>
  );
}
