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
    <div className="fixed inset-0 z-50 bg-white/90 overflow-y-auto border-2 border-green-300 p-12" onClick={onClose}>
      <div className="bg-lime-500 flex items-center justify-center min-h-[calc(100vh-120px)] p-20 text-center border-2" onClick={stopPropagation}>
        <div className="relative flex justify-center max-h-[70vh] max-w-[80vw] w-full h-[70vh] p-4 border-2 border-violet-800">
          <Image className="object-fill" priority sizes="80vw" src={picture.url} alt={picture.alt || "Image"} fill />
        </div>
        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eaque, laboriosam?</p>
      </div>
    </div>
  );
}

export default ModalPic;
