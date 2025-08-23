/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { RoomInUser } from "@/types/types";
import { message } from "antd";
import { useEffect, useState } from "react";
import { FaRegCheckCircle } from "react-icons/fa";
import { FaHeart } from "react-icons/fa6";
import { IoIosAddCircleOutline } from "react-icons/io";
import { useFavoriteStore } from "@/stores/FavoriteStore";
import { useCompareStore } from "@/stores/CompareStore";

interface ButtonFavoriteProps {
  onClick?: () => void;
  room: RoomInUser;
  isFavorite?: boolean;
  onFavoriteChange?: (id: string) => void;
  showHeartOnly?: boolean;

}

export function ButtonForVipCard({ room, onFavoriteChange, showHeartOnly }: ButtonFavoriteProps) {
  const { items, addItem } = useCompareStore((state) => state);
  const [isCompared, setIsCompared] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);


  const { data: session } = useSession();
  const router = useRouter();

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
  setLoading(true);
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
    setLoading(false);
  }
};
if (showHeartOnly) {
    return (
      <>
        {contextHolder}
        <button
          aria-label="Favorite"
          className={`transition-colors p-2 rounded-full bg-white/70 backdrop-blur-sm
          ${isFavorite ? "text-red-500" : "text-gray-400 hover:text-red-500"} 
          ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
          onClick={handleFavorite}
          disabled={loading}
          type="button"
        >
          <FaHeart size={22} />
          <span
    className="absolute text-xs font-bold text-blue-500 top-1 right-1"
    style={{ pointerEvents: "none" }}
  >
    {favoriteCount}
  </span>
        </button>
      </>
    );
  }

  return (
    <>
      {contextHolder}
<div className="flex items-center justify-center px-3 py-1 transition-all duration-200 rounded-full shadow bg-white/70">
  <button
    aria-label="Favorite"
    className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors
      ${isFavorite ? "text-red-500" : "text-gray-400 hover:text-red-500"}
      ${loading ? "opacity-60 cursor-not-allowed" : ""}
      hover:bg-white/20 hover:scale-110`}
    onClick={handleFavorite}
    disabled={loading}
    type="button"
    style={{ background: "transparent" }}
  >
    <FaHeart size={22} />
  </button>
  <span className="ml-2 text-base font-bold text-blue-500">{favoriteCount}</span>
</div>
      <button
        className={`flex items-center justify-center gap-2 px-5 py-2 rounded-full shadow-sm border border-gray-200 font-semibold text-base transition-all duration-200
          ${
            isCompared
              ? "bg-gray-100 text-gray-400 border-gray-200 opacity-60 cursor-not-allowed"
              : "bg-blue-500 text-white border-blue-500 hover:bg-white hover:text-blue-600 hover:border-blue-400 active:scale-95"
          }
        `}
        onClick={handleCompare}
        disabled={isCompared}
        type="button"
        style={{ minWidth: 110 }}
      >
        <span className="flex items-center">
          {isCompared ? (
            <FaRegCheckCircle size={20} />
          ) : (
            <IoIosAddCircleOutline size={22} />
          )}
        </span>
        <span>Compare</span>
      </button>
    </>
  );
}



