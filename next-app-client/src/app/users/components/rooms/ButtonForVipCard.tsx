"use client";

import { useCompareStore } from "@/stores/CompareStore";
import { RoomInUser } from "@/types/types";
import { message } from "antd";
import { useEffect, useState } from "react";
import { FaRegCheckCircle } from "react-icons/fa";
import { FaHeart } from "react-icons/fa6";
import { IoIosAddCircleOutline } from "react-icons/io";

interface ButtonFavoriteProps {
  onClick?: () => void;
  room: RoomInUser;
  isFavorite?: boolean;
}

export function ButtonForVipCard({
  onClick,
  isFavorite,
  room,
}: ButtonFavoriteProps) {
  const { items, addItem } = useCompareStore((state) => state);
  const [isCompared, setIsCompared] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

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

  return (
    <>
      {contextHolder}
      <button
        aria-label="Favorite"
        className={`transition-colors ${
          isFavorite ? "text-red-500" : "text-gray-400 hover:text-red-500"
        }`}
        onClick={onClick}
        type="button"
      >
        <FaHeart size={22} />
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
