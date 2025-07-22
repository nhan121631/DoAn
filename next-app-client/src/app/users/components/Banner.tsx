"use client";
import { useEffect, useState } from "react";
import SearchBar from "./SearchBar";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Image from "next/image";

export default function Banner() {
  const [urlImages, setUrlImages] = useState<string[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const images = [
      "/images/banner1.jpg",
      "/images/banner2.jpg",
      "/images/banner3.jpg",
    ];
    setUrlImages(images);
  }, []);

  useEffect(() => {
    if (urlImages.length === 0) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % urlImages.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [urlImages]);

  const handleRight = () => {
    setCurrent((prev) => (prev + 1) % urlImages.length);
  };

  const handleLeft = () => {
    setCurrent((prev) => (prev - 1 + urlImages.length) % urlImages.length);
  };

  return (
    <>
      <section className="relative w-full text-white flex-shrink-0 h-[600px] flex items-center justify-center bg-gradient-to-r from-gray-100 to-gray-300 overflow-visible">
        {/* Banner Images */}
        <div className="absolute inset-0 w-full h-full">
          {urlImages.map((img, idx) => (
            <Image
              key={img}
              src={img}
              alt={`Banner ${idx + 1}`}
              fill
              priority={idx === 0}
              className={`object-cover object-center ${
                idx === current ? "opacity-100" : "opacity-0"
              }`}
              sizes="100vw"
            />
          ))}
        </div>

        {/* Left Arrow */}
        <div
          onClick={handleLeft}
          className="absolute left-8 top-1/2 -translate-y-1/2 cursor-pointer text-2xl hidden sm:block"
        >
          <FaChevronLeft />
        </div>

        {/* Banner Content */}
        <div className="max-w-3xl mx-auto text-center z-10">
          <h1 className="text-4xl font-bold mb-4">Ants</h1>
          <div className="text-2xl font-semibold mb-2">
            Find Your Perfect Room, Anytime, Anywhere
          </div>
          <div className="text-gray-200 mb-2">
            All-in-one rental solution for students and workers. Search,
            compare, and move in – effortlessly
          </div>
        </div>

        {/* Right Arrow */}
        <div
          onClick={handleRight}
          className="absolute right-8 top-1/2 -translate-y-1/2 cursor-pointer text-2xl hidden sm:block"
        >
          <FaChevronRight />
        </div>
      </section>
      {/* SearchBar nửa trên banner, nửa ngoài */}
      <div className="relative flex justify-center -mt-0 z-20">
        <SearchBar />
      </div>
    </>
  );
}
