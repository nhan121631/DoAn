import React from "react";
import Image from "next/image";

export interface AdsBannerProps {
  position?: "left" | "right";
  imageUrl?: string;
  linkUrl?: string;
  alt?: string;
}

export default function AdsBanner({
  position = "left",
  imageUrl = "/images/default/ads-banner.png",
  linkUrl = "#",
  alt = "Ads Banner",
}: AdsBannerProps) {
  return (
    <div
      className={`hidden lg:flex flex-col items-center justify-start w-[140px] sticky top-24 z-20 mt-20 ${
        position === "left" ? "left-0" : "right-0"
      }`}
      aria-label={`ads-banner-${position}`}
    >
      <a
        href={linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full rounded-lg overflow-hidden shadow-lg border border-amber-200 bg-white hover:shadow-2xl transition-all duration-300 group"
        tabIndex={-1}
        style={{ maxWidth: 130 }}
      >
        <div className="w-full flex justify-center items-start">
          <Image
            src={imageUrl}
            alt={alt}
            width={130}
            height={0}
            className="object-contain w-full h-auto bg-white"
            sizes="(max-width: 640px) 100vw, 130px"
            priority={false}
            style={{ height: "auto", width: "100%" }}
          />
        </div>
      </a>
    </div>
  );
}
