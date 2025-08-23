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
import { addFavorite, removeFavorite } from "@/services/FavoriteService";
import { message } from "antd";


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
  const { favoriteRoomIds } = useFavoriteStore();
const isFavorited = favoriteRoomIds.has(id);
  const [favoriteCount, setFavoriteCount] = useState(0);


useEffect(() => {
    // Fetch số lượt tim khi mount
    async function fetchCount() {
      if (id) {
        const countRes = await fetch(`/api/favorites/rooms/${id}/count`);
        const newCount = await countRes.json();
        setFavoriteCount(newCount);
      }
    }
    fetchCount();
  }, [id]);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (isFavorited) {
        await removeFavorite(id);
        messageApi.success("Removed from favorites");
      } else {
        await addFavorite(id);
        messageApi.success("Added to favorites");
      }
      // Fetch lại số lượt tim sau khi cập nhật
      const countRes = await fetch(`/api/favorites/rooms/${id}/count`);
      const newCount = await countRes.json();
      setFavoriteCount(newCount);
    } catch (error) {
      messageApi.error("Failed to update favorite status");
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
      className="relative overflow-hidden transition-all duration-500 transform bg-white border border-gray-100 shadow-md cursor-pointer group hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-200 hover:-translate-y-1"
      onClick={handleCardClick}
    >
      {/* VIP Tag */}
      {postType === "Post VIP" && (
        <div className="absolute z-20 top-3 left-3">
          <span className="flex items-center gap-1 px-3 py-1 text-xs font-bold text-white rounded-full shadow-lg bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 animate-pulse">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 text-white"
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
            VIP
          </span>
        </div>
      )}
      <div className="relative flex">
        {/* Gradient Overlay for entire card */}
        <div className="absolute inset-0 z-10 transition-all duration-500 pointer-events-none bg-gradient-to-r from-transparent via-transparent to-blue-50/0 group-hover:to-blue-50/30"></div>

        {/* Image Container */}
        <div className="relative flex-shrink-0 w-48 h-48 overflow-hidden">
          <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300">
            {imageUrl && !imageError ? (
              <Image
                src={URL_IMAGE + imageUrl}
                alt={title}
                className="object-cover w-full h-full transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
                onError={() => setImageError(true)}
                width={192}
                height={200}
                priority
              />
            ) : (
              <div className="relative flex items-center justify-center w-full h-full overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100">
                {/* Animated background shapes */}
                <div className="absolute inset-0">
                  <div className="absolute w-8 h-8 rounded-full top-4 left-4 bg-blue-200/50 animate-pulse"></div>
                  <div
                    className="absolute w-6 h-6 rounded-full bottom-6 right-6 bg-purple-200/50 animate-pulse"
                    style={{ animationDelay: "0.5s" }}
                  ></div>
                  <div
                    className="absolute w-12 h-12 rounded-full top-1/2 left-1/2 bg-indigo-200/30 animate-pulse"
                    style={{ animationDelay: "1s" }}
                  ></div>
                </div>

                <div className="z-10 text-center text-gray-400">
                  <div className="p-3 mb-2 transition-transform duration-300 rounded-full bg-white/80 backdrop-blur-sm group-hover:scale-110">
                    <BsCamera size={20} className="mx-auto" />
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
          {contextHolder}
          <div className="absolute flex items-center gap-1 px-2 py-1 rounded-full shadow-lg top-3 right-3 bg-white/95">
              <button
                onClick={handleFavoriteClick}
                className="flex items-center justify-center transition-all duration-300 rounded-full w-7 h-7 hover:scale-110 hover:bg-white"
              >
                {isFavorited ? (
                  <AiFillHeart size={16} className="text-red-500 animate-pulse" />
                ) : (
                  <AiOutlineHeart
                    size={16}
                    className="text-gray-600 transition-colors duration-200 hover:text-red-500"
                  />
                )}
              </button>
              <span className="text-sm font-bold text-blue-500">{favoriteCount}</span>
            </div>
          </>

          {/* Corner decoration */}
          <div className="absolute top-0 left-0 w-0 h-0 border-l-[20px] border-l-blue-500 border-b-[20px] border-b-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>

        {/* Content */}
        <div className="relative flex flex-col justify-between flex-1 p-5">
          <div className="space-y-3">
            {/* Title */}
            <h3 className="text-sm font-semibold leading-5 text-gray-900 transition-all duration-300 line-clamp-2 group-hover:text-blue-700 group-hover:transform group-hover:translate-x-1">
              {title}
            </h3>

            {/* Price and Details */}
            <div className="flex items-center gap-3 text-sm">
              <span className="flex items-center text-base font-bold text-red-500 transition-colors duration-300 transform group-hover:text-red-600 group-hover:scale-105">
                <FaMoneyBillWave className="mr-1 text-orange-500" size={16} />
                {formatVND(price)}
              </span>
              <div className="w-1 h-1 transition-colors duration-300 bg-gray-300 rounded-full group-hover:bg-blue-300"></div>
              <span className="flex items-center text-gray-600 transition-colors duration-300 group-hover:text-gray-700">
                <TbRulerMeasure className="mr-1 text-blue-500" size={16} />
                {area} m²
              </span>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 text-sm text-gray-600 transition-all duration-300 group-hover:text-gray-700 group-hover:transform group-hover:translate-x-1">
              <HiOutlineLocationMarker
                size={16}
                className="text-gray-500 transition-colors duration-300 group-hover:text-blue-500 group-hover:animate-pulse"
              />
              <span className="font-medium">{location}</span>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="flex items-center justify-between pt-3 mt-4 transition-colors duration-300 border-t border-gray-100 group-hover:border-blue-100">
            <div className="transition-all duration-500 transform translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0">
              <Link
                href={id ? `/detail/${id}` : "#"}
                className="block px-4 py-2 text-xs font-medium text-center text-white transition-all duration-300 rounded-lg shadow-md bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:scale-105 hover:shadow-lg"
              >
                View Details
              </Link>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-20 h-20 transition-transform duration-700 translate-x-10 -translate-y-10 rounded-full bg-gradient-to-br from-blue-500/5 to-transparent group-hover:scale-150"></div>
        </div>
      </div>
    </div>
  );
};
export default RoomCard;
