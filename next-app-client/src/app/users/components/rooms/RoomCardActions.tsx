"use client";
import { RoomData } from "@/app/landlord/types";
import { useRouter } from "next/navigation";
import React from "react";
import { FaHeart } from "react-icons/fa";

export interface RoomCardProps {
  room: RoomData;
}

export default function RoomCartActions({ room }: RoomCardProps) {
  const router = useRouter();
  const handleClick = () => {
    router.push(`/detail/${room.key}`);
  };
  return (
    <div className="flex gap-3">
      <button
        className="bg-white/90 text-amber-600 px-3 py-2 rounded-full font-semibold shadow-lg hover:bg-amber-100 focus:outline-none flex items-center gap-2"
        tabIndex={0}
        title="Add to favorites"
      >
        <FaHeart className="text-lg" />
      </button>
      <button
        className="bg-amber-600 text-white px-5 py-2 rounded-full font-semibold shadow-lg hover:bg-amber-700 focus:outline-none whitespace-nowrap"
        onClick={handleClick}
        tabIndex={0}
      >
        See Detail
      </button>
    </div>
  );
}
