import React from "react";
import Image from "next/image";

import { FaMapMarkerAlt } from "react-icons/fa";
import { PiRuler } from "react-icons/pi";
import { RoomData } from "@/app/landlord/types";
import { MdElectricBolt } from "react-icons/md";
import { IoWater } from "react-icons/io5";
import RoomCartActions from "./RoomCartActions";

export interface RoomCardProps {
  room: RoomData;
  isForSale?: boolean;
  isFeatured?: boolean;
}

const RoomCard: React.FC<RoomCardProps> = ({
  room,
  isForSale = false,
  isFeatured = false,
}) => {
  return (
    <div className="rounded-2xl overflow-hidden shadow-lg bg-white relative group w-[400px] h-[400px]">
      {/* Overlay hover effect */}
      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 pointer-events-none" />
      {/* Button hover center */}
      <div className="absolute left-1/2 top-1/2 z-40 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300">
        <RoomCartActions room={room} />
      </div>
      {/* Ảnh nền */}
      <div className="relative w-full h-full select-none pointer-events-none">
        <Image
          src={room.img?.[0]?.url || "/placeholder.jpg"}
          alt={room.name}
          fill
          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
          sizes="447px"
          priority
        />
        {/* Nhãn top */}
        <div className="absolute top-3 left-3 flex gap-2 z-30">
          {isForSale && (
            <span className="bg-green-700 text-white text-xs font-semibold px-3 py-1 rounded-full transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg">
              FOR SALE
            </span>
          )}
          {isFeatured && (
            <span className="bg-yellow-500 text-white text-xs font-semibold px-3 py-1 rounded-full transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg">
              FEATURED
            </span>
          )}
        </div>
        {/* Nội dung bottom */}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-4 flex flex-col gap-2 z-30 pointer-events-auto transition-all duration-300 group-hover:opacity-40">
          <div className="text-white font-semibold text-lg truncate mb-1 transition-colors duration-300 group-hover:font-bold">
            {room.name}
          </div>
          <div className="flex items-center gap-2 text-white text-sm truncate mb-2 transition-colors duration-300 group-hover:font-semibold">
            <FaMapMarkerAlt className="text-amber-400 transition-transform duration-300 group-hover:scale-110" />
            <span>{room.address}</span>
          </div>
          <div className="flex items-center gap-4 mt-2 mb-2">
            <div className="flex items-center gap-1 text-white text-sm transition-transform duration-300 group-hover:scale-105">
              <MdElectricBolt className="text-lg" />
              <span>{room.electricityRate}/kWh</span>
            </div>
            <div className="flex items-center gap-1 text-white text-sm transition-transform duration-300 group-hover:scale-105">
              <IoWater className="text-lg" />
              <span>{room.waterRate}/m³</span>
            </div>
            <div className="flex items-center gap-1 text-white text-sm transition-transform duration-300 group-hover:scale-105">
              <PiRuler className="text-lg" />
              <span>{room.area} m²</span>
            </div>
          </div>
          <div className="text-white text-xl font-bold mt-auto">
            {typeof room.price === "number"
              ? room.price.toLocaleString("en-US") + " VND"
              : room.price}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
