"use client";

import { URL_IMAGE, API_URL } from "@/services/Constant";
import type { RoomInUser } from "@/types/types";
import Image from "next/image";
import { IoCameraOutline } from "react-icons/io5";
import { AiFillStar } from "react-icons/ai";
import { FaRegCheckCircle } from "react-icons/fa";
import { IoIosAddCircleOutline } from "react-icons/io";
import { ButtonForVipCard } from "./ButtonForVipCard";
import RoomCartActionsWrapper from "./RoomCardActionsWrapper";
import { useRouter } from "next/navigation";
import { useCompareStore } from "@/stores/CompareStore";
import { message } from "antd";
import { useEffect, useRef, useState, useMemo } from "react"; // THÊM useEffect, useRef, useState
import { FaPlay, FaPause } from "react-icons/fa";

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
  const [isMainHovered, setIsMainHovered] = useState(false);

  const ref = useRef<HTMLDivElement>(null);
  const mainVideoRef = useRef<HTMLVideoElement>(null);
  const [viewCount, setViewCount] = useState(room.viewCount ?? 0);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        timer = setTimeout(() => {
          fetch(`${API_URL}/rooms/${room.id}/view`, { method: "POST" }).then(
            () => {
              fetch(`${API_URL}/rooms/${room.id}`)
                .then((res) => res.json())
                .then((data) => setViewCount(data.viewCount ?? 0));
            }
          );
        }, 5000);
      } else {
        if (timer) clearTimeout(timer);
      }
    });

    if (ref.current) observer.observe(ref.current);

    return () => {
      observer.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, [room.id]);

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

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const firstVideoIndex = useMemo(() => {
    return room.images?.findIndex((img) => img?.url && isVideo(img.url)) ?? -1;
  }, [room.images]);

  // Video should not auto-play - only play when user clicks play button
  const formatVNDPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  return (
    <>
      {contextHolder}
      <div className="w-full max-w-5xl px-2 mx-auto sm:px-4">
        <div
          ref={ref}
          className="overflow-hidden transition-all duration-300 bg-white border shadow-sm cursor-pointer rounded-2xl border-gray-100/60 hover:shadow-xl hover:border-slate-200 hover:-translate-y-1 group/card backdrop-blur-sm"
        >
          <div className="flex flex-col items-stretch sm:flex-row">
            {/* IMAGE SECTION */}
            {/* <RoomCartActionsWrapper room={room}> */}
            <div className="relative flex-shrink-0 w-full h-48 sm:w-52 sm:h-auto lg:w-52">
              {/* Main Image: use h-full and min-h so the left column stretches to card height */}
              <div
                className="relative h-[300px] bg-gray-100 overflow-hidden"
                onMouseEnter={() => setIsMainHovered(true)}
                onMouseLeave={() => {
                  setIsMainHovered(false);
                  // Reset video state when leaving main image area
                  if (mainVideoRef.current) {
                    mainVideoRef.current.pause();
                    setIsPlaying(false);
                    setIsPaused(false);
                  }
                }}
              >
                {/* Main image switches to hovered thumbnail (if any) with smooth zoom */}
                {(() => {
                  // Find the first video in the images list, or default to index 0
                  const mainIndex =
                    firstVideoIndex !== -1 ? firstVideoIndex : 0;
                  const hoveredIndex =
                    hoveredImageIndex !== null ? hoveredImageIndex : mainIndex;
                  const currentImage =
                    room.images && room.images.length > 0
                      ? room.images[hoveredIndex]
                      : null;
                  const mainImageSrc = currentImage?.url
                    ? URL_IMAGE + currentImage.url
                    : "/images/default/room.png";
                  const isVid = currentImage?.url
                    ? isVideo(currentImage.url)
                    : false;

                  if (isVid) {
                    return (
                      <div className="relative w-full h-full">
                        <video
                          ref={mainVideoRef}
                          className={`object-cover w-full h-full transition-transform duration-500 ${
                            hoveredImageIndex !== null
                              ? "scale-105"
                              : "group-hover/card:scale-105"
                          }`}
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
                          onLoadedData={() => {
                            // Video loaded, ready to play when user clicks
                          }}
                          onPlay={() => setIsPlaying(true)}
                          onPause={() => setIsPaused(true)}
                        />
                        {/* Play overlay - shown when video is hovered and not playing */}
                        {isMainHovered && !isPlaying && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <button
                              type="button"
                              onClick={() => {
                                if (mainVideoRef.current) {
                                  mainVideoRef.current.play();
                                  setIsPaused(false);
                                }
                              }}
                              className="text-white text-4xl p-4 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                              aria-label="Play video"
                              title="Play video"
                            >
                              <FaPlay aria-hidden />
                            </button>
                          </div>
                        )}
                        {/* Pause overlay - shown when video is playing and hovered */}
                        {isMainHovered && isPlaying && !isPaused && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <button
                              type="button"
                              onClick={() => {
                                if (mainVideoRef.current) {
                                  mainVideoRef.current.pause();
                                  setIsPaused(true);
                                }
                              }}
                              className="text-white text-lg"
                              aria-label="Pause video"
                              title="Pause video"
                            >
                              <FaPause aria-hidden />
                            </button>
                          </div>
                        )}
                        {/* Play overlay - shown when video is paused */}
                        {isMainHovered && isPaused && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <button
                              type="button"
                              onClick={() => {
                                if (mainVideoRef.current) {
                                  mainVideoRef.current.play();
                                  setIsPaused(false);
                                }
                              }}
                              className="text-white text-lg"
                              aria-label="Play video"
                              title="Play video"
                            >
                              <FaPlay aria-hidden />
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
                        className={`object-cover transition-transform duration-500 ${
                          hoveredImageIndex !== null
                            ? "scale-105"
                            : "group-hover/card:scale-105"
                        }`}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 176px, 208px"
                        priority
                      />
                    );
                  }
                })()}

                {/* Image Counter Badge */}
                <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1.5 bg-slate-800/80 text-white text-xs rounded-lg backdrop-blur-md border border-white/10">
                  <IoCameraOutline className="w-3 h-3" />
                  <span>{room.images?.length ?? 0}</span>
                </div>

                {/* Small thumbnails - vertical stack centered alongside main image */}
                {room.images && room.images.length > 1 && (
                  <div className="absolute z-20 flex-col hidden gap-2 right-3 bottom-6 sm:flex">
                    {room.images.slice(1, 4).map((img, idx) => {
                      const isLast = idx === 2 && room.images.length > 4;
                      const imageUrl = img?.url
                        ? URL_IMAGE + img.url
                        : "/images/default/room.png";
                      const isVid = img?.url ? isVideo(img.url) : false;
                      return (
                        <div
                          key={idx}
                          onMouseEnter={() => {
                            setHoveredImageIndex(1 + idx);
                            // Don't auto-play video on thumbnail hover
                          }}
                          onMouseLeave={() => {
                            setHoveredImageIndex(null);
                            // Pause video when leaving thumbnail hover
                            if (mainVideoRef.current) {
                              mainVideoRef.current.pause();
                              setIsPlaying(false);
                              setIsPaused(false);
                            }
                          }}
                          className="relative flex-shrink-0 w-8 h-8 overflow-hidden transition-colors bg-white border-2 rounded-lg shadow-lg cursor-pointer md:w-10 md:h-10 border-white/90 hover:border-slate-200"
                        >
                          {!isVid ? (
                            <Image
                              src={imageUrl}
                              alt={`${room.title} ${idx + 2}`}
                              fill
                              className={`object-cover ${
                                isLast ? "opacity-70" : ""
                              }`}
                              sizes="40px"
                            />
                          ) : (
                            <div className="relative w-full h-full">
                              <video
                                className="object-cover w-full h-full"
                                src={imageUrl}
                                width={40}
                                height={40}
                                muted
                                preload="metadata"
                              />
                              {/* Play icon overlay */}
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
                                <FaPlay className="text-white text-sm" />
                              </div>
                            </div>
                          )}
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
            {/* </RoomCartActionsWrapper> */}

            {/* CONTENT SECTION */}
            <div className="flex flex-col flex-1 p-2 sm:p-3">
              {/* Top row: Stars + Favorite */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="inline-flex items-center gap-2">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-lg backdrop-blur-sm border border-white/20">
                      <AiFillStar className="w-3 h-3" aria-hidden />
                      <span className="tracking-wider uppercase">VIP</span>
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
                  className="transition-colors hover:text-indigo-600"
                  title="Xem vị trí trên Google Maps"
                >
                  {room.address.street}, {room.address.ward.name},{" "}
                  {room.address.ward.district.name}
                </a>
                <span className="mx-2">•</span>
                <span className="font-medium">{room.area}m²</span>
              </div>

              {/* Description */}
              <div className="mb-1 text-sm italic leading-tight text-slate-500 sm:mb-2 line-clamp-1 sm:line-clamp-2">
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
                    <span className="text-xl font-bold sm:text-2xl text-emerald-600">
                      {/* {room.priceMonth.toLocaleString("en-US")} */}
                      {formatVNDPrice(room.priceMonth)}
                    </span>
                    <span className="text-sm text-slate-600">VNĐ</span>
                  </div>
                </div>

                {/* Buttons Row */}
                <div className="flex gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={handleViewRoom}
                    title="View room details"
                    aria-label="View room details"
                    className="flex-1 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-sm font-semibold rounded-lg sm:rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95 shadow-orange-500/25"
                  >
                    View room
                  </button>

                  <button
                    type="button"
                    onClick={handleCompare}
                    disabled={isCompared}
                    title={isCompared ? "Added to compare" : "Add to compare"}
                    aria-label={
                      isCompared ? "Added to compare" : "Add to compare"
                    }
                    aria-pressed={isCompared}
                    aria-disabled={isCompared}
                    className={`px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm font-semibold rounded-lg sm:rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 ${
                      isCompared
                        ? "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-600 cursor-not-allowed opacity-70"
                        : "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white shadow-amber-500/25 hover:shadow-lg"
                    }`}
                  >
                    {isCompared ? (
                      <>
                        <FaRegCheckCircle
                          className="w-4 h-4"
                          aria-hidden="true"
                        />
                        <span className="sr-only">Added to compare</span>
                      </>
                    ) : (
                      <>
                        <IoIosAddCircleOutline
                          className="w-4 h-4"
                          aria-hidden="true"
                        />
                        <span className="sr-only">Add to compare</span>
                      </>
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
                src={
                  room.landlord.landlordProfile.avatar
                    ? URL_IMAGE + room.landlord.landlordProfile.avatar
                    : "/images/default/avatar.jpg"
                }
                alt="Host avatar"
                width={24}
                height={24}
                className="object-cover border rounded-full shadow-sm sm:w-7 sm:h-7 border-slate-200/60"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-900">
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
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-slate-500">
                  Contact
                </div>
                <div className="text-sm font-semibold truncate text-slate-800">
                  {(() => {
                    const phone = room.landlord.landlordProfile.phoneNumber;
                    const email = room.landlord.landlordProfile.email;

                    function maskPhone(p: string | undefined | null) {
                      if (!p) return "";
                      const cleaned = p.replace(/\s+/g, "");
                      if (cleaned.length <= 6) {
                        // fallback: replace middle chars with asterisks
                        return cleaned.replace(/.(?=.{3}$)/g, "*");
                      }
                      const prefix = cleaned.slice(0, 2);
                      const suffix = cleaned.slice(-2);
                      return `${prefix}***${suffix}`;
                    }

                    function maskEmail(e: string | undefined | null) {
                      if (!e) return "";
                      const parts = e.split("@");
                      if (parts.length !== 2) {
                        // not a standard email, mask similarly to phone
                        return e.replace(/.(?=.{3}$)/g, "*");
                      }
                      const local = parts[0];
                      const domain = parts[1];
                      if (local.length <= 3) {
                        return `${local[0] || ""}***@${domain}`;
                      }
                      const localPrefix = local.slice(0, 1);
                      const localSuffix =
                        local.length > 6 ? local.slice(-1) : "";
                      const maskedLocal = localSuffix
                        ? `${localPrefix}***${localSuffix}`
                        : `${localPrefix}***`;
                      return `${maskedLocal}@${domain}`;
                    }

                    return phone ? maskPhone(phone) : maskEmail(email);
                  })()}
                </div>
              </div>
            </div>
          </div>
          <span className="flex items-center ml-2 text-gray-500 dark:text-gray-300">
            {/* <FaEye className="mr-1" /> {viewCount} */}
          </span>
        </div>
      </div>
    </>
  );
}
