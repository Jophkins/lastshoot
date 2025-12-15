import Image from "next/image";
import React from "react";

const images = [
  "https://picsum.photos/id/10/1200/600",
  "https://picsum.photos/seed/429/800/1200",
  "https://picsum.photos/seed/529/800/1200",
  "https://picsum.photos/seed/629/800/1200",
  "https://picsum.photos/seed/729/800/1200",
  "https://picsum.photos/seed/829/800/1200",
  "https://picsum.photos/seed/929/800/1200",
  "https://picsum.photos/seed/109/800/1200",
];

function MasonryGallery() {
  return (
    <>
      <div className="columns-1 sm:columns-2 lg:columns-3 py-10 md:py-20 gap-4">
        {images.map((src, index) => (
          <div key={index} className="mb-4 break-inside-avoid">
            <Image src={src} alt="tst" width="400" height="400" className="w-full object-cover rounded-lg" />
          </div>
        ))}
      </div>
    </>
  );
}
export default MasonryGallery;
