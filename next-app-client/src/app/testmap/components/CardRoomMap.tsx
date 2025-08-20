import { URL_IMAGE } from "@/services/Constant";
import Image from "next/image";
import React, { useState } from "react";
import Link from "next/link";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { TbRulerMeasure } from "react-icons/tb";
import { FaMoneyBillWave } from "react-icons/fa";
import { BsCamera } from "react-icons/bs";
import { HiOutlineLocationMarker } from "react-icons/hi";

interface RoomCardProps {
  id?: string;
  title?: string;
  price?: number;
  area?: number;
  location?: string;
  imageUrl?: string;
  postType?: string;
  onFavorite?: () => void;
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
  const [isFavorited, setIsFavorited] = useState(false);
  const [imageError, setImageError] = useState(false);
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorited(!isFavorited);
    onFavorite?.();
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
      className="group bg-white shadow-md border border-gray-100 overflow-hidden cursor-pointer transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-200 hover:-translate-y-1 transform relative"
      onClick={handleCardClick}
    >
      {/* VIP Tag */}
      {postType === "Post VIP" && (
        <div className="absolute top-3 left-3 z-20">
          <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1 animate-pulse">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-white"
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
      <div className="flex relative">
        {/* Gradient Overlay for entire card */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-blue-50/0 group-hover:to-blue-50/30 transition-all duration-500 pointer-events-none z-10"></div>

        {/* Image Container */}
        <div className="relative w-48 h-48 flex-shrink-0 overflow-hidden">
          <div className="w-full h-full bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 relative overflow-hidden">
            {imageUrl && !imageError ? (
              <Image
                src={URL_IMAGE + imageUrl}
                alt={title}
                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
                onError={() => setImageError(true)}
                width={192}
                height={200}
                priority
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100 flex items-center justify-center relative overflow-hidden">
                {/* Animated background shapes */}
                <div className="absolute inset-0">
                  <div className="absolute top-4 left-4 w-8 h-8 bg-blue-200/50 rounded-full animate-pulse"></div>
                  <div
                    className="absolute bottom-6 right-6 w-6 h-6 bg-purple-200/50 rounded-full animate-pulse"
                    style={{ animationDelay: "0.5s" }}
                  ></div>
                  <div
                    className="absolute top-1/2 left-1/2 w-12 h-12 bg-indigo-200/30 rounded-full animate-pulse"
                    style={{ animationDelay: "1s" }}
                  ></div>
                </div>

                <div className="text-gray-400 text-center z-10">
                  <div className="p-3 bg-white/80 rounded-full mb-2 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                    <BsCamera size={20} className="mx-auto" />
                  </div>
                  <span className="text-xs font-medium">No Image</span>
                </div>
              </div>
            )}

            {/* Image overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>

          {/* Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            className="absolute top-3 right-3 w-9 h-9 bg-white/95 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 hover:bg-white opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 hover:shadow-xl"
          >
            {isFavorited ? (
              <AiFillHeart size={16} className="text-red-500 animate-pulse" />
            ) : (
              <AiOutlineHeart
                size={16}
                className="text-gray-600 hover:text-red-500 transition-colors duration-200"
              />
            )}
          </button>

          {/* Corner decoration */}
          <div className="absolute top-0 left-0 w-0 h-0 border-l-[20px] border-l-blue-500 border-b-[20px] border-b-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>

        {/* Content */}
        <div className="flex-1 p-5 flex flex-col justify-between relative">
          <div className="space-y-3">
            {/* Title */}
            <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm leading-5 group-hover:text-blue-700 transition-all duration-300 group-hover:transform group-hover:translate-x-1">
              {title}
            </h3>

            {/* Price and Details */}
            <div className="flex items-center gap-3 text-sm">
              <span className="flex items-center text-red-500 font-bold text-base group-hover:text-red-600 transition-colors duration-300 group-hover:scale-105 transform">
                <FaMoneyBillWave className="mr-1 text-orange-500" size={16} />
                {formatVND(price)}
              </span>
              <div className="w-1 h-1 bg-gray-300 rounded-full group-hover:bg-blue-300 transition-colors duration-300"></div>
              <span className="flex items-center text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                <TbRulerMeasure className="mr-1 text-blue-500" size={16} />
                {area} m²
              </span>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 text-sm text-gray-600 group-hover:text-gray-700 transition-all duration-300 group-hover:transform group-hover:translate-x-1">
              <HiOutlineLocationMarker
                size={16}
                className="text-gray-500 group-hover:text-blue-500 transition-colors duration-300 group-hover:animate-pulse"
              />
              <span className="font-medium">{location}</span>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100 group-hover:border-blue-100 transition-colors duration-300">
            <div className="opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0">
              <Link
                href={id ? `/detail/${id}` : "#"}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-medium px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg block text-center"
              >
                View Details
              </Link>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/5 to-transparent rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-700"></div>
        </div>
      </div>
    </div>
  );
};
export default RoomCard;
// Demo Component với 2 cards như trong hình
