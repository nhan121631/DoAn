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
  // const handleClick = () => {
  //   router.push(`/detail/${room.id}`);
  // };

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
      .then((res) => res.json())
      .then(setFavoriteCount);
  }, [room.id]);

  const handleFavorite = async () => {
    if (!session) {
      router.push("/auth/login");
      return;
    }
    
    const wasFavorite = isFavorite; 
    
    if (wasFavorite) {
      removeFavorite(room.id);
      if (onFavoriteChange) onFavoriteChange(room.id);
      setFavoriteCount((prevCount) => prevCount > 0 ? prevCount - 1 : 0);
    } else {
      addFavorite(room.id);
      setFavoriteCount((prevCount) => prevCount + 1);
    }

    setLoadingFavorite(true);

    try {
      const res = await fetch(`/api/favorites/rooms/${room.id}`, {
        method: wasFavorite ? "DELETE" : "POST",
      });

      if (!res.ok) {
        throw new Error("Failed to update favorite status on the server.");
      }
      
      messageApi.success(wasFavorite ? "Removed from favorites" : "Added to favorites");
  
  } catch (err) { 
    console.error("Failed to update favorite status:", err);
    
    if (wasFavorite) {
      addFavorite(room.id); 
      setFavoriteCount((prevCount) => prevCount + 1);
    } else {
      removeFavorite(room.id);
      setFavoriteCount((prevCount) => prevCount > 0 ? prevCount - 1 : 0);
    }
    messageApi.error("Failed to update favorite status.");
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
            <span className="ml-1 text-xs font-bold text-white">
              {favoriteCount}
            </span>
          </div>
        </div>
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
        <span className="ml-1 text-sm font-bold text-blue-500">
          {favoriteCount}
        </span>

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


