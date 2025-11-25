/* eslint-disable @typescript-eslint/no-unused-vars */

import { URL_IMAGE } from "@/services/Constant";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { TbRulerMeasure } from "react-icons/tb";
import { FaMoneyBillWave } from "react-icons/fa";
import { BsCamera } from "react-icons/bs";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { useFavoriteStore } from "@/stores/FavoriteStore";
import { message } from "antd";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface RoomCardProps {
  id?: string;
  title?: string;
  price?: number;
  area?: number;
  location?: string;
  imageUrl?: string;
  postType?: string;
  onFavorite?: (id: string) => void;
  onClick?: () => void;
}

const RoomCard: React.FC<RoomCardProps> = ({
  id = "",
  title = "",
  price = 0,
  area = 0,
  location = "",
  imageUrl = "",
  postType = "",
  onFavorite,
  onClick,
}) => {
  const [imageError, setImageError] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const { favoriteRoomIds, addFavorite: addFavoriteStore, removeFavorite: removeFavoriteStore } = useFavoriteStore();
  const isFavorited = favoriteRoomIds.has(id);
  const [favoriteCount, setFavoriteCount] = useState(0);

  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    async function fetchCount() {
      if (id) {
        try {
          const countRes = await fetch(`/api/favorites/rooms/${id}/count`);
          const newCount = await countRes.json();
          setFavoriteCount(newCount);
        } catch (err) {
          console.error("Failed to fetch favorite count:", err);
        }
      }
    }
    fetchCount();
  }, [id]);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!session) {
      router.push("/auth/login");
      return;
    }

    const wasFavorited = isFavorited;
    
    if (wasFavorited) {
      removeFavoriteStore(id);
      setFavoriteCount((prevCount) => prevCount > 0 ? prevCount - 1 : 0);
    } else {
      addFavoriteStore(id);
      setFavoriteCount((prevCount) => prevCount + 1);
    }

    try {
      const res = await fetch(`/api/favorites/rooms/${id}`, {
        method: wasFavorited ? "DELETE" : "POST",
      });

      if (!res.ok) {
        throw new Error("Failed to update favorite status on the server.");
      }

      setTimeout(() => {
        messageApi.success(wasFavorited ? "Removed from favorites" : "Added to favorites");
      }, 100);

    } catch (err) { 
      console.error("Failed to update favorite status:", err);
      
      if (wasFavorited) {
        addFavoriteStore(id);
        setFavoriteCount((prevCount) => prevCount + 1);
      } else {
        removeFavoriteStore(id);
        setFavoriteCount((prevCount) => prevCount > 0 ? prevCount - 1 : 0);
      }
      
      setTimeout(() => {
        messageApi.error("Failed to update favorite status.");
      }, 100);
    }
  };

  const handleCardClick = () => {
    onClick?.();
  };

  // Format price as VND
  const formatVND = (value: number) => {
    return value.toLocaleString("vi-VN") + " ₫";
  };

  return (
    <div
      className="relative mb-3 overflow-hidden transition-all duration-500 transform bg-white border border-gray-100 rounded-lg shadow-md cursor-pointer group hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-200 hover:-translate-y-1 sm:rounded-xl sm:mb-4"
      onClick={handleCardClick}
    >
      {/* VIP Tag */}
      {postType === "Post VIP" && (
        <div className="absolute z-20 top-2 left-2 sm:top-3 sm:left-3">
          <span className="flex items-center gap-1 px-2 py-1 text-xs font-bold text-white rounded-full shadow-lg bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 sm:px-3 sm:py-1 animate-pulse">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-3 h-3 text-white sm:h-4 sm:w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 17.75l-6.172 3.245 1.179-6.873L2 9.755l6.908-1.004L12 2.5l3.092 6.251L22 9.755l-5.007 4.367 1.179 6.873z"
              />
            </svg>
            <span className="hidden xs:inline">VIP</span>
          </span>
        </div>
      )}
      <div className="relative flex flex-col sm:flex-row">
        {/* Gradient Overlay for entire card */}
        <div className="absolute inset-0 z-10 transition-all duration-500 pointer-events-none bg-gradient-to-r from-transparent via-transparent to-blue-50/0 group-hover:to-blue-50/30"></div>

        {/* Image Container */}
        <div className="relative flex-shrink-0 w-full h-48 overflow-hidden sm:w-32 md:w-40 lg:w-48 sm:h-32 md:h-40 lg:h-48">
          <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300">
            {imageUrl && !imageError ? (
              <Image
                src={URL_IMAGE + imageUrl}
                alt={title}
                className="object-cover w-full h-full transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
                onError={() => setImageError(true)}
                width={192}
                height={200}
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 128px, (max-width: 1024px) 160px, 192px"
                priority
              />
            ) : (
              <div className="relative flex items-center justify-center w-full h-full overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100">
                {/* Animated background shapes */}
                <div className="absolute inset-0">
                  <div className="absolute w-4 h-4 rounded-full top-2 left-2 sm:top-4 sm:left-4 sm:w-8 sm:h-8 bg-blue-200/50 animate-pulse"></div>
                  <div
                    className="absolute w-3 h-3 rounded-full bottom-3 right-3 sm:bottom-6 sm:right-6 sm:w-6 sm:h-6 bg-purple-200/50 animate-pulse"
                    style={{ animationDelay: "0.5s" }}
                  ></div>
                  <div
                    className="absolute w-6 h-6 rounded-full top-1/2 left-1/2 sm:w-12 sm:h-12 bg-indigo-200/30 animate-pulse"
                    style={{ animationDelay: "1s" }}
                  ></div>
                </div>

                <div className="z-10 text-center text-gray-400">
                  <div className="p-2 mb-1 transition-transform duration-300 rounded-full sm:p-3 bg-white/80 sm:mb-2 backdrop-blur-sm group-hover:scale-110">
                    <BsCamera size={16} className="mx-auto sm:w-5 sm:h-5" />
                  </div>
                  <span className="text-xs font-medium">No Image</span>
                </div>
              </div>
            )}

            {/* Image overlay gradient */}
            <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-t from-black/20 via-transparent to-transparent group-hover:opacity-100"></div>
          </div>

          {/* Favorite Button */}
          <>
            <div className="absolute flex items-center gap-1.5 px-3 py-2 transition-all duration-300 transform translate-y-2 rounded-full shadow-lg opacity-0 top-2 right-2 sm:top-3 sm:right-3 bg-gray-800/80 backdrop-blur-sm group-hover:opacity-100 group-hover:translate-y-0 hover:shadow-xl hover:bg-gray-800/90">
              {contextHolder}

              <button
                onClick={handleFavoriteClick}
                className="flex items-center gap-1.5 transition-transform duration-200 hover:scale-105"
              >
                {isFavorited ? (
                  <AiFillHeart
                    size={16}
                    className="text-red-500 sm:w-5 sm:h-5 animate-pulse"
                  />
                ) : (
                  <AiOutlineHeart
                    size={16}
                    className="text-white transition-colors duration-200 sm:w-5 sm:h-5 hover:text-red-500"
                  />
                )}
                <span className="text-sm font-bold text-white sm:text-base">
                  {favoriteCount}
                </span>
              </button>
            </div>
          </>

          {/* Corner decoration */}
          <div className="absolute top-0 left-0 w-0 h-0 border-l-[15px] sm:border-l-[20px] border-l-blue-500 border-b-[15px] sm:border-b-[20px] border-b-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>

        {/* Content */}
        <div className="relative flex flex-col justify-between flex-1 p-3 sm:p-4 lg:p-5">
          <div className="space-y-2 sm:space-y-3">
            {/* Title */}
            <h3 className="text-sm font-semibold leading-5 text-gray-900 transition-all duration-300 line-clamp-2 sm:text-base lg:text-sm group-hover:text-blue-700 group-hover:transform group-hover:translate-x-1">
              {title}
            </h3>

            {/* Price and Details */}
            <div className="flex flex-col gap-2 text-sm xs:flex-row xs:items-center xs:gap-3">
              <span className="flex items-center text-base font-bold text-red-500 transition-colors duration-300 transform sm:text-lg lg:text-base group-hover:text-red-600 group-hover:scale-105">
                <FaMoneyBillWave className="mr-1 text-orange-500" size={14} />
                <span className="text-sm sm:text-base">{formatVND(price)}</span>
              </span>
              <div className="hidden w-1 h-1 transition-colors duration-300 bg-gray-300 rounded-full xs:block group-hover:bg-blue-300"></div>
              <span className="flex items-center text-sm text-gray-600 transition-colors duration-300 group-hover:text-gray-700">
                <TbRulerMeasure className="mr-1 text-blue-500" size={14} />
                {area} m²
              </span>
            </div>

            {/* Location */}
            <div className="flex items-start gap-2 text-xs text-gray-600 transition-all duration-300 xs:items-center sm:text-sm group-hover:text-gray-700 group-hover:transform group-hover:translate-x-1">
              <HiOutlineLocationMarker
                size={14}
                className="text-gray-500 group-hover:text-blue-500 transition-colors duration-300 group-hover:animate-pulse flex-shrink-0 mt-0.5 xs:mt-0"
              />
              <span className="font-medium line-clamp-2 xs:line-clamp-1">
                {location}
              </span>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="flex items-center justify-between pt-2 mt-3 transition-colors duration-300 border-t border-gray-100 sm:mt-4 sm:pt-3 group-hover:border-blue-100">
            <div className="transition-all duration-500 transform translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0">
              <Link
                href={id ? `/detail/${id}` : "#"}
                className="block px-3 py-2 text-xs font-medium text-center text-white transition-all duration-300 rounded-lg shadow-md bg-gradient-to-r from-blue-500 to-blue-600 sm:px-4 sm:py-2 hover:from-blue-600 hover:to-blue-700 hover:scale-105 hover:shadow-lg"
              >
                <span className="hidden xs:inline">View Details</span>
                <span className="xs:hidden">Details</span>
              </Link>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-12 h-12 transition-transform duration-700 translate-x-6 -translate-y-6 rounded-full sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-blue-500/5 to-transparent sm:-translate-y-8 sm:translate-x-8 lg:-translate-y-10 lg:translate-x-10 group-hover:scale-150"></div>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;