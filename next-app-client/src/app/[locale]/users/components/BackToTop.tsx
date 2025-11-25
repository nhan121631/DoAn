"use client";

import React, { useState, useEffect } from "react";
import { HiHome } from "react-icons/hi";

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Hiển thị nút khi scroll xuống hơn 300px hoặc khi không còn thấy phần home
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed z-50 p-3 text-white transition-all duration-300 transform rounded-full shadow-lg bottom-28 right-8 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 bg-stone-900 hover:bg-stone-700"
          aria-label="Back to home"
        >
          <HiHome className="w-6 h-6" />
        </button>
      )}
    </>
  );
}
