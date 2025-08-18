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
import { useFavoriteStore } from "@/stores/favoriteStore";
import { useCompareStore } from "@/stores/CompareStore";


interface ButtonFavoriteProps {
  onClick?: () => void;
  room: RoomInUser;
  isFavorite?: boolean;
  onFavoriteChange?: (id: string) => void;

}

export function ButtonForVipCard({ room, onFavoriteChange }: ButtonFavoriteProps) {
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
    if (loading) return;
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
      } else {
        throw new Error("Failed to update favorite status");
      }
    } catch (error) {
      messageApi.error("Failed to update favorite status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <button
        aria-label="Favorite"
        className={`transition-colors ${isFavorite ? "text-red-500" : "text-gray-400 hover:text-red-500"} ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
        onClick={handleFavorite}
        disabled={loading}
        type="button"
      >
        <FaHeart size={22} />
        {loading && <span className="ml-1 text-xs animate-spin">⏳</span>}
      </button>
      <button
        className={`flex items-center justify-center gap-1 px-5 py-2 rounded-full transition 
      ${
        isCompared
          ? "bg-gray-200 text-gray-400 opacity-60 cursor-not-allowed"
          : "bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700"
      }`}
        onClick={handleCompare}
        disabled={isCompared}
        type="button"
      >
        {isCompared ? <FaRegCheckCircle /> : <IoIosAddCircleOutline />} Compare
      </button>
    </>
  );
}

