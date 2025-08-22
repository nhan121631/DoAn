"use client";

import { URL_IMAGE } from "@/services/Constant";
import type { RoomInUser } from "@/types/types";
import Image from "next/image";
import { IoCameraOutline } from "react-icons/io5";
import { AiFillStar } from "react-icons/ai";
import { ButtonForVipCard } from "./ButtonForVipCard";
import RoomCartActionsWrapper from "./RoomCardActionsWrapper";
import { useState } from "react";

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
  const [hoveredImageIndex, setHoveredImageIndex] = useState<number | null>(null);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:border-blue-300 hover:-translate-y-1 transition-all duration-300 group/card cursor-pointer">
        <div className="flex items-stretch">
          {/* IMAGE SECTION */}
          <RoomCartActionsWrapper room={room}>
            <div className="relative w-52 flex-shrink-0 h-full">
              {/* Main Image: use h-full and min-h so the left column stretches to card height */}
              <div className="relative h-full min-h-[180px] bg-gray-100 overflow-hidden">
                {/* Main image switches to hovered thumbnail (if any) with smooth zoom */}
                {(() => {
                  const mainImageSrc = room.images && room.images.length > 0
                    ? URL_IMAGE + (
                        hoveredImageIndex !== null && room.images[hoveredImageIndex]
                          ? room.images[hoveredImageIndex].url
                          : room.images[0].url
                      )
                    : "/images/default/room.png";
                  return (
                    <Image
                      src={mainImageSrc}
                      alt={room.title}
                      fill
                      className={`object-cover transition-transform duration-500 ${hoveredImageIndex !== null ? 'scale-105' : 'group-hover/card:scale-105'}`}
                      sizes="240px"
                      priority
                    />
                  );
                })()}

                {/* Image Counter Badge */}
                <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-1 bg-black/70 text-white text-xs rounded-md backdrop-blur-sm">
                  <IoCameraOutline className="w-3 h-3" />
                  <span>{room.images?.length ?? 0}</span>
                </div>

                {/* Small thumbnails - vertical stack centered alongside main image */}
                {room.images && room.images.length > 1 && (
                  <div className="absolute right-3 bottom-6 flex flex-col gap-2 z-20">
                    {room.images.slice(1, 4).map((img, idx) => {
                      const isLast = idx === 2 && room.images.length > 4;
                      return (
                        <div
                          key={idx}
                          onMouseEnter={() => setHoveredImageIndex(1 + idx)}
                          onMouseLeave={() => setHoveredImageIndex(null)}
                          className="relative w-8 h-8 md:w-10 md:h-10 rounded overflow-hidden border-2 border-white shadow-lg bg-white flex-shrink-0 cursor-pointer"
                        >
                          <Image
                            src={
                              img?.url
                                ? URL_IMAGE + img.url
                                : "/images/default/room.png"
                            }
                            alt={`${room.title} ${idx + 2}`}
                            fill
                            className={`object-cover ${isLast ? 'opacity-70' : ''}`}
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
          <div className="flex-1 p-4 flex flex-col">
            {/* Top row: Stars + Favorite */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-2">
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white text-xs font-semibold px-3 py-0.5 rounded-md shadow-sm border border-yellow-700">
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
              <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 cursor-pointer group-hover/card:text-blue-600 transition-colors">
                {room.title}
              </h3>
            </RoomCartActionsWrapper>

            {/* Location + Area */}
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <svg className="w-4 h-4 mr-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${room.address.street}, ${room.address.ward.name}, ${room.address.ward.district.name}, ${room.address.ward.district.province.name}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-600 transition-colors"
                title="Xem vị trí trên Google Maps"
              >
                {room.address.street}, {room.address.ward.name}, {room.address.ward.district.name}
              </a>
              <span className="mx-2">•</span>
              <span className="font-medium">{room.area}m²</span>
            </div>

            {/* Description */}
            <div className="text-sm text-gray-500 italic mb-4 line-clamp-3 leading-relaxed">
              {room.description && room.description.trim().length > 0 ? (
                room.description.replace(/\n+/g, " ").replace(/\s+/g, " ").trim()
              ) : (
                "Không có mô tả cho phòng này."
              )}
            </div>

            {/* Amenities */}
            {conveniences.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {showConveniences.map((item: string, idx: number) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200"
                  >
                    {item}
                  </span>
                ))}
                {moreCount > 0 && (
                  <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    +{moreCount}
                  </span>
                )}
                
              </div>
            )}

            {/* Spacer */}
            <div className="flex-1"></div>

            {/* Price Only */}
            <div className="mb-0">
              <div className="text-base font-bold text-green-600">
                {room.priceMonth.toLocaleString("en-US")}đ <span className="text-xs text-gray-500">/ month</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Host Info */}
        <div className="px-4 py-2 bg-gray-50 border-t flex items-center justify-between">
           <div className="flex items-center gap-3">
             <Image
               src="/images/useravt.png"
               alt="Host avatar"
               width={32}
               height={32}
               className="rounded-full border border-gray-200 object-cover"
             />
             <div className="flex-1">
               <div className="font-medium text-gray-900 text-sm">
                 {room.landlord.landlordProfile.fullName}
               </div>
               <div className="text-xs text-gray-500">
                 {getRelativeTime(room.postStartDate)}
               </div>
             </div>
           </div>
           
           {/* Contact button moved here */}
           <div className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded-full font-medium text-sm transition-colors cursor-pointer">
             {room.landlord.landlordProfile.phoneNumber
               ? room.landlord.landlordProfile.phoneNumber
               : room.landlord.landlordProfile.email}
           </div>
         </div>
       </div>
     </div>
   );
 }
