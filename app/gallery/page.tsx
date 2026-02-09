"use client";

import Image from "next/image";
import React, { useCallback, useEffect, useRef, useState } from "react";

import ModalPic from "@/components/shared/modal-pic";

type Picture = {
  id: string;
  url: string;
  previewUrl?: string;
  alt?: string;
  title?: string | null;
  description?: string | null;
  cameraMake?: string | null;
  cameraModel?: string | null;
  lensModel?: string | null;
  focalLength?: number | null;
  aperture?: number | null;
  shutter?: string | null;
  iso?: number | null;
  takenAt?: string | null;
  tags?: string[];
};

export default function GalleryPage() {
  const [pictures, setPictures] = useState<Picture[]>([]);
  const [cursor, setCursor] = useState<string | null>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);
  const [pictureForModal, setPictureForModal] = React.useState<Picture | null>(null);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (isLoading || cursor === null)
      return;

    setIsLoading(true);
    try {
      const params = cursor ? `?cursor=${cursor}` : "";
      const res = await fetch(`/api/pictures${params}`);

      if (!res.ok) {
        return;
      }

      const data: { pictures: Picture[]; nextCursor: string | null }
        = await res.json();

      setPictures(prev => [...prev, ...data.pictures]);
      setCursor(data.nextCursor);
    }
    catch {
      // silently fail — gallery will just stop loading
    }
    finally {
      setIsLoading(false);
    }
  }, [cursor, isLoading]);

  // initial load (intentionally empty deps — run once on mount)
  useEffect(() => {
    loadMore();
  }, []);

  // infinite scroll
  useEffect(() => {
    if (cursor === null)
      return; // nothing more to load

    const el = sentinelRef.current;
    if (!el)
      return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting) {
          loadMore();
        }
      },
      {
        root: null,
        rootMargin: "200px", // start loading BEFORE user hits the bottom
        threshold: 0,
      },
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [cursor, loadMore]);

  // split into 3 columns (simple mod-based distribution)
  const columns: Picture[][] = [[], [], []];
  pictures.forEach((picture, idx) => {
    columns[idx % 3].push(picture);
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="grid grid-cols-3 gap-4">
        {columns.map((col, colIndex) => (
          <div
            key={colIndex}
            className={`flex flex-col gap-4 ${
              colIndex === 1 ? "mt-15" : ""
            }`}
          >
            {col.map(picture => (
              <Image
                onClick={() => {
                  setIsModalOpen(true);
                  setPictureForModal(picture);
                }}
                key={picture.id}
                src={picture.url}
                alt={picture.alt ?? ""}
                width={800}
                height={1200}
                className="h-auto w-full cursor-pointer rounded-lg object-cover"
              />
            ))}
          </div>
        ))}
      </div>

      {/* sentinel for IntersectionObserver */}
      <div ref={sentinelRef} className="h-10" />

      {isLoading && (
        <p className="py-4 text-center text-sm text-neutral-500">Loading...</p>
      )}

      {cursor === null && !isLoading && pictures.length > 0 && (
        <p className="py-4 text-center text-xs text-neutral-500">
          That&apos;s all for now
        </p>
      )}

      {pictures.length === 0 && !isLoading && cursor === null && (
        <p className="py-12 text-center text-neutral-400">No photos yet.</p>
      )}

      {isModalOpen && pictureForModal && (
        <ModalPic
          onClose={() => setIsModalOpen(false)}
          picture={pictureForModal}
        />
      )}
    </div>
  );
}
