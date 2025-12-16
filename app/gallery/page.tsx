"use client";

import Image from "next/image";
import React, { useCallback, useEffect, useRef, useState } from "react";

import ModalPic from "@/components/shared/modal-pic";

type Picture = {
  id: string;
  url: string;
  alt?: string;
};

export default function GalleryPage() {
  const [pictures, setPictures] = useState<Picture[]>([]);
  const [cursor, setCursor] = useState<number | null>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);
  const [pictureForModal, setPictureForModal] = React.useState<Picture | null>(null);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (isLoading || cursor === null)
      return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/pictures?cursor=${cursor}`);

      if (!res.ok) {
        console.error("Fetch failed:", res.status);
        return;
      }

      const data: { pictures: Picture[]; nextCursor: number | null }
        = await res.json();

      setPictures(prev => [...prev, ...data.pictures]);
      setCursor(data.nextCursor ?? null);
    }
    catch (err) {
      console.error(err);
    }
    finally {
      setIsLoading(false);
    }
  }, [cursor, isLoading]);

  // initial load
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
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button className="p-4 bg-amber-500 border-3 rounded cursor-pointer hover:bg-amber-950" onClick={() => setIsModalOpen(true)}>MODAL</button>
      <div className="grid grid-cols-3 gap-4">
        {columns.map((col, colIndex) => (
          <div
            key={colIndex}
            className={`flex flex-col gap-4 ${
              colIndex === 1 ? "mt-15" : ""
            }`} // middle column shifted
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
                className="w-full h-auto rounded-lg object-cover"
              />
            ))}
          </div>
        ))}
      </div>

      {/* sentinel for IntersectionObserver */}
      <div ref={sentinelRef} className="h-10" />

      {isLoading && (
        <p className="py-4 text-center text-sm text-neutral-500">Loading…</p>
      )}

      {cursor === null && !isLoading && pictures.length > 0 && (
        <p className="py-4 text-center text-xs text-neutral-500">
          That&apos;s all for now
        </p>
      )}
      {isModalOpen && pictureForModal && <ModalPic onClose={() => setIsModalOpen(false)} picture={pictureForModal} />}
      {/* <MasonryGallery />  //just testing */}
    </div>
  );
}
