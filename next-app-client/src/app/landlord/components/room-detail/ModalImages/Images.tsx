/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Image from "next/image";
import React from "react";
import { FaAngleLeft } from "react-icons/fa";

export default function Images({ images, indexImg }: any) {
  const [currentIndex, setCurrentIndex] = React.useState(indexImg);
  React.useEffect(() => {
    setCurrentIndex(indexImg);
  }, [indexImg]);

  const handlePrev = () => {
    setCurrentIndex((prev: any) => (prev > 1 ? prev - 1 : prev));
  };

  const handleNext = () => {
    setCurrentIndex((prev: any) => (prev < images.length ? prev + 1 : prev));
  };
  const handleItem = (item: number) => setCurrentIndex(item);

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
          <Image
            className="object-cover"
            src={`${images[currentIndex - 1].url}`}
            alt="room image"
            width={1000}
            height={500}
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 70vw, 800px"
            style={{
              width: "100%",
              height: "auto",
              maxWidth: 800,
              minHeight: 300,
            }}
            priority
          />
        </div>
        <button
          className="ms-10 flex h-10 w-10 sm:h-12 sm:w-12 bg-white/30 border-none justify-center items-center transition hover:bg-orange-200 transform -scale-x-100"
          onClick={handleNext}
        >
          <FaAngleLeft className="text-xl sm:text-2xl" />
        </button>
      </div>
      <div className="flex flex-wrap justify-center items-center stone-900 px-2 py-3 dark:bg-[#232b3b] rounded-b-lg">
        {images.map((item: any, index: number) => (
          <Image
            key={index}
            className={`border-2 rounded-lg m-1 ${
              item.id === currentIndex ? "border-orange-500" : "border-gray-200"
            } w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] md:w-[100px] md:h-[100px] object-cover transition-all duration-150`}
            src={`${item.url}`}
            alt={`Thumbnail for image ${item.id}`}
            width={80}
            height={80}
            onClick={() => handleItem(item.id)}
            style={{ cursor: "pointer" }}
          />
        ))}
      </div>
    </div>
  );
}
