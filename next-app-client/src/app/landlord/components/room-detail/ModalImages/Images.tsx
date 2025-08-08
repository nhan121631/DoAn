/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { URL_IMAGE } from "@/services/Constant";
import Image from "next/image";
import React from "react";
import { FaAngleLeft } from "react-icons/fa";

export default function Images({ images, indexImg, onClose }: any) {
  // currentIndex là index của mảng, không phải id
  const [currentIndex, setCurrentIndex] = React.useState(indexImg);
  React.useEffect(() => {
    setCurrentIndex(indexImg);
  }, [indexImg]);

  const handlePrev = () => {
    setCurrentIndex((prev: any) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNext = () => {
    setCurrentIndex((prev: any) =>
      prev < images.length - 1 ? prev + 1 : prev
    );
  };
  const handleItem = (idx: number) => {
    if (idx < 0) idx = 0;
    if (idx >= images.length) idx = images.length - 1;
    setCurrentIndex(idx);
    if (typeof onClose === "function") {
      onClose(idx);
    }
  };

  return (
    <div className="relative bg-stone-900 flex flex-col shadow w-full max-w-4xl mx-auto dark:bg-gray-800 rounded-lg">
      <div className="flex justify-between items-center flex-wrap px-2 sm:px-4 md:px-8 pt-8">
        <button
          className="me-10 flex h-10 w-10 sm:h-12 sm:w-12 bg-white/30 border-none justify-center items-center  transition hover:bg-orange-200"
          onClick={handlePrev}
        >
          <FaAngleLeft className="text-xl sm:text-2xl" />
        </button>
        <div className="flex-1 flex justify-center items-center">
          {images.length > 0 &&
          images[currentIndex] &&
          typeof images[currentIndex].url === "string" ? (
            <Image
              className="object-cover"
              src={
                images[currentIndex].url.startsWith("http")
                  ? images[currentIndex].url
                  : `${URL_IMAGE}${images[currentIndex].url}`
              }
              alt="room image"
              width={800}
              height={400}
              sizes="(max-width: 640px) 90vw, (max-width: 1024px) 70vw, 800px"
              style={{
                width: "800px",
                height: "500px",
              }}
              priority
            />
          ) : (
            <div className="w-full h-[300px] flex items-center justify-center bg-gray-200 text-gray-500">
              No image available
            </div>
          )}
        </div>
        <button
          className="ms-10 flex h-10 w-10 sm:h-12 sm:w-12 bg-white/30 border-none justify-center items-center transition hover:bg-orange-200 transform -scale-x-100"
          onClick={handleNext}
        >
          <FaAngleLeft className="text-xl sm:text-2xl" />
        </button>
      </div>
      <div className="flex flex-wrap justify-center items-center bg-stone-900 px-2 py-3 dark:bg-[#232b3b] rounded-b-lg">
        {images.map((item: any, idx: number) => (
          <div
            key={idx}
            className={`
        m-1 rounded-lg overflow-hidden
        w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] md:w-[100px] md:h-[100px]
        ${
          idx === currentIndex
            ? "border-2 border-orange-500"
            : "border-2 border-gray-200"
        }
        cursor-pointer
      `}
            onClick={() => handleItem(idx)}
          >
            <Image
              src={
                item.url.startsWith("http")
                  ? item.url
                  : `${URL_IMAGE}${item.url}`
              }
              alt={`Thumbnail for image ${item.id}`}
              width={100}
              height={100}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
