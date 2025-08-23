"use client";
import { useSession } from "next-auth/react";

import { RoomInUser } from "@/types/types";
import { message } from "antd";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaHeart, FaRegCheckCircle } from "react-icons/fa";
import { IoIosAddCircleOutline } from "react-icons/io";
import { useFavoriteStore } from "@/stores/FavoriteStore";
import { useCompareStore } from "@/stores/CompareStore";


export interface RoomCardProps {
  room: RoomInUser;
  isFavorite?: boolean;
  onFavoriteChange?: (id: string) => void;
  showHeartOnly?: boolean;
}

export default function RoomCartActions({ room, onFavoriteChange, showHeartOnly }: RoomCardProps) {
  const router = useRouter();
  const handleClick = () => {
    router.push(`/detail/${room.id}`);
  };

  const { items, addItem } = useCompareStore((state) => state);
  const [isCompared, setIsCompared] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [favoriteCount, setFavoriteCount] = useState(0);


  const { data: session } = useSession();

  const { favoriteRoomIds, addFavorite, removeFavorite } = useFavoriteStore();
  const isFavorite = favoriteRoomIds.has(room.id);

  const handleCompare = () => {
    if (items.length >= 2) {
      // ✅ Gọi message trong event handler
      messageApi.warning({
        content: "You can only compare up to 2 rooms.",
        duration: 1.5,
      });
      return;
    }
    addItem({ room });
  };

  useEffect(() => {
    setIsCompared(items.some((item) => item.room.id === room.id));
  }, [items, room.id]);

  useEffect(() => {
  fetch(`/api/favorites/rooms/${room.id}/count`)
    .then(res => res.json())
    .then(setFavoriteCount);
}, [room.id]);

  const handleFavorite = async () => {
    if (!session) {
      router.push("/auth/login");
      return;
    }
    setLoadingFavorite(true);
    try {
      const res = await fetch(
        `/api/favorites/rooms/${room.id}`,
        { method: isFavorite ? "DELETE" : "POST" }
      );

      if (res.ok) {
        if (isFavorite) {
          removeFavorite(room.id);
          if (onFavoriteChange) onFavoriteChange(room.id);
          messageApi.success("Removed from favorites");
        } else {
          addFavorite(room.id);
          messageApi.success("Added to favorites");
        }
        const countRes = await fetch(`/api/favorites/rooms/${room.id}/count`);
      const newCount = await countRes.json();
      setFavoriteCount(newCount);
      } else {
        throw new Error("Failed to update favorite status");
      }
    } catch (error) {
      messageApi.error("Failed to update favorite status");
    } finally {
      setLoadingFavorite(false);
    }
  };
  if (showHeartOnly) {
    return (
      <>
        {contextHolder}
        <div className="flex items-center gap-4 px-4 py-2 rounded-full shadow-lg bg-black/30">
  <div className="flex items-center gap-1">
    <button
      aria-label="Favorite"
      className={`flex items-center justify-center w-8 h-8 rounded-full transition
        ${isFavorite ? "text-red-500" : "text-gray-400 hover:text-red-500"}
        ${loadingFavorite ? "opacity-60 cursor-not-allowed" : ""}
        hover:bg-white/20 hover:scale-110`}
      onClick={handleFavorite}
      disabled={loadingFavorite}
      type="button"
    >
      <FaHeart size={20} />
    </button>
    <span className="ml-1 text-xs font-bold text-white">{favoriteCount}</span>
  </div>
</div>
        
      </>
    );
  }

  return (
    <>
      {contextHolder}
      <div className="flex gap-2">
        <div className="flex items-center px-2 py-0.5 border border-gray-200 rounded-full shadow bg-white/90">
  <button
    aria-label="Favorite"
    className={`flex items-center justify-center w-6 h-6 rounded-full transition
      ${isFavorite ? "text-red-500" : "text-gray-400 hover:text-red-500"}
      ${loadingFavorite ? "opacity-60 cursor-not-allowed" : ""}
      hover:bg-white/20 hover:scale-110`}
    onClick={handleFavorite}
    disabled={loadingFavorite}
    type="button"
  >
    <FaHeart size={16} />
  </button>
  <span className="ml-1 text-sm font-bold text-blue-500">{favoriteCount}</span>
</div>
        {/* Compare Button */}
        <button
          className={`flex items-center justify-center gap-1 px-3 py-1.5 text-base font-semibold rounded-full border transition-all duration-150
            ${isCompared
              ? "bg-gray-100 text-gray-400 border-gray-200 opacity-60 cursor-not-allowed"
              : "bg-blue-500 text-white border-blue-500 hover:bg-white hover:text-blue-600 hover:border-blue-400 active:scale-95"}
            focus:ring-2 focus:ring-blue-300`}
          onClick={handleCompare}
          disabled={isCompared}
          type="button"
        >
          {isCompared ? <FaRegCheckCircle /> : <IoIosAddCircleOutline />} Compare
        </button>
        {/* Detail Button */}
        <button
          className="px-3 py-1.5 text-base font-semibold text-white rounded-full shadow bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-300 whitespace-nowrap transition-all duration-150 hover:scale-105 active:scale-95"
          onClick={handleClick}
          tabIndex={0}
        >
          See Details
        </button>
      </div>
    </>
  );
}

