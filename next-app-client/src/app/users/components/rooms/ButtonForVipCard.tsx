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
import { useCompareStore } from "@/stores/CompareStore";
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
  const { items, addItem } = useCompareStore((state) => state);
  const [isCompared, setIsCompared] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);

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
        ${loading ? "opacity-60 cursor-not-allowed" : ""} mr-2`}
        onClick={handleFavorite}
        disabled={loading}
        type="button"
        title={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        <FaHeart size={16} />
      </button>
      <button
        className={`flex items-center justify-center gap-2 px-3 py-2 rounded-full shadow-sm border font-semibold text-sm transition-all duration-200 min-w-[92px]
          ${
            isCompared
              ? "bg-gray-100 text-gray-400 border-gray-200 opacity-60 cursor-not-allowed"
              : "bg-blue-600 text-white border-blue-600 hover:bg-white hover:text-blue-600 hover:border-blue-400 active:scale-95"
          }
        `}
        onClick={handleCompare}
        disabled={isCompared}
        type="button"
        title={isCompared ? "Already in compare list" : "Compare this room"}
      >
        <span className="flex items-center">
          {isCompared ? (
            <FaRegCheckCircle size={18} />
          ) : (
            <IoIosAddCircleOutline size={18} />
          )}
        </span>
        <span>Compare</span>
      </button>
    </>
  );
}
