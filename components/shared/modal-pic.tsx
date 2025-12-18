import Image from "next/image";
import React, { useEffect } from "react";

type Picture = {
  id: string;
  url: string;
  alt?: string;
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

  return (
    <div className="fixed inset-0 z-50 bg-black/80 overflow-y-auto border-2 border-green-300 p-16" onClick={onClose}>
      <div className="relative bg-white flex flex-col gap-4 p-4 sm:flex-row sm:gap-8 sm:p-10 items-center justify-center min-h-[calc(100vh-120px)]" onClick={stopPropagation}>
        <span className="absolute top-2 right-4 cursor-pointer hover:text-2xl transition-all" onClick={onClose}>X</span>
        <div className="flex flex-1 justify-center w-full sm:w-auto p-4">
          <Image className="object-contain max-h-[80vh] max-w-[80vw] w-auto h-auto" priority sizes="80vw" src={picture.url} alt={picture.alt || "Image"} width={1600} height={1600} />
        </div>

        <p className="flex-1 sm:flex-none text-left">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eaque, laboriosam?</p>

      </div>
    </div>
  );
}

export default ModalPic;
