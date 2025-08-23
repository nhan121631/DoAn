"use client";
import { useSession } from "next-auth/react";

import { RoomInUser } from "@/types/types";
import { message } from "antd";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaHeart, FaRegCheckCircle } from "react-icons/fa";
import { IoIosAddCircleOutline } from "react-icons/io";
import { useCompareStore } from "@/stores/CompareStore";
import { useFavoriteStore } from "@/stores/FavoriteStore";

export interface RoomCardProps {
  room: RoomInUser;
  isFavorite?: boolean;
  onFavoriteChange?: (id: string) => void;
  showHeartOnly?: boolean;
}

export default function RoomCartActions({
  room,
  onFavoriteChange,
  showHeartOnly,
}: RoomCardProps) {
  const router = useRouter();
  const handleClick = () => {
    router.push(`/detail/${room.id}`);
  };

  const { items, addItem } = useCompareStore((state) => state);
  const [isCompared, setIsCompared] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

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

  const handleFavorite = async () => {
    if (!session) {
      router.push("/auth/login");
      return;
    }
    setLoadingFavorite(true);
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
      setLoadingFavorite(false);
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
          ${loadingFavorite ? "opacity-60 cursor-not-allowed" : ""}`}
          onClick={handleFavorite}
          disabled={loadingFavorite}
          type="button"
        >
          <FaHeart className="text-base" />
        </button>
      </>
    );
  }

  return (
    <>
      {contextHolder}
      <div className="flex gap-2">
        {/* Favorite Button */}
        <button
          className={`flex items-center gap-1 px-2.5 py-1.5 text-base font-semibold rounded-full shadow bg-white/90 border border-gray-200 focus:ring-2 focus:ring-red-300 transition-all duration-150
            ${
              isFavorite
                ? "text-red-500 bg-red-50 border-red-200"
                : "text-gray-400 hover:text-red-500 hover:bg-red-50"
            }
            ${
              loadingFavorite
                ? "opacity-60 cursor-not-allowed"
                : "hover:scale-105 active:scale-95"
            }`}
          tabIndex={0}
          title={isFavorite ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
          onClick={handleFavorite}
          type="button"
          disabled={loadingFavorite}
        >
          <FaHeart className="text-base" />
        </button>
        {/* Compare Button */}
        <button
          className={`flex items-center justify-center gap-1 px-3 py-1.5 text-base font-semibold rounded-full border transition-all duration-150
            ${
              isCompared
                ? "bg-gray-100 text-gray-400 border-gray-200 opacity-60 cursor-not-allowed"
                : "bg-blue-500 text-white border-blue-500 hover:bg-white hover:text-blue-600 hover:border-blue-400 active:scale-95"
            }
            focus:ring-2 focus:ring-blue-300`}
          onClick={handleCompare}
          disabled={isCompared}
          type="button"
        >
          {isCompared ? <FaRegCheckCircle /> : <IoIosAddCircleOutline />}{" "}
          Compare
        </button>
      </div>
    </>
  );
}
