import React from "react";

type ModalPicProps = {
  onClose: () => void;
};

function ModalPic({ onClose }: ModalPicProps) {
  const stopPropagation = (e: React.SyntheticEvent) => e.stopPropagation();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto border-2 border-green-300 p-12" onClick={onClose}>
      <div className="flex items-end justify-center min-h-[calc(100vh-120px)] pb-20 text-center sm:block sm:p-0 border-4" onClick={stopPropagation}>
        <div>
          Header
          <button>X</button>
        </div>
        <div>
          Body
        </div>
        <div>
          Footer
        </div>
      </div>

    </div>
  );
}

export default ModalPic;
