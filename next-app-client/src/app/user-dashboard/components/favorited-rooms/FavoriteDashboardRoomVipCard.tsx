"use client";

import Image from "next/image";
import React, { useState } from "react"; 
import { motion } from "framer-motion";
import { URL_IMAGE } from "@/services/Constant";
import { RoomInUser } from "@/types/types";
import Link from "next/link";
import { ButtonForVipCard } from "@/app/users/components/rooms/ButtonForVipCard";
import { AiFillCrown } from "react-icons/ai";
import { IoCameraOutline } from "react-icons/io5"; 

export interface RoomCardProps {
  room: RoomInUser;
  isFavorite?: boolean;
  onFavoriteChange?: (id: string) => void;
}


const getAvatarSrc = (avatar?: string) => {
  console.log('Avatar value:', avatar);
  if (!avatar || avatar.trim() === '' || avatar === 'null' || avatar === 'undefined') {
    return "/images/default/avatar.jpg";
  }
  if (avatar.startsWith('/dmvvs0ags/')) {
    return `https://res.cloudinary.com${avatar}`;
  }
  if (avatar.startsWith('http') || avatar.startsWith('https://')) {
    return avatar;
  }
  if (avatar.startsWith('/')) {
    return avatar;
  }
  return "/images/avatar.jpg";
};

const maxShowConveniences = 2;

