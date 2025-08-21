"use client";

import { URL_IMAGE } from "@/services/Constant";
import type { RoomInUser } from "@/types/types";
import Image from "next/image";
import { IoCameraOutline } from "react-icons/io5";
import { ButtonForVipCard } from "./ButtonForVipCard";
import RoomCartActionsWrapper from "./RoomCardActionsWrapper";

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

  return (
    <div
      className="hover:border-cyan-400"
      style={{ willChange: "transform, box-shadow, border-color, background" }}
    >
      <div
        className="overflow-hidden shadow-lg bg-white border border-slate-200 mx-auto w-[780px] min-w-[320px] transition-all duration-300 group/card flex flex-col sm:flex-row sm:items-stretch relative cursor-pointer hover:shadow-xl hover:border-cyan-400 hover:scale-[1.01] rounded-2xl"
        style={{
          willChange: "transform, box-shadow, border-color, background",
        }}
      >
        {/* IMAGE SECTION */}
        <RoomCartActionsWrapper room={room}>
          <div className="flex flex-col gap-2 p-4 w-full sm:w-[34%] min-w-[200px] max-w-[280px] bg-gradient-to-br from-cyan-50 via-slate-50 to-cyan-100/50 justify-between items-center h-full pb-24 rounded-l-2xl">
            {/* Ảnh lớn */}
            <div className="relative rounded-xl overflow-hidden group/image-main w-full min-h-[180px] max-h-[220px] h-auto shadow-lg mb-3 border border-cyan-100 flex items-center justify-center bg-white">
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
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
              />
              <div className="absolute flex items-center gap-1 px-3 py-1.5 text-xs text-white rounded-lg left-3 bottom-3 bg-cyan-900/80 backdrop-blur-sm shadow-lg border border-cyan-700/50">
                <IoCameraOutline className="text-sm" />
                {room.images?.length ?? 0}
              </div>
            </div>

            {/* Nhóm ảnh nhỏ bên dưới */}
            {room.images && room.images.length > 1 && (
              <div className="flex flex-row gap-2 w-full justify-center">
                {room.images.slice(1, 4).map((img, idx) => {
                  const isLast = idx === 2 && room.images.length > 4;
                  if (isLast) {
                    return (
                      <div
                        key={idx}
                        className="relative flex-1 aspect-[1/1] max-w-[72px] rounded-lg overflow-hidden group/image-thumb shadow-md flex items-center justify-center bg-slate-200 cursor-pointer border border-cyan-200"
                      >
                        <Image
                          src={
                            room.images[3]?.url
                              ? URL_IMAGE + room.images[3].url
                              : "/images/default/room.png"
                          }
                          alt={`${room.title} more`}
                          fill
                          className="object-cover w-full h-full opacity-60"
                          sizes="72px"
                          priority
                        />
                        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white bg-cyan-900/60">
                          +{room.images.length - 3}
                        </span>
                      </div>
                    );
                  }
                  return (
                    <div
                      key={idx}
                      className="relative flex-1 aspect-[1/1] max-w-[72px] rounded-lg overflow-hidden group/image-thumb shadow-md border border-cyan-200"
                    >
                      <Image
                        src={
                          img?.url
                            ? URL_IMAGE + img.url
                            : "/images/default/room.png"
                        }
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
          </div>
        </RoomCartActionsWrapper>

        {/* CONTENT SECTION */}
        <div className="p-6 flex flex-col gap-3 min-h-[120px] flex-1 sm:max-w-[700px] bg-white pb-24">
          {/* Tên phòng + sao */}
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className="text-lg text-amber-500 drop-shadow-sm font-bold">
              ★★★★★
            </span>
            <RoomCartActionsWrapper room={room}>
              <span
                className="text-xl font-bold text-slate-800 uppercase break-words group-hover/card:text-cyan-700 transition-colors duration-200 line-clamp-2 text-ellipsis"
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
            </RoomCartActionsWrapper>
          </div>

          {/* Giá - Diện tích - Địa chỉ */}
          <div className="flex flex-wrap items-center max-w-full gap-4 text-base font-semibold">
            <span className="truncate max-w-[120px] text-xl font-bold text-emerald-600">
              {room.priceMonth.toLocaleString("en-US") + "đ"}
            </span>
            <span className="text-slate-600 font-medium truncate max-w-[80px]">
              • {room.area}m²
            </span>
            <a
              className="text-cyan-600 font-medium truncate max-w-[220px] hover:text-cyan-700 underline underline-offset-2 cursor-pointer transition-colors duration-150"
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${room.address.street}, ${room.address.ward.name}, ${room.address.ward.district.name}, ${room.address.ward.district.province.name}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              title="Xem vị trí trên Google Maps"
            >
              • {room.address.street}, {room.address.ward.name},{" "}
              {room.address.ward.district.name},{" "}
              {room.address.ward.district.province.name}
            </a>
          </div>

          {/* Conveniences (Tiện ích) - Modern UI */}
          {conveniences.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {showConveniences.map((item: string, idx: number) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-3 py-1.5 border border-cyan-200 bg-cyan-50 text-cyan-700 text-xs font-medium rounded-full shadow-sm hover:bg-cyan-100 hover:border-cyan-300 transition-all duration-200 cursor-default"
                  title={item}
                  style={{
                    minWidth: 60,
                    justifyContent: "center",
                    letterSpacing: 0.2,
                  }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 20 20"
                    fill="none"
                    className="mr-1.5 text-cyan-500"
                    style={{ minWidth: 12 }}
                  >
                    <circle
                      cx="10"
                      cy="10"
                      r="8"
                      fill="currentColor"
                      opacity="0.2"
                    />
                    <circle cx="10" cy="10" r="3" fill="currentColor" />
                  </svg>
                  {item}
                </span>
              ))}
              {moreCount > 0 && (
                <span
                  className="inline-flex items-center px-3 py-1.5 border border-slate-300 bg-slate-50 text-slate-600 text-xs font-medium rounded-full shadow-sm cursor-pointer hover:bg-slate-100 hover:border-slate-400 transition-all duration-200"
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
            className="max-w-full mb-3 text-[15px] text-slate-600 break-words line-clamp-3 text-ellipsis leading-relaxed px-1"
            style={{
              minHeight: 45,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textAlign: "left",
            }}
            title={room.description || "Không có mô tả"}
          >
            {room.description && room.description.trim().length > 0 ? (
              room.description.replace(/\n+/g, " ").replace(/\s+/g, " ").trim()
            ) : (
              <span className="text-slate-400 italic">
                Không có mô tả cho phòng này.
              </span>
            )}
          </div>
        </div>

        {/* Thông tin người đăng - Modern footer */}
        <div className="absolute left-0 bottom-0 w-full flex flex-wrap items-center gap-4 border-t border-cyan-100 bg-gradient-to-r from-white/95 to-cyan-50/80 backdrop-blur-md px-6 py-4 rounded-b-2xl z-10 shadow-[0_-2px_16px_0_rgba(0,180,216,0.04)]">
          <Image
            src="/images/useravt.png"
            alt="Avatar"
            width={48}
            height={48}
            style={{ width: 48, height: 48 }}
            className="border-2 border-cyan-300 rounded-full shadow-lg object-cover"
          />
          <div className="flex flex-col flex-1 min-w-0">
            <span className="font-semibold text-slate-900 text-base truncate leading-tight">
              {room.landlord.landlordProfile.fullName}
            </span>
            <span className="text-xs text-slate-400 truncate mt-0.5">
              {getRelativeTime(room.postStartDate)}
            </span>
          </div>
          <span className="px-3 py-1.5 text-sm font-semibold rounded-full bg-gradient-to-r from-purple-100 to-pink-50 text-purple-700 shadow border border-purple-200 tracking-wide select-all transition-all duration-200 hover:bg-purple-200/80 hover:text-purple-900">
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
    </div>
  );
}
