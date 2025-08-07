"use client";

import React from "react";
import Images from "./ModalImages/Images";
import Map from "./ModalImages/Map";
//   const images = [
//     { id: 1, url: "/images/anh1.jpg" },
//     { id: 2, url: "/images/anh2.jpg" },
//     { id: 3, url: "/images/anh3.jpg" },
//     { id: 4, url: "/images/anh4.jpg" },
//     { id: 5, url: "/images/anh5.jpg" },
//   ];

interface ImageType {
  id: number;
  url: string;
}

interface OpenImagesProps {
  images: ImageType[];
  indexImg: number;
  address: string;
  onClose: () => void;
}

export default function OpenImages({
  images,
  indexImg,
  address,
  onClose,
}: OpenImagesProps) {
  const [isActive, setIsActive] = React.useState(true);
  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-stone-900 h-full">
      <div className="relative w-full h-full rounded-xl shadow-lg flex flex-col">
        <div className="sticky top-0 z-10 flex justify-center items-center gap-2 flex-wrap sm:px-4 h-20 py-5 bg-stone-900">
          <div
            onClick={() => setIsActive(true)}
            className={`p-2 rounded-xl cursor-pointer ${
              isActive ? "bg-white text-black" : "bg-transparent text-white"
            }`}
          >
            Images
          </div>
          <div
            onClick={() => setIsActive(false)}
            className={`p-2 rounded-xl cursor-pointer ${
              isActive ? "bg-transparent text-white" : "bg-white text-black"
            }`}
          >
            Map
          </div>
          <button
            className="absolute top-2 right-2 text-white rounded-xl p-2 hover:text-gray-400"
            onClick={onClose}
            aria-label="Đóng"
          >
            <span className="text-3xl text-white">×</span>
          </button>
        </div>
        {/* Nội dung ảnh/map full vùng còn lại */}
        <div
          className="flex-1 w-full h-full overflow-y-auto scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {isActive ? (
            <Images images={images} indexImg={indexImg} />
          ) : (
            <Map address={address} />
          )}
        </div>
      </div>
    </div>
  );
}
