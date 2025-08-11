import Image from "next/image";
import React from "react";

import { URL_IMAGE } from "@/services/Constant";
import { RoomInUser } from "@/types/types";
import { FaMapMarkerAlt } from "react-icons/fa";
import { PiRuler } from "react-icons/pi";
import RoomCartActions from "./RoomCardActions";

export interface RoomCardProps {
  room: RoomInUser;
  isForSale?: boolean;
  isFeatured?: boolean;
}

const RoomCard: React.FC<RoomCardProps> = ({
  room,
  isForSale = false,
  isFeatured = false,
}) => {
  return (
    <div className="rounded-2xl overflow-hidden shadow-lg bg-white relative group w-[300px] h-[300px]">
      {/* Overlay hover effect */}
      <div className="absolute inset-0 z-20 transition-opacity duration-300 opacity-0 pointer-events-none bg-black/10 group-hover:opacity-100" />
      {/* Button hover center */}
      <div className="absolute z-40 transition-all duration-300 -translate-x-1/2 -translate-y-1/2 opacity-0 left-1/2 top-1/2 group-hover:opacity-100">
        <RoomCartActions room={room} />
      </div>
      {/* Ảnh nền */}
      <div className="relative w-full h-full pointer-events-none select-none">
        <Image
          src={URL_IMAGE + room.images?.[0]?.url || "/placeholder.jpg"}
          alt={room.title}
          fill
          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, 447px"
          priority
        />
        {/* Nhãn top */}
        <div className="absolute z-30 flex gap-2 top-3 left-3">
          {isForSale && (
            <span className="px-3 py-1 text-xs font-semibold text-white transition-all duration-300 bg-green-700 rounded-full group-hover:scale-105 group-hover:shadow-lg">
              FOR SALE
            </span>
          )}
          {isFeatured && (
            <span className="px-3 py-1 text-xs font-semibold text-white transition-all duration-300 bg-yellow-500 rounded-full group-hover:scale-105 group-hover:shadow-lg">
              FEATURED
            </span>
          )}
        </div>
        {/* Nội dung bottom */}
        <div className="absolute bottom-0 left-0 z-30 flex flex-col w-full gap-2 p-4 transition-all duration-300 pointer-events-auto bg-gradient-to-t from-black/80 to-transparent group-hover:opacity-40">
          <div className="mb-1 text-lg font-semibold text-white truncate transition-colors duration-300 group-hover:font-bold">
            {room.title || "No Title"}
          </div>
          <div className="flex items-center gap-2 mb-2 text-sm text-white transition-colors duration-300 group-hover:font-semibold">
            <FaMapMarkerAlt className="transition-transform duration-300 text-amber-400 group-hover:scale-110" />
            <span className="break-words whitespace-normal">
              {room.address.street +
                ", " +
                room.address.ward.name +
                ", " +
                room.address.ward.district.name +
                ", " +
                room.address.ward.district.province.name}
            </span>
          </div>
          <div className="flex items-center gap-4 mt-2 mb-2">
            <div className="flex items-center gap-1 text-sm text-white transition-transform duration-300 group-hover:scale-105">
              <PiRuler className="text-lg" />
              <span>{room.area} m²</span>
            </div>
          </div>
          <div className="mt-auto text-xl font-bold text-white">
            {typeof room.priceMonth === "number"
              ? room.priceMonth.toLocaleString("en-US") + " VND"
              : room.priceMonth}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
