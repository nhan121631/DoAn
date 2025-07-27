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
        className="flex items-center gap-2 px-3 py-2 font-semibold rounded-full shadow-lg bg-white/90 text-amber-600 hover:bg-amber-100 focus:outline-none"
        tabIndex={0}
        title="Add to favorites"
      >
        <FaHeart className="text-lg" />
      </button>
      <button
        className="px-5 py-2 font-semibold text-white rounded-full shadow-lg bg-amber-600 hover:bg-amber-700 focus:outline-none whitespace-nowrap"
        onClick={handleClick}
        tabIndex={0}
      >
        See Detail
      </button>
    </div>
  );
}
