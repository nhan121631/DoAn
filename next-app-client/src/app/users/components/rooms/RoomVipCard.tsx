import React from "react";
import Image from "next/image";
import { RoomData } from "@/app/landlord/types";
import { IoCameraOutline } from "react-icons/io5";
import { FaHeart } from "react-icons/fa6";

interface RoomVipCardProps {
  room: RoomData;
}

export default function RoomVipCard({ room }: RoomVipCardProps) {
  // Xử lý ngày đăng bài
  function getPostDateLabel(postStartDate: string) {
    if (!postStartDate) return "";
    const today = new Date();
    const postDate = new Date(postStartDate);
    // Đặt giờ về 0 để so sánh ngày
    today.setHours(0, 0, 0, 0);
    postDate.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - postDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Hôm nay";
    if (diffDays === 1) return "Hôm qua";
    if (diffDays > 1 && diffDays <= 5) return `${diffDays} ngày trước`;
    return postStartDate;
  }

  return (
    <div className="rounded-xl overflow-hidden shadow bg-white border border-gray-200 mx-auto w-full max-w-[750px] min-w-[320px]">
      {/* Image section */}
      <div className="flex gap-1 p-3 w-full h-[320px] min-h-[200px] max-h-[320px]">
        <div
          className="relative rounded-sm overflow-hidden h-full group/image-main"
          style={{ width: "65%" }}
        >
          <Image
            src={room.img?.[0]?.url || "/placeholder.jpg"}
            alt={room.name}
            fill
            className="object-cover w-full h-full transition-all duration-500 ease-in-out group-hover/image-main:scale-105 group-hover/image-main:shadow-2xl group-hover/image-main:brightness-95"
            sizes="(max-width: 650px) 55vw, 300px"
            priority
          />
          <div className="absolute left-2 bottom-2 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <span className="material-icons text-base">
              <IoCameraOutline />
            </span>
            {room.img?.length ?? 0}
          </div>
        </div>

        <div className="flex flex-col gap-1 h-full" style={{ width: "35%" }}>
          {room.img?.slice(1, 4).map((img, idx) => (
            <div
              key={idx}
              className="relative flex-1 min-h-0 rounded-sm overflow-hidden group/image-thumb"
            >
              <Image
                src={room.img?.[idx + 1]?.url || "/placeholder.jpg"}
                alt={room.name + " " + (idx + 2)}
                fill
                className="object-cover w-full h-full transition-all duration-500 ease-in-out group-hover/image-thumb:scale-105 group-hover/image-thumb:shadow-xl group-hover/image-thumb:brightness-95"
                sizes="(max-width: 650px) 40vw, 120px"
              />
            </div>
          ))}
        </div>
      </div>
      {/* Content section */}
      <div className="p-4 flex flex-col gap-2 min-h-[120px] max-h-[180px] max-w-[700px] overflow-hidden">
        <div className="flex items-center gap-2 mb-1">
          {/* {room.rating && (
            <span className="text-yellow-400 text-lg">{'★'.repeat(room.rating)}</span>
          )} */}
          <span className="text-yellow-400 text-lg">★★★★★</span>
          <span className="font-bold text-lg text-red-500 uppercase flex-1 truncate max-w-[420px]">
            {room.name}
          </span>
        </div>
        <div className="flex items-center gap-3 text-green-600 font-semibold text-base max-w-full">
          <span className="truncate max-w-[120px]">
            {room.price.toLocaleString("en-US") + "đ"}
          </span>
          <span className="text-gray-500 font-normal truncate max-w-[80px]">
            • {room.area}m²
          </span>
          <span className="text-gray-500 font-normal truncate max-w-[180px]">
            • {room.address}
          </span>
        </div>
        <div className="text-gray-700 text-sm mb-2 max-w-full">
          {room.description}
        </div>
        <div className="flex items-center gap-2 mt-auto">
          <Image
            src="/images/useravt.png"
            alt="hhhihi"
            width={32}
            height={32}
            className="rounded-full border"
          />
          <span className="font-medium text-gray-800">{room.landlordName}</span>
          <span className="text-gray-400 text-xs">
            {getPostDateLabel(room.postStartDate)}
          </span>
          <span className="ml-auto bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-semibold text-sm">
            {room.phoneNumber}
          </span>
          <button
            name="favorite"
            className="ml-2 text-gray-400 hover:text-red-500"
          >
            <FaHeart size={22} />
          </button>
        </div>
      </div>
    </div>
  );
}
