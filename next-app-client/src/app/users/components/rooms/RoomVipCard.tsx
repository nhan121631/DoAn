'use client';

import { motion } from "framer-motion";
import { URL_IMAGE } from "@/services/Constant";
import { RoomInUser } from "@/types/types";
import Image from "next/image";
import { IoCameraOutline } from "react-icons/io5";
import { ButtonForVipCard } from "./ButtonForVipCard";
import RoomCartActionsWrapper from "./RoomCardActionsWrapper";

interface RoomVipCardProps {
  room: RoomInUser;
  isFavorite: boolean;
  onFavoriteChange?: (id: string) => void;
}

//, isFavorite = false, onFavoriteChange
export default function RoomVipCard({
  room,
  isFavorite,
  onFavoriteChange,
}: RoomVipCardProps) {
  // Xử lý ngày đăng bài
  // function getPostDateLabel(postStartDate: string) {
  //   if (!postStartDate) return "";
  //   const today = new Date();
  //   const postDate = new Date(postStartDate);
  //   today.setHours(0, 0, 0, 0);
  //   postDate.setHours(0, 0, 0, 0);
  //   const diffTime = today.getTime() - postDate.getTime();
  //   const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  //   if (diffDays === 0) return "Hôm nay";
  //   if (diffDays === 1) return "Hôm qua";
  //   if (diffDays > 1 && diffDays <= 5) return `${diffDays} ngày trước`;
  //   return postStartDate;
  // }
  function getRelativeTime(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // seconds
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }} // mờ, trượt nhẹ lên
      whileInView={{ opacity: 1, y: 0 }}  // hiện, về đúng vị trí
      viewport={{ amount: 0.18 }} // once: true để chỉ chạy một lần khi vào view
      transition={{ duration: 0.85, ease: [0.22, 0.61, 0.36, 1] }} // cubic-bezier mượt
      className=" hover:border-emerald-400"
      style={{ willChange: "transform, box-shadow, border-color, background" }}
    >
    <div
      className="rounded-2xl overflow-hidden shadow-lg bg-white border border-gray-200 mx-auto w-full max-w-[850px] min-w-[320px] transition-all duration-300 group/card flex flex-col sm:flex-row sm:items-stretch relative cursor-pointer hover:shadow-2xl hover:border-emerald-400 hover:scale-[1.015]"
      style={{ willChange: 'transform, box-shadow, border-color, background' }}
    >
      {/* IMAGE SECTION */}
      <RoomCartActionsWrapper room={room}>
        <div className="flex flex-col gap-2 p-3 w-full sm:w-[34%] min-w-[200px] max-w-[280px] bg-gradient-to-br from-emerald-50 to-white justify-between items-center h-full pb-24">
          {/* Ảnh lớn */}
          <div className="relative rounded-2xl overflow-hidden group/image-main w-full min-h-[180px] max-h-[220px] h-auto shadow-md mb-2 border border-emerald-100 flex items-center justify-center bg-white">
            <Image
              src={
                room.images && room.images.length > 0
                  ? URL_IMAGE + room.images[0]?.url
                  : "/images/default/room.png"
              }
              alt={room.title}
              fill
              className="object-cover w-full h-full transition-all duration-500 ease-in-out group-hover/image-main:scale-105 group-hover/image-main:shadow-2xl group-hover/image-main:brightness-95"
              sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 280px"
              priority
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            />
            <div className="absolute flex items-center gap-1 px-2 py-1 text-xs text-white rounded shadow left-2 bottom-2 bg-black/60">
              <IoCameraOutline className="text-base" />
              {room.images?.length ?? 0}
            </div>
          </div>

          {/* Nhóm ảnh nhỏ bên dưới */}
          {room.images && room.images.length > 1 && (
            <div className="flex flex-row justify-center w-full gap-2">
              {room.images.slice(1, 4).map((img, idx) => {
                const isLast = idx === 2 && room.images.length > 4;
                if (isLast) {
                  return (
                    <div
                      key={idx}
                      className="relative flex-1 aspect-[1/1] max-w-[72px] rounded-xl overflow-hidden group/image-thumb shadow flex items-center justify-center bg-gray-200 cursor-pointer"
                    >
                      <Image
                        src={
                          room.images[3]?.url ? URL_IMAGE + room.images[3].url : "/images/default/room.png"
                        }
                        alt={`${room.title} more`}
                        fill
                        className="object-cover w-full h-full opacity-60"
                        sizes="72px"
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white bg-black/50">
                        +{room.images.length - 3}
                      </span>
                    </div>
                  );
                }
                return (
                  <div
                    key={idx}
                    className="relative flex-1 aspect-[1/1] max-w-[72px] rounded-xl overflow-hidden group/image-thumb shadow"
                  >
                    <Image
                      src={img?.url ? URL_IMAGE + img.url : "/images/default/room.png"}
                      alt={`${room.title} ${idx + 2}`}
                      fill
                      className="object-cover w-full h-full transition-all duration-500 ease-in-out group-hover/image-thumb:scale-105 group-hover/image-thumb:shadow-xl group-hover/image-thumb:brightness-95"
                      sizes="72px"
                    />
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Spacer đã loại bỏ để tránh chồng chéo user info */}
        </div>
      </RoomCartActionsWrapper>

      {/* CONTENT SECTION */}
      <div className="p-5 flex flex-col gap-2 min-h-[120px] flex-1 sm:max-w-[700px] bg-white pb-24">
        {/* Tên phòng + sao */}
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="text-xl font-bold text-yellow-400 drop-shadow">
            ★★★★★
          </span>
          <RoomCartActionsWrapper room={room}>
            <span
              className="text-xl font-extrabold text-gray-900 uppercase break-words transition-colors duration-200 group-hover/card:text-emerald-600 line-clamp-2 text-ellipsis"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'normal',
                wordBreak: 'break-word',
                maxHeight: '3.2em', // 2 lines x 1.6em
              }}
              title={room.title}
            >
              {room.title}
            </span>
          </RoomCartActionsWrapper>
        </div>

        {/* Giá - Diện tích - Địa chỉ */}
        <div className="flex flex-wrap items-center max-w-full gap-4 text-base font-semibold text-red-700">
          <span className="truncate max-w-[120px] text-lg font-bold">
            {room.priceMonth.toLocaleString("en-US") + "đ"}
          </span>
          <span className="text-gray-700 font-normal truncate max-w-[80px]">
            • {room.area}m²
          </span>
          <a
            className="text-blue-500 font-normal truncate max-w-[220px] hover:text-blue-700 underline underline-offset-2 cursor-pointer transition-colors duration-150"
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              `${room.address.street}, ${room.address.ward.name}, ${room.address.ward.district.name}, ${room.address.ward.district.province.name}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Xem vị trí trên Google Maps"
          >
            • {room.address.street}, {room.address.ward.name}, {room.address.ward.district.name}, {room.address.ward.district.province.name}
          </a>
        </div>

        {/* Conveniences (Tiện ích) - UI/UX improved */}
        {conveniences.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {showConveniences.map((item: string, idx: number) => (
              <span
                key={idx}
                className="inline-flex items-center px-2.5 py-1 border border-emerald-300 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg shadow-sm hover:bg-emerald-100 transition-all duration-200 cursor-default"
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
                  className="mr-1 text-emerald-400"
                  style={{ minWidth: 14 }}
                >
                  <circle cx="10" cy="10" r="8" fill="#34d399" opacity="0.2" />
                  <circle cx="10" cy="10" r="4" fill="#34d399" />
                </svg>
                {item}
              </span>
            ))}
            {moreCount > 0 && (
              <span
                className="inline-flex items-center px-2.5 py-1 border border-gray-300 bg-white text-gray-700 text-xs font-semibold rounded-lg shadow-sm cursor-pointer hover:bg-gray-100 transition-all duration-200"
                title={conveniences.slice(maxShow).join(", ")}
                style={{ minWidth: 40, justifyContent: "center" }}
              >
                +{moreCount}
              </span>
            )}
          </div>
        )}

        {/* Mô tả */}
        <div
          className="max-w-full mb-2 text-[15px] text-gray-700 break-words line-clamp-3 text-ellipsis leading-relaxed px-1"
          style={{
            minHeight: 45,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textAlign: 'left',
          }}
          title={room.description || 'Không có mô tả'}
        >
          {room.description && room.description.trim().length > 0 ? (
            room.description.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim()
          ) : (
            <span className="italic text-gray-400">Không có mô tả cho phòng này.</span>
          )}
        </div>
      </div>

      {/* Thông tin người đăng - luôn nằm dưới cùng card */}
      <div className="absolute bottom-0 left-0 z-10 flex items-center w-full gap-4 px-4 py-3 border-t border-gray-100 bg-emerald-50/60 rounded-b-2xl">
        <Image
          src="/images/useravt.png"
          alt="Avatar"
          width={44}
          height={44}
          style={{ width: 44, height: 44 }}
          className="border-2 rounded-full shadow-sm border-emerald-200"
        />
        <div className="flex flex-col flex-1 min-w-0">
          <span className="font-semibold text-gray-800 truncate">
            {room.landlord.landlordProfile.fullName}
          </span>
          <span className="text-xs text-gray-500 truncate">
            {getRelativeTime(room.postStartDate)}
          </span>
        </div>
        <span className="px-3 py-1 text-sm font-semibold truncate rounded-full shadow bg-emerald-100 text-emerald-700">
          {room.landlord.landlordProfile.phoneNumber
            ? room.landlord.landlordProfile.phoneNumber
            : room.landlord.landlordProfile.email}
        </span>
        <div className="flex items-center gap-2 ml-2">
          <ButtonForVipCard
            room={room}
            isFavorite={isFavorite}
            onFavoriteChange={onFavoriteChange}
          />
        </div>
      </div>
    </div>
    </motion.div>
  );
}
