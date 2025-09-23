"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { adsService, type AdsResponse } from "@/services/AdsService";
import { URL_IMAGE } from "@/services/Constant";

export interface AdsBannerProps {
  position?: "LEFT" | "RIGHT";
  // position?: "LEFT" | "RIGHT" | "TOP" | "BOTTOM" | "CENTER";
  className?: string;
}

export default function AdsBanner({
  position = "LEFT",
  className = "",
}: AdsBannerProps) {
  const [ads, setAds] = useState<AdsResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActiveAdsByPosition = async () => {
      try {
        setIsLoading(true);
        const data = await adsService.getActiveAdsByPosition(position);
        setAds(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch ads');
        setAds([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActiveAdsByPosition();

    // Refresh ads every 5 minutes
    const interval = setInterval(fetchActiveAdsByPosition, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [position]);

  // Don't render if loading, error, or no ads
  if (isLoading || error || !ads || ads.length === 0) {
    return null;
  }

  // Get the first active ad (highest priority)
  const activeAd = ads[0];

  // Build image URL with Cloudinary base
  const getFullImageUrl = (imageUrl: string) => {
    console.log('🔍 [AdsBanner] Processing image URL:', imageUrl);
    
    // If it's already a full URL (starts with http), return as-is
    if (imageUrl.startsWith('http')) {
      console.log('🖼️ [AdsBanner] Full URL detected, using as-is:', imageUrl);
      return imageUrl;
    }
    
    // If it's a relative path starting with /, combine with URL_IMAGE
    if (imageUrl.startsWith('/')) {
      const fullUrl = `${URL_IMAGE}${imageUrl}`;
      console.log('🖼️ [AdsBanner] Building full URL:', {
        original: imageUrl,
        URL_IMAGE: URL_IMAGE,
        fullUrl: fullUrl
      });
      return fullUrl;
    }
    
    // Otherwise, return as-is (might be already processed)
    console.log('🖼️ [AdsBanner] Using image URL as-is:', imageUrl);
    return imageUrl;
  };

  // Log active ad data for debugging
  console.log('📊 [AdsBanner] Active ad data:', {
    position,
    activeAd,
    imageUrl: activeAd.imageUrl,
    fullImageUrl: getFullImageUrl(activeAd.imageUrl)
  });

  const baseClasses = "hidden lg:flex flex-col items-center justify-start sticky top-24 z-20 mt-5";
  const positionClasses = {
    LEFT: "left-0",
    RIGHT: "right-0",
    // TOP: "top-0",
    // BOTTOM: "bottom-0",
    // CENTER: "mx-auto"
  };

  return (
    <div
      className={`${baseClasses} ${positionClasses[position]} w-[140px] ${className}`}
      aria-label={`ads-banner-${position.toLowerCase()}`}
    >
      <a
        href={activeAd.linkUrl || "#"}
        target="_blank"
        rel="noopener noreferrer"
        className="relative block w-full rounded-lg overflow-hidden shadow-lg border border-amber-200 bg-white hover:shadow-2xl transition-all duration-300 group"
        title={activeAd.title}
        style={{ maxWidth: 130 }}
      >
        <div className="w-full flex justify-center items-start">
          <Image
            src={getFullImageUrl(activeAd.imageUrl)}
            alt={activeAd.title}
            width={130}
            height={0}
            className="object-contain w-full h-auto bg-white group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, 130px"
            priority={false}
            style={{ height: "auto", width: "100%" }}
            onLoad={() => console.log('✅ [AdsBanner] Image loaded successfully:', getFullImageUrl(activeAd.imageUrl))}
            onError={(e) => {
              console.error('❌ [AdsBanner] Image failed to load:', {
                src: getFullImageUrl(activeAd.imageUrl),
                error: e,
                originalUrl: activeAd.imageUrl
              });
            }}
          />
        </div>
        
        {/* Optional overlay with title */}
        {activeAd.title && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-end">
            <div className="w-full p-2 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <p className="text-white text-xs font-medium text-center truncate">
                {activeAd.title}
              </p>
            </div>
          </div>
        )}
      </a>
      
      {/* Multiple ads indicator */}
      {ads.length > 1 && (
        <div className="flex gap-1 mt-2">
          {ads.slice(0, 3).map((_, index: number) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === 0 ? "bg-amber-500" : "bg-gray-300"
              }`}
            />
          ))}
          {ads.length > 3 && (
            <span className="text-xs text-gray-500 ml-1">+{ads.length - 3}</span>
          )}
        </div>
      )}
    </div>
  );
}
