"use client";
import React from "react";
import Image from "next/image";
import { FaAngleLeft } from "react-icons/fa";

interface Image {
  id: number;
  url: string;
}
interface Props {
  images: Image[];
}

export const Slide = ({ images }: Props) => {
  const [indexImg, setIndexImg] = React.useState(images[0].id);
  //   const path = images[0].url;
  const handlePrev = () => {
    setIndexImg((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const handleNext = () => {
    setIndexImg((prev) => (prev < images.length ? prev + 1 : prev));
  };
  const handleItem = (item: number) => setIndexImg(item);

  return (
    <div className=" bg-stone-900 flex flex-col shadow  w-full max-w-4xl mx-auto dark:bg-gray-800">
      <div className="flex justify-between items-center flex-wrap px-2 sm:px-4 md:px-8 ">
        <button
          className="flex h-10 w-10 sm:h-12 sm:w-12 bg-white/30 border-none justify-center items-center rounded transition hover:bg-orange-200"
          onClick={handlePrev}
        >
          <FaAngleLeft className="text-xl sm:text-2xl" />
        </button>
        <div className="flex-1 flex justify-center items-center">
          <Image
            className="object-cover"
            src={`${images[indexImg - 1].url}`}
            alt="room image"
            width={600}
            height={300}
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 70vw, 600px"
            style={{
              width: "100%",
              height: "auto",
              maxWidth: 600,
              minHeight: 180,
            }}
            priority
          />
        </div>
        <button
          className="flex h-10 w-10 sm:h-12 sm:w-12 bg-white/30 border-none justify-center items-center transition hover:bg-orange-200 transform -scale-x-100"
          onClick={handleNext}
        >
          <FaAngleLeft className="text-xl sm:text-2xl" />
        </button>
      </div>
      <div className="flex flex-wrap justify-center items-center bg-white px-2 py-3 dark:bg-[#232b3b]">
        {images.map((item, index) => (
          <Image
            key={index}
            className={`border-2 rounded-lg m-1 ${
              item.id === indexImg ? "border-orange-500" : "border-gray-200"
            } w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] md:w-[100px] md:h-[100px] object-cover transition-all duration-150`}
            src={`${item.url}`}
            alt={`Thumbnail for image ${item.id}`}
            width={100}
            height={100}
            onClick={() => handleItem(item.id)}
            style={{ cursor: "pointer" }}
          />
        ))}
      </div>
    </div>
  );
};
