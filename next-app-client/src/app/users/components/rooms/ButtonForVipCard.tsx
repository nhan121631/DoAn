/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { RoomInUser } from "@/types/types";
import { message } from "antd";
import { useEffect, useState } from "react";
import { FaHeart } from "react-icons/fa6";
import { useFavoriteStore } from "@/stores/favoriteStore";

interface ButtonFavoriteProps {
  onClick?: () => void;
  room: RoomInUser;
  isFavorite?: boolean;
  onFavoriteChange?: (id: string) => void;
  showHeartOnly?: boolean;
}

export function ButtonForVipCard({
  room,
  onFavoriteChange,
  showHeartOnly,
}: ButtonFavoriteProps) {
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);


  const { data: session } = useSession();
  const router = useRouter();

  const { favoriteRoomIds, addFavorite, removeFavorite } = useFavoriteStore();
  const isFavorite = favoriteRoomIds.has(room.id);
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
      const res = await fetch(`/api/favorites/rooms/${room.id}`, {
        method: isFavorite ? "DELETE" : "POST",
      });

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
        className={`flex items-center gap-2 px-4 py-2 transition-all duration-200 rounded-full border shadow-sm hover:shadow-md focus:ring-2 focus:ring-red-200
        ${
          isFavorite
            ? "text-red-500 bg-white border-red-300 hover:border-red-400 hover:bg-red-50"
            : "text-gray-500 bg-white border-red-300 hover:text-red-500 hover:border-red-400 hover:bg-red-50"
        }
        ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
        onClick={handleFavorite}
        disabled={loading}
        type="button"
        title={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        <FaHeart size={16} />
        <span className="text-sm font-bold text-blue-500">
          {favoriteCount}
        </span>
      </button>
      </>
    );
  }

  return (
    <>
      {contextHolder}
        <button
      aria-label="Favorite"
      className={`flex items-center gap-1.5 px-3 py-1.5 transition-all duration-200 rounded-full border shadow-sm hover:shadow-md focus:ring-2 focus:ring-red-200
      ${
        isFavorite
          ? "text-red-500 bg-white border-red-300 hover:border-red-400 hover:bg-red-50"
          : "text-gray-500 bg-white border-red-300 hover:text-red-500 hover:border-red-400 hover:bg-red-50"
      }
      ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
      onClick={handleFavorite}
      disabled={loading}
      type="button"
      title={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      <FaHeart size={16} />
      <span className="text-sm font-bold text-blue-500">
        {favoriteCount}
      </span>
    </button>

    </>
  );
}
