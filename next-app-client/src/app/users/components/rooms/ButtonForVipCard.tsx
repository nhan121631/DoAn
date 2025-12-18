/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { RoomInUser } from "@/types/types";
import { message } from "antd";
import { useEffect, useState, useCallback } from "react";
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
  const [favoriteCount, setFavoriteCount] = useState(0);

  const { data: session } = useSession();
  const router = useRouter();

  const { favoriteRoomIds, addFavorite, removeFavorite } = useFavoriteStore();
  const isFavorite = favoriteRoomIds.has(room.id);

  const fetchFavoriteCount = useCallback(async () => {
    try {
      const res = await fetch(`/api/favorites/rooms/${room.id}/count`);
      const data = await res.json();
      setFavoriteCount(data);
    } catch (error) {
      console.error("Failed to fetch favorite count:", error);
    }
  }, [room.id]);

  useEffect(() => {
    fetchFavoriteCount();
  }, [fetchFavoriteCount]);

  const handleFavorite = async () => {
    if (!session) {
      router.push("/auth/login");
      return;
    }

    const wasFavorite = isFavorite;

    if (wasFavorite) {
      removeFavorite(room.id);
      if (onFavoriteChange) onFavoriteChange(room.id);
      setFavoriteCount((prevCount) => (prevCount > 0 ? prevCount - 1 : 0));
    } else {
      addFavorite(room.id);
      setFavoriteCount((prevCount) => prevCount + 1);
    }

    try {
      const res = await fetch(`/api/favorites/rooms/${room.id}`, {
        method: wasFavorite ? "DELETE" : "POST",
      });

      if (!res.ok) {
        throw new Error(
          "Không thể cập nhật trạng thái yêu thích trên máy chủ."
        );
      }

      messageApi.success(
        wasFavorite
          ? "Đã xóa khỏi danh sách yêu thích"
          : "Đã thêm vào danh sách yêu thích"
      );
    } catch (err) {
      console.error("Failed to update favorite status:", err);

      if (wasFavorite) {
        addFavorite(room.id);
        setFavoriteCount((prevCount) => prevCount + 1);
      } else {
        removeFavorite(room.id);
        setFavoriteCount((prevCount) => (prevCount > 0 ? prevCount - 1 : 0));
      }
      messageApi.error("Cập nhật trạng thái yêu thích thất bại.");
    }
  };

  if (showHeartOnly) {
    return (
      <>
        {contextHolder}
        <button
          aria-label="Yêu thích"
          className={`flex items-center gap-2 px-4 py-2 transition-all duration-200 rounded-full border shadow-sm hover:shadow-md focus:ring-2 focus:ring-red-200
            ${
              isFavorite
                ? "text-red-500 bg-white border-red-300 hover:border-red-400 hover:bg-red-50"
                : "text-gray-500 bg-white border-red-300 hover:text-red-500 hover:border-red-400 hover:bg-red-50"
            }`}
          onClick={handleFavorite}
          type="button"
          title={
            isFavorite
              ? "Xóa khỏi danh sách yêu thích"
              : "Thêm vào danh sách yêu thích"
          }
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
        aria-label="Yêu thích"
        className={`flex items-center gap-1.5 px-3 py-1.5 transition-all duration-200 rounded-full border shadow-sm hover:shadow-md focus:ring-2 focus:ring-red-200
          ${
            isFavorite
              ? "text-red-500 bg-white border-red-300 hover:border-red-400 hover:bg-red-50"
              : "text-gray-500 bg-white border-red-300 hover:text-red-500 hover:border-red-400 hover:bg-red-50"
          }`}
        onClick={handleFavorite}
        type="button"
        title={
          isFavorite
            ? "Xóa khỏi danh sách yêu thích"
            : "Thêm vào danh sách yêu thích"
        }
      >
        <FaHeart size={16} />
        <span className="text-sm font-bold text-blue-500">{favoriteCount}</span>
      </button>
    </>
  );
}
