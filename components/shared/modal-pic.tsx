import Image from "next/image";
import React, { useEffect } from "react";

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
};

type ModalPicProps = {
  onClose: () => void;
  picture: Picture;
};

function ModalPic({ onClose, picture }: ModalPicProps) {
  const stopPropagation = (e: React.SyntheticEvent) => e.stopPropagation();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape")
        onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const displayUrl = picture.previewUrl ?? picture.url;

  const hasExif = picture.cameraMake
    || picture.cameraModel
    || picture.lensModel
    || picture.focalLength
    || picture.aperture
    || picture.shutter
    || picture.iso;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 p-16" onClick={onClose}>
      <div
        className="relative flex min-h-[calc(100vh-120px)] flex-col items-center justify-center gap-4 rounded bg-white p-4 sm:flex-row sm:gap-8 sm:p-10"
        onClick={stopPropagation}
      >
        <span
          className="absolute right-4 top-2 cursor-pointer transition-all hover:text-2xl"
          onClick={onClose}
        >
          X
        </span>

        <div className="flex w-full flex-1 justify-center p-4 sm:w-auto">
          <Image
            className="h-auto max-h-[80vh] w-auto max-w-[80vw] rounded object-contain"
            priority
            sizes="80vw"
            src={displayUrl}
            alt={picture.alt || "Image"}
            width={1600}
            height={1600}
          />
        </div>

        <div className="flex-1 space-y-3 text-left sm:flex-none">
          {picture.title && (
            <h2 className="text-lg font-semibold">{picture.title}</h2>
          )}
          {picture.description && (
            <p className="text-sm text-neutral-600">{picture.description}</p>
          )}

          {hasExif && (
            <div className="space-y-1 text-xs text-neutral-500">
              {(picture.cameraMake || picture.cameraModel) && (
                <p>
                  {[picture.cameraMake, picture.cameraModel]
                    .filter(Boolean)
                    .join(" ")}
                </p>
              )}
              {picture.lensModel && <p>{picture.lensModel}</p>}
              <p>
                {[
                  picture.focalLength ? `${picture.focalLength}mm` : null,
                  picture.aperture ? `f/${picture.aperture}` : null,
                  picture.shutter,
                  picture.iso ? `ISO ${picture.iso}` : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
          )}

          {!hasExif && !picture.title && !picture.description && (
            <p className="text-sm text-neutral-400">No details available.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ModalPic;
