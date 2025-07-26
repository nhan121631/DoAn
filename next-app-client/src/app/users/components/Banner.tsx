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
      <section
        id="home"
        className="relative w-full text-white flex-shrink-0 h-[600px] flex items-center justify-center bg-gradient-to-r from-gray-100 to-gray-300 overflow-visible"
      >
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
          className="absolute hidden text-2xl -translate-y-1/2 cursor-pointer left-8 top-1/2 sm:block"
        >
          <FaChevronLeft />
        </div>

        {/* Banner Content */}
        <div className="z-10 max-w-3xl mx-auto text-center">
          <h1 className="mb-4 text-4xl font-bold">Ants</h1>
          <div className="mb-2 text-2xl font-semibold">
            Find Your Perfect Room, Anytime, Anywhere
          </div>
          <div className="mb-2 text-gray-200">
            All-in-one rental solution for students and workers. Search,
            compare, and move in – effortlessly
          </div>
        </div>

        {/* Right Arrow */}
        <div
          onClick={handleRight}
          className="absolute hidden text-2xl -translate-y-1/2 cursor-pointer right-8 top-1/2 sm:block"
        >
          <FaChevronRight />
        </div>
      </section>
      {/* SearchBar nửa trên banner, nửa ngoài */}
      <div className="relative z-20 flex justify-center -mt-0">
        <SearchBar />
      </div>
    </>
  );
}
