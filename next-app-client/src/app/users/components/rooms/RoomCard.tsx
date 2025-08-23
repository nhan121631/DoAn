"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
// framer-motion import removed
import { URL_IMAGE } from "@/services/Constant";
import { RoomInUser } from "@/types/types";
import { FaMapMarkerAlt, FaRegCheckCircle } from "react-icons/fa";
import { PiRuler } from "react-icons/pi";
import { IoIosAddCircleOutline } from "react-icons/io";
import { useRouter } from "next/navigation";
import { useCompareStore } from "@/stores/CompareStore";
import { message } from "antd";
import RoomCardActions from "./RoomCardActions";

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

  useEffect(() => {
    setIsCompared(items.some((item) => item.room.id === room.id));
  }, [items, room.id]);

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

  return (
    <>
      {contextHolder}
      <div className="group relative w-full max-w-sm mx-auto bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] border border-gray-100/50 backdrop-blur-sm">
        {/* Image Container */}
        <div className="relative w-full h-64 overflow-hidden">
          <Image
            src={
              room.images?.[0]?.url
                ? URL_IMAGE + room.images[0].url
                : "/placeholder.jpg"
            }
            alt={room.title}
            fill
            className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, 384px"
            priority
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

          {/* Heart Button - Top Right */}
          <div className="absolute top-4 right-4 z-30">
            <RoomCardActions
              room={room}
              isFavorite={isFavorite}
              onFavoriteChange={onFavoriteChange}
              showHeartOnly={true}
            />
          </div>

          {/* Status Badges - Top Left */}
          <div className="absolute top-4 left-4 z-30 flex gap-2">
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
            <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
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
          <div className="space-y-3 pt-2 border-t border-gray-100">
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