const FavoriteDashboardRoomVipCard: React.FC<RoomCardProps> = ({
  room,
  isFavorite,
  onFavoriteChange,
}) => {
  const [hoveredImageIndex, setHoveredImageIndex] = useState<number | null>(null);

 
    const landlordAvatar = getAvatarSrc(room.landlord?.landlordProfile?.avatar);


    const getContactInfo = () => {
    const phone = room.landlord?.landlordProfile?.phoneNumber;
    const email = room.landlord?.landlordProfile?.email;
    
    if (phone && phone.trim() !== '' && phone !== 'null') {
      return phone;
    }
    if (email && email.trim() !== '' && email !== 'null') {
      return email;
    }
    return "VIP Post"; 
  };

  const conveniences =
    (room.conveniences || []).map((c: { name: string } | string) =>
      typeof c === "string" ? c : c.name
    ) || [];
  const showConveniences = conveniences.slice(0, maxShowConveniences);
  const moreCount = conveniences.length - maxShowConveniences;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ amount: 0.15 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="relative flex w-full h-[280px] bg-gradient-to-br from-yellow-50 via-white to-amber-50 rounded-3xl overflow-hidden shadow-xl border-2 border-yellow-400 hover:shadow-yellow-300/50 hover:-translate-y-2 hover:scale-[1.015] transition-all duration-500"
    >
      {/* IMAGE SECTION - MULTIPLE IMAGES */}
      <div className="relative w-1/3 min-w-[250px] h-full flex-shrink-0 p-4">
        <div className="relative w-full h-full overflow-hidden shadow-inner bg-gradient-to-br from-yellow-100 to-amber-100 rounded-2xl">
          <Link href={`/detail/${room.id}`}>
            <Image
              src={
                room.images?.[hoveredImageIndex ?? 0]?.url
                  ? URL_IMAGE + room.images[hoveredImageIndex ?? 0].url
                  : "/images/room-placeholder.jpg"
              }
              alt={room.title || "Room image"}
              fill
              sizes="100vw"
              className={`object-cover transition-transform duration-500 ${
                hoveredImageIndex !== null ? "scale-105" : "hover:scale-105"
              }`}
              priority
            />
          </Link>

          <div className="absolute z-30 flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-white rounded shadow-lg top-3 left-3 bg-gradient-to-r from-yellow-400 to-amber-500">
            <AiFillCrown className="w-4 h-4 text-white" />
            <span className="text-xs font-semibold">VIP</span>
          </div>

          <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1.5 bg-slate-800/80 text-white text-xs rounded-lg backdrop-blur-md border border-white/10">
            <IoCameraOutline className="w-3 h-3" />
            <span>{room.images?.length ?? 0}</span>
          </div>

          {/* THUMBNAILS*/}
          {room.images && room.images.length > 1 && (
            <div className="absolute z-20 flex-col hidden gap-2 right-3 bottom-6 sm:flex">
              {room.images.slice(1, 4).map((img, idx) => {
                const isLast = idx === 2 && room.images.length > 4;
                const imageUrl = img?.url
                  ? URL_IMAGE + img.url
                  : "/images/room-placeholder.jpg";
                
                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredImageIndex(1 + idx)}
                    onMouseLeave={() => setHoveredImageIndex(null)}
                    className="relative flex-shrink-0 w-8 h-8 overflow-hidden transition-colors bg-white border-2 rounded-lg shadow-lg cursor-pointer md:w-10 md:h-10 border-white/90 hover:border-yellow-300"
                  >
                    <Image
                      src={imageUrl}
                      alt={`${room.title} ${idx + 2}`}
                      fill
                      className={`object-cover ${isLast ? "opacity-70" : ""}`}
                      sizes="40px"
                    />
                    {isLast && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <span className="text-sm font-bold text-white">
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

      {/* CONTENT SECTION */}
      <div className="flex flex-col flex-grow p-4">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span
            className="text-xl font-extrabold text-yellow-700 uppercase break-words transition-colors duration-200 group-hover:text-yellow-600 line-clamp-2 text-ellipsis"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "normal",
              wordBreak: "break-word",
              maxHeight: "3.2em",
            }}
            title={room.title}
          >
            {room.title}
          </span>
        </div>

        {/* Giá - Diện tích - Địa chỉ */}
        <div className="flex flex-wrap items-center max-w-full gap-4 mb-2 text-base font-semibold text-red-700">
          <span className="truncate max-w-[120px] text-lg font-bold text-yellow-600">
            {typeof room.priceMonth === "number"
              ? room.priceMonth.toLocaleString("vi-VN") + "đ"
              : room.priceMonth}
          </span>
          <span className="text-gray-700 font-normal truncate max-w-[80px]">
            • {room.area}m²
          </span>
          <span className="text-yellow-600 font-normal truncate max-w-[220px] underline underline-offset-2 cursor-pointer transition-colors duration-150">
            • {room.address.street}, {room.address.ward.name},{" "}
            {room.address.ward.district.name},{" "}
            {room.address.ward.district.province.name}
          </span>
        </div>

        {/* Conveniences (Tiện ích) */}
        {conveniences.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {showConveniences.map((item: string, idx: number) => (
              <span
                key={idx}
                className="inline-flex items-center px-2.5 py-1 border border-yellow-300 bg-yellow-50 text-yellow-700 text-xs font-semibold rounded-lg shadow-sm hover:bg-yellow-100 transition-all duration-200 cursor-default"
                title={item}
                style={{
                  minWidth: 60,
                  justifyContent: "center",
                  letterSpacing: 0.2,
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 20 20"
                  fill="none"
                  className="mr-1 text-yellow-400"
                  style={{ minWidth: 14 }}
                >
                  <circle cx="10" cy="10" r="8" fill="#fbbf24" opacity="0.2" />
                  <circle cx="10" cy="10" r="4" fill="#fbbf24" />
                </svg>
                {item}
              </span>
            ))}
            {moreCount > 0 && (
              <span
                className="inline-flex items-center px-2.5 py-1 border border-gray-300 bg-white text-gray-700 text-xs font-semibold rounded-lg shadow-sm cursor-pointer hover:bg-gray-100 transition-all duration-200"
                title={conveniences.slice(maxShowConveniences).join(", ")}
                style={{ minWidth: 40, justifyContent: "center" }}
              >
                +{moreCount}
              </span>
            )}
          </div>
        )}
        
        {/* FOOTER */}
        <div className="flex items-center justify-between gap-3 pt-4 mt-auto border-t border-yellow-200">
          <div className="flex items-center gap-3">
            
            <div className="relative w-10 h-10 overflow-hidden bg-gray-200 border-2 border-yellow-300 rounded-full">
              <Image
                src={landlordAvatar}
                alt={`${room.landlord.landlordProfile.fullName || 'Landlord'}'s avatar`}
                width={40}
                height={40}
                className="object-cover w-full h-full"
                onError={(e) => {
                  console.error('Avatar load error:', e);
                  e.currentTarget.src = "/images/default/avatar.jpg";
                }}
              />
            </div>
            <div>
              <span className="font-semibold text-gray-800">
                {room.landlord.landlordProfile.fullName}
              </span>
              <div className="text-xs font-medium text-yellow-600">
              {getContactInfo()}
            </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ButtonForVipCard
              room={room}
              isFavorite={isFavorite}
              onFavoriteChange={onFavoriteChange}
              showHeartOnly={true}
            />
            <Link
              href={`/detail/${room.id}`}
              className="px-4 py-2 text-sm font-semibold text-yellow-700 transition-colors border border-yellow-300 rounded-lg bg-yellow-50 hover:bg-yellow-100"
            >
              See Detail
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 right-0 w-16 h-16 rounded-tl-full bg-gradient-to-tl from-yellow-400/20 to-transparent"></div>
    </motion.div>
  );
};

export default FavoriteDashboardRoomVipCard;