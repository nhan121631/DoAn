/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { RoomInUser } from "@/types/types";
import { message } from "antd";
import { useState } from "react";
import { FaHeart } from "react-icons/fa6";
import { useFavoriteStore } from "@/stores/FavoriteStore";

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

  const { data: session } = useSession();
  const router = useRouter();

  const { favoriteRoomIds, addFavorite, removeFavorite } = useFavoriteStore();
  const isFavorite = favoriteRoomIds.has(room.id);

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
          className={`transition-all duration-200 p-1 rounded-full border border-gray-200 bg-white/80 shadow-sm hover:shadow-md focus:ring-2 focus:ring-blue-200
          ${
            isFavorite
              ? "text-red-500 bg-red-50 border-red-200"
              : "text-gray-400 hover:text-red-500 hover:border-red-300"
          }
          ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
          onClick={handleFavorite}
          disabled={loading}
          type="button"
          title={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <FaHeart size={16} />
        </button>
      </>
    );
  }

  return (
    <>
      {contextHolder}
      <button
        aria-label="Favorite"
        className={`transition-all duration-200 p-2 rounded-full border border-gray-200 bg-white/80 shadow-sm hover:shadow-md focus:ring-2 focus:ring-blue-200
        ${
          isFavorite
            ? "text-red-500 bg-red-50 border-red-200"
            : "text-gray-400 hover:text-red-500 hover:border-red-300"
        }
        ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
        onClick={handleFavorite}
        disabled={loading}
        type="button"
        title={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        <FaHeart size={16} />
      </button>
    </>
  );
}
