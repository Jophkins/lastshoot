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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto border-2 border-green-300 p-12" onClick={onClose}>
      <div className="bg-lime-200 flex items-end justify-center min-h-[calc(100vh-120px)] pb-20 text-center sm:block sm:p-0 border-4" onClick={stopPropagation}>
        <div>
          Header
          <button className="cursor-pointer" onClick={onClose}>X</button>
        </div>
        <div>
          Body
          <div className="relative max-h-[70vh] max-w-[80vw] w-full h-[70vh] p-4 border-2 border-violet-800">
            <Image className="object-contain" priority sizes="80vw" src={picture.url} alt={picture.alt || "Image"} fill />
          </div>
        </div>
        <div>
          Footer
        </div>
      </div>

    </div>
  );
}

export default ModalPic;
