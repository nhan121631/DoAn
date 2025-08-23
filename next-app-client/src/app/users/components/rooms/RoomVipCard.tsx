"use client";

import { URL_IMAGE } from "@/services/Constant";
import type { RoomInUser } from "@/types/types";
import Image from "next/image";
import { IoCameraOutline } from "react-icons/io5";
import { AiFillStar } from "react-icons/ai";
import { FaRegCheckCircle } from "react-icons/fa";
import { IoIosAddCircleOutline } from "react-icons/io";
import { ButtonForVipCard } from "./ButtonForVipCard";
import RoomCartActionsWrapper from "./RoomCardActionsWrapper";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCompareStore } from "@/stores/CompareStore";
import { message } from "antd";

interface RoomVipCardProps {
  room: RoomInUser;
  isFavorite: boolean;
  onFavoriteChange?: (id: string) => void;
}

export default function RoomVipCard({
  room,
  isFavorite,
  onFavoriteChange,
}: RoomVipCardProps) {
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

  function getRelativeTime(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 0) return "Just now";
    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  }

  const conveniences = (room.conveniences || []).map((c) =>
    typeof c === "string" ? c : c.name
  );
  const maxShow = 2;
  const showConveniences = conveniences.slice(0, maxShow);
  const moreCount = conveniences.length - maxShow;
  const [hoveredImageIndex, setHoveredImageIndex] = useState<number | null>(
    null
  );

  return (
    <>
      {contextHolder}
      <div className="w-full max-w-5xl mx-auto px-2 sm:px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100/60 overflow-hidden hover:shadow-xl hover:border-slate-200 hover:-translate-y-1 transition-all duration-300 group/card cursor-pointer backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row items-stretch">
            {/* IMAGE SECTION */}
            <RoomCartActionsWrapper room={room}>
              <div className="relative w-full h-48 sm:w-52 sm:h-auto lg:w-52 flex-shrink-0">
                {/* Main Image: use h-full and min-h so the left column stretches to card height */}
                <div className="relative h-full min-h-[300px] sm:min-h-[300px] bg-gray-100 overflow-hidden">
                  {/* Main image switches to hovered thumbnail (if any) with smooth zoom */}
                  {(() => {
                    const mainImageSrc =
                      room.images && room.images.length > 0
                        ? URL_IMAGE +
                          (hoveredImageIndex !== null &&
                          room.images[hoveredImageIndex]
                            ? room.images[hoveredImageIndex].url
                            : room.images[0].url)
                        : "/images/default/room.png";
                    return (
                      <Image
                        src={mainImageSrc}
                        alt={room.title}
                        fill
                        className={`object-cover transition-transform duration-500 ${
                          hoveredImageIndex !== null
                            ? "scale-105"
                            : "group-hover/card:scale-105"
                        }`}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 176px, 208px"
                        priority
                      />
                    );
                  })()}

                  {/* Image Counter Badge */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1.5 bg-slate-800/80 text-white text-xs rounded-lg backdrop-blur-md border border-white/10">
                    <IoCameraOutline className="w-3 h-3" />
                    <span>{room.images?.length ?? 0}</span>
                  </div>

                  {/* Small thumbnails - vertical stack centered alongside main image */}
                  {room.images && room.images.length > 1 && (
                    <div className="absolute right-3 bottom-6 hidden sm:flex flex-col gap-2 z-20">
                      {room.images.slice(1, 4).map((img, idx) => {
                        const isLast = idx === 2 && room.images.length > 4;
                        return (
                          <div
                            key={idx}
                            onMouseEnter={() => setHoveredImageIndex(1 + idx)}
                            onMouseLeave={() => setHoveredImageIndex(null)}
                            className="relative w-8 h-8 md:w-10 md:h-10 rounded-lg overflow-hidden border-2 border-white/90 shadow-lg bg-white flex-shrink-0 cursor-pointer hover:border-slate-200 transition-colors"
                          >
                            <Image
                              src={
                                img?.url
                                  ? URL_IMAGE + img.url
                                  : "/images/default/room.png"
                              }
                              alt={`${room.title} ${idx + 2}`}
                              fill
                              className={`object-cover ${
                                isLast ? "opacity-70" : ""
                              }`}
                              sizes="40px"
                            />
                            {isLast && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <span className="text-white text-sm font-bold">
                                  +{room.images.length - 3}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </RoomCartActionsWrapper>

            {/* CONTENT SECTION */}
            <div className="flex-1 p-2 sm:p-3 flex flex-col">
              {/* Top row: Stars + Favorite */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="inline-flex items-center gap-2">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-lg backdrop-blur-sm border border-white/20">
                      <AiFillStar className="w-3 h-3" aria-hidden />
                      <span className="uppercase tracking-wider">VIP</span>
                    </div>
                  </div>
                  {/* <span className="text-sm text-gray-600">5.0</span> */}
                </div>
                <div className="flex items-center gap-2">
                  <ButtonForVipCard
                    room={room}
                    isFavorite={isFavorite}
                    onFavoriteChange={onFavoriteChange}
                  />
                </div>
              </div>

              {/* Room Title */}
              <RoomCartActionsWrapper room={room}>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-0.5 sm:mb-1 line-clamp-1 sm:line-clamp-2 cursor-pointer group-hover/card:text-indigo-600 transition-colors leading-tight">
                  {room.title}
                </h3>
              </RoomCartActionsWrapper>

              {/* Location + Area */}
              <div className="flex items-center text-sm text-slate-600 mb-0.5 sm:mb-1">
                <svg
                  className="w-4 h-4 mr-1 text-slate-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${room.address.street}, ${room.address.ward.name}, ${room.address.ward.district.name}, ${room.address.ward.district.province.name}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-indigo-600 transition-colors"
                  title="Xem vị trí trên Google Maps"
                >
                  {room.address.street}, {room.address.ward.name},{" "}
                  {room.address.ward.district.name}
                </a>
                <span className="mx-2">•</span>
                <span className="font-medium">{room.area}m²</span>
              </div>

              {/* Description */}
              <div className="text-sm text-slate-500 italic mb-1 sm:mb-2 line-clamp-1 sm:line-clamp-2 leading-tight">
                {room.description && room.description.trim().length > 0
                  ? room.description
                      .replace(/\n+/g, " ")
                      .replace(/\s+/g, " ")
                      .trim()
                  : "Không có mô tả cho phòng này."}
              </div>

              {/* Amenities */}
              {conveniences.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-1 sm:mb-2">
                  {showConveniences.map((item: string, idx: number) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2 py-0.5 sm:py-1 bg-indigo-50/70 text-indigo-700 text-sm rounded-full border border-indigo-100/80 backdrop-blur-sm"
                    >
                      {item}
                    </span>
                  ))}
                  {moreCount > 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 sm:py-1 bg-slate-100/70 text-slate-600 text-sm rounded-full border border-slate-200/80">
                      +{moreCount}
                    </span>
                  )}
                </div>
              )}

              {/* Spacer */}
              <div className="flex-1"></div>

              {/* Price and CTA */}
              <div className="space-y-1.5 sm:space-y-2 pt-1.5 sm:pt-2 border-t border-slate-100">
                <div>
                  <span className="text-sm text-slate-600">
                    Price per month
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl sm:text-2xl font-bold text-emerald-600">
                      {room.priceMonth.toLocaleString("en-US")}
                    </span>
                    <span className="text-sm text-slate-600">VNĐ</span>
                  </div>
                </div>

                {/* Buttons Row */}
                <div className="flex gap-1.5 sm:gap-2">
                  <button
                    onClick={handleViewRoom}
                    className="flex-1 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-sm font-semibold rounded-lg sm:rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95 shadow-orange-500/25"
                  >
                    View room
                  </button>

                  <button
                    onClick={handleCompare}
                    disabled={isCompared}
                    className={`px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm font-semibold rounded-lg sm:rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 ${
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

          {/* Bottom Host Info */}
          <div className="px-2 sm:px-3 py-1.5 sm:py-2 bg-slate-50/50 border-t border-slate-100/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 sm:gap-0 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Image
                src="/images/useravt.png"
                alt="Host avatar"
                width={24}
                height={24}
                className="sm:w-7 sm:h-7 rounded-full border border-slate-200/60 object-cover shadow-sm"
              />
              <div className="flex-1">
                <div className="font-medium text-slate-900 text-sm">
                  {room.landlord.landlordProfile.fullName}
                </div>
                <div className="text-xs text-slate-500">
                  {getRelativeTime(room.postStartDate)}
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="flex items-center gap-1.5 bg-slate-100/80 px-2 py-1 sm:py-1.5 rounded-lg backdrop-blur-sm border border-slate-200/60 w-full sm:w-auto">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse flex-shrink-0"></div>
              <div className="min-w-0 flex-1">
                <div className="text-xs text-slate-500 font-medium">
                  Contact
                </div>
                <div className="text-sm font-semibold text-slate-800 truncate">
                  {room.landlord.landlordProfile.phoneNumber
                    ? room.landlord.landlordProfile.phoneNumber
                    : room.landlord.landlordProfile.email}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
