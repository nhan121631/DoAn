"use client";

import React from "react";
import Image from "next/image";
import { FaAngleLeft, FaPlay } from "react-icons/fa";
import OpenImages from "./OpenImages";
import { URL_IMAGE } from "@/services/Constant";

interface Image {
  id: number;
  url: string;
}
interface Props {
  images: Image[];
  address: string;
}

export const Slide = ({ images, address }: Props) => {
  const [indexImg, setIndexImg] = React.useState(0);
  const [openModal, setOpenModal] = React.useState(false);

  const handlePrev = () => {
    setIndexImg((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNext = () => {
    setIndexImg((prev) => (prev < images.length - 1 ? prev + 1 : prev));
  };
  const handleItem = (idx: number) => {
    if (idx < 0) idx = 0;
    if (idx >= images.length) idx = images.length - 1;
    setIndexImg(idx);
  };

  const handleOpenImage = () => {
    setOpenModal(true);
  };
  const handleCloseModal = (newIndex?: number) => {
    setOpenModal(false);
    if (typeof newIndex === "number" && newIndex !== indexImg) {
      setIndexImg(newIndex);
    }
  };

  const isVideo = (url: string): boolean => {
    const videoExtensions = [
      ".mp4",
      ".webm",
      ".ogg",
      ".avi",
      ".mov",
      ".wmv",
      ".flv",
    ];
    return videoExtensions.some((ext) => url.toLowerCase().includes(ext));
  };

  return (
    <>
      <div className=" bg-stone-900 flex flex-col shadow  w-full max-w-4xl mx-auto dark:bg-gray-800">
        <div className="flex justify-between items-center flex-wrap px-2 sm:px-4 md:px-8 ">
          <button
            className="flex h-10 w-10 sm:h-12 sm:w-12 bg-white/30 border-none justify-center items-center transition hover:bg-orange-200"
            onClick={handlePrev}
          >
            <FaAngleLeft className="text-xl sm:text-2xl" />
          </button>
          <div
            onClick={handleOpenImage}
            className="flex-1 flex justify-center items-center cursor-zoom-in"
          >
            {images.length > 0 &&
            images[indexImg] &&
            typeof images[indexImg].url === "string" ? (
              !isVideo(images[indexImg].url) ? (
                <Image
                  className="object-cover"
                  src={
                    images[indexImg].url.startsWith("http")
                      ? images[indexImg].url
                      : `${URL_IMAGE}${images[indexImg].url}`
                  }
                  alt="room image"
                  width={600}
                  height={300}
                  sizes="600px"
                  style={{ width: "600px", height: "500px" }}
                  priority
                />
              ) : (
                <video
                  className="object-cover"
                  src={
                    images[indexImg].url.startsWith("http")
                      ? images[indexImg].url
                      : `${URL_IMAGE}${images[indexImg].url}`
                  }
                  // alt="room video"
                  width={600}
                  height={300}
                  // sizes="600px"
                  style={{ width: "600px", height: "500px" }}
                  controls
                />
              )
            ) : (
              <div className="w-full h-[180px] flex items-center justify-center bg-gray-200 text-gray-500">
                No image available
              </div>
            )}
          </div>
          <button
            className="flex h-10 w-10 sm:h-12 sm:w-12 bg-white/30 border-none justify-center items-center transition hover:bg-orange-200 transform -scale-x-100"
            onClick={handleNext}
          >
            <FaAngleLeft className="text-xl sm:text-2xl" />
          </button>
        </div>
        <div className="flex flex-wrap justify-center items-center bg-white px-2 py-3 dark:bg-[#232b3b]">
          {images.map((item, idx) => (
            <div
              key={idx}
              className={`m-1 rounded-lg overflow-hidden
        w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] md:w-[100px] md:h-[100px]
        ${
          idx === indexImg
            ? "border-2 border-orange-500"
            : "border-2 border-gray-300"
        }
      `}
              style={{ cursor: "pointer" }}
              onClick={() => handleItem(idx)}
            >
              {!isVideo(item.url) ? (
                <Image
                  className="object-cover w-full h-full"
                  src={
                    item.url.startsWith("http")
                      ? item.url
                      : `${URL_IMAGE}${item.url}`
                  }
                  alt={`Thumbnail for image ${item.id}`}
                  width={100}
                  height={100}
                />
              ) : (
                <div className="relative w-full h-full">
                  <video
                    className="object-cover w-full h-full"
                    src={
                      item.url.startsWith("http")
                        ? item.url
                        : `${URL_IMAGE}${item.url}`
                    }
                    width={100}
                    height={100}
                    muted
                    preload="metadata"
                  />
                  {/* Play icon overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
                    <FaPlay className="text-white text-lg" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {openModal && (
        <OpenImages
          images={images}
          indexImg={indexImg}
          address={address}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};
