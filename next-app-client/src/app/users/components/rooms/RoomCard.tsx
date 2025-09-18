"use client";

import Image from "next/image";
import React, { useRef, useEffect, useState } from "react";
// framer-motion import removed
import { URL_IMAGE, API_URL } from "@/services/Constant";
import { RoomInUser } from "@/types/types";
import {
  FaMapMarkerAlt,
  FaRegCheckCircle,
  FaPause,
  FaPlay,
} from "react-icons/fa";
import { PiRuler } from "react-icons/pi";
import { IoIosAddCircleOutline } from "react-icons/io";
import { useRouter } from "next/navigation";
import { useCompareStore } from "@/stores/CompareStore";
import { message } from "antd";
import RoomCardActions from "./RoomCardActions";
// import { useRef, useState } from "react";
// import { FaEye } from "react-icons/fa";

export interface RoomCardProps {
  room: RoomInUser;
  isForSale?: boolean;
  isFeatured?: boolean;
  isFavorite?: boolean;
  onFavoriteChange?: (id: string) => void;
  // custom?: number; // removed, no longer used
}

const RoomCard: React.FC<RoomCardProps> = ({
  room,
  isForSale = false,
  isFeatured = false,
  isFavorite = false,
  onFavoriteChange,
}) => {
  const router = useRouter();
  const { items, addItem } = useCompareStore((state) => state);
  const [isCompared, setIsCompared] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [isPlaying, setIsPlaying] = useState(true); // Assume starts playing due to auto-play
  const [isPaused, setIsPaused] = useState(false);
  const [isMainHovered, setIsMainHovered] = useState(false);
  const [isFirstHover, setIsFirstHover] = useState(true);
  const mainVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setIsCompared(items.some((item) => item.room.id === room.id));
  }, [items, room.id]);

  // Video should not auto-play on mount - only play when user hovers and clicks

  const handleViewRoom = () => {
    router.push(`/detail/${room.id}`);
  };

  const handleCompare = () => {
    if (items.length >= 2) {
      messageApi.warning({
        content: "You can only compare up to 2 rooms.",
        duration: 1.5,
      });
      return;
    }
    addItem({ room });
  };

  // Format Vietnamese currency
  const formatVNDPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  const [viewCount, setViewCount] = useState(room.viewCount ?? 0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [hasIncreasedView, setHasIncreasedView] = useState(false);
  const handleMouseEnter = () => {
    if (hasIncreasedView) return; // Nếu đã tăng view thì không tăng nữa
    timerRef.current = setTimeout(() => {
      setViewCount((prev) => prev + 1);
      setHasIncreasedView(true); // Đánh dấu đã tăng view
      fetch(`${API_URL}/rooms/${room.id}/view`, { method: "POST" }).then(() => {
        fetch(`${API_URL}/rooms/${room.id}`)
          .then((res) => res.json())
          .then((data) => setViewCount(data.viewCount ?? 0));
      });
    }, 5000);
    setIsMainHovered(true);
  };

  const handleMouseLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setHasIncreasedView(false); // Cho phép tăng lại nếu rời chuột và hover lại
    setIsMainHovered(false);
    // Reset video state when leaving card
    if (mainVideoRef.current) {
      mainVideoRef.current.pause();
      setIsPlaying(false);
      setIsPaused(false);
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

  const handlePlay = () => {
    if (mainVideoRef.current) {
      mainVideoRef.current.play();
      setIsPlaying(true);
      setIsPaused(false);
    }
  };

  const handlePause = () => {
    if (mainVideoRef.current) {
      mainVideoRef.current.pause();
      setIsPlaying(false);
      setIsPaused(true);
    }
  };

  return (
    <>
      {contextHolder}
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="group relative w-full max-w-sm mx-auto bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] border border-gray-100/50 backdrop-blur-sm"
      >
        {/* Image Container */}
        <div className="relative w-full h-64 overflow-hidden">
          {(() => {
            // Find the first video in the images list, or fallback to first image
            const firstVideoIndex =
              room.images?.findIndex((img) => img?.url && isVideo(img.url)) ??
              -1;
            const mainIndex = firstVideoIndex !== -1 ? firstVideoIndex : 0;
            const currentImage = room.images?.[mainIndex];
            const mainImageSrc = currentImage?.url
              ? URL_IMAGE + currentImage.url
              : "/placeholder.jpg";
            const isVid = currentImage?.url ? isVideo(currentImage.url) : false;

            if (isVid) {
              return (
                <div className="relative w-full h-full">
                  <video
                    ref={mainVideoRef}
                    className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                    src={mainImageSrc}
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    style={{
                      width: "100%",
                      height: "100%",
                      position: "absolute",
                      top: 0,
                      left: 0,
                    }}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPaused(true)}
                  />
                  {/* Play overlay - shown when video is hovered and not playing */}
                  {isMainHovered && !isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-40">
                      <button
                        onClick={() => {
                          if (mainVideoRef.current) {
                            mainVideoRef.current.play();
                            setIsPaused(false);
                          }
                        }}
                        className="text-white text-6xl p-4 rounded-full bg-black/50 hover:bg-black/70 transition-colors cursor-pointer"
                      >
                        <FaPlay />
                      </button>
                    </div>
                  )}
                  {/* Pause overlay - shown when video is playing and hovered */}
                  {isMainHovered && isPlaying && !isPaused && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-40">
                      <button
                        onClick={() => {
                          if (mainVideoRef.current) {
                            if (mainVideoRef.current.paused) {
                              // If video is not playing, try to play it first
                              mainVideoRef.current
                                .play()
                                .then(() => {
                                  mainVideoRef.current?.pause();
                                  setIsPaused(true);
                                })
                                .catch(() => {
                                  // If play fails, just set paused
                                  setIsPaused(true);
                                });
                            } else {
                              mainVideoRef.current.pause();
                              setIsPaused(true);
                            }
                          }
                        }}
                        className="text-white text-2xl p-3 rounded-full bg-black/50 hover:bg-black/70 transition-colors cursor-pointer"
                      >
                        <FaPause />
                      </button>
                    </div>
                  )}
                  {/* Play overlay - shown when video is paused */}
                  {isMainHovered && isPaused && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-40">
                      <button
                        onClick={() => {
                          if (mainVideoRef.current) {
                            mainVideoRef.current.play();
                            setIsPaused(false);
                          }
                        }}
                        className="text-white text-2xl p-3 rounded-full bg-black/50 hover:bg-black/70 transition-colors cursor-pointer"
                      >
                        <FaPlay />
                      </button>
                    </div>
                  )}
                </div>
              );
            } else {
              return (
                <Image
                  src={mainImageSrc}
                  alt={room.title}
                  fill
                  className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 640px) 100vw, 384px"
                  priority
                />
              );
            }
          })()}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

          {/* Heart Button - Top Right */}
          <div className="absolute z-30 top-4 right-4">
            <RoomCardActions
              room={room}
              isFavorite={isFavorite}
              onFavoriteChange={onFavoriteChange}
              showHeartOnly={true}
            />
            {/* <span className="flex items-center ml-2 text-gray-500 dark:text-gray-300">
      <FaEye className="mr-1" /> {viewCount}
    </span> */}
          </div>

          {/* Status Badges - Top Left */}
          <div className="absolute z-30 flex gap-2 top-4 left-4">
            {isForSale && (
              <span className="px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-full shadow-lg backdrop-blur-sm border border-white/20">
                FOR SALE
              </span>
            )}
            {isFeatured && (
              <span className="px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-full shadow-lg backdrop-blur-sm border border-white/20">
                FEATURED
              </span>
            )}
          </div>
        </div>

        {/* Content Container */}
        <div className="p-6 space-y-4">
          {/* Rating and Location */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <svg
                  className="w-4 h-4 text-orange-400 fill-current"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span className="text-sm font-bold text-gray-900">4.5</span>
                <span className="text-xs text-gray-500">(1)</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <FaMapMarkerAlt className="w-3 h-3 text-gray-400" />
              <span className="font-medium">
                {room.address.ward.district.province.name}
              </span>
            </div>
          </div>

          {/* Title */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 transition-colors duration-300 line-clamp-2 group-hover:text-blue-600">
              {room.title || "Beautiful Room Available"}
            </h3>
          </div>

          {/* Details */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Available now</span>
            </div>
            <div className="flex items-center gap-1">
              <PiRuler className="w-4 h-4" />
              <span>{room.area} m²</span>
            </div>
          </div>

          {/* Address */}
          <p className="text-sm text-gray-600 line-clamp-2">
            {room.address.street}, {room.address.ward.name},{" "}
            {room.address.ward.district.name}
          </p>

          {/* Price and CTA */}
          <div className="pt-2 space-y-3 border-t border-gray-100">
            <div>
              <span className="text-sm text-gray-600">Price per month</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-emerald-600">
                  {typeof room.priceMonth === "number"
                    ? formatVNDPrice(room.priceMonth)
                    : "N/A"}
                </span>
                <span className="text-sm text-gray-600">VNĐ</span>
              </div>
            </div>

            {/* Buttons Row */}
            <div className="flex gap-2">
              <button
                onClick={handleViewRoom}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-sm font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95 shadow-orange-500/25"
              >
                View room
              </button>

              <button
                onClick={handleCompare}
                disabled={isCompared}
                className={`px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 ${
                  isCompared
                    ? "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-600 cursor-not-allowed opacity-70"
                    : "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white shadow-amber-500/25 hover:shadow-lg"
                }`}
              >
                {isCompared ? (
                  <FaRegCheckCircle className="w-4 h-4" />
                ) : (
                  <IoIosAddCircleOutline className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RoomCard;
