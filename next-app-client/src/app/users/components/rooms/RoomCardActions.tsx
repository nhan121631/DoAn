"use client";
import { useCompareStore } from "@/app/stores/CompareStore";
import { RoomInUser } from "@/types/types";
import { message } from "antd";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaHeart, FaRegCheckCircle } from "react-icons/fa";
import { IoIosAddCircleOutline } from "react-icons/io";

export interface RoomCardProps {
  room: RoomInUser;
}

export default function RoomCartActions({ room }: RoomCardProps) {
  const router = useRouter();
  const handleClick = () => {
    router.push(`/detail/${room.id}`);
  };

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
      <div className="flex gap-2">
        <button
          className="flex items-center gap-1 px-2 py-1.5 text-sm font-semibold rounded-full shadow bg-white/90 text-red-500 hover:bg-amber-100 focus:outline-none"
          tabIndex={0}
          title="Add to favorites"
        >
          <FaHeart className="text-base" />
        </button>
        <button
          className={`flex items-center justify-center gap-1 px-3 py-1.5 text-sm transition rounded-full
            ${
              isCompared
                ? "bg-gray-200 text-gray-400 opacity-60 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700"
            }`}
          onClick={handleCompare}
          disabled={isCompared}
          type="button"
        >
          {isCompared ? <FaRegCheckCircle /> : <IoIosAddCircleOutline />}{" "}
          Compare
        </button>
        <button
          className="px-3 py-1.5 text-sm font-semibold text-white rounded-full shadow bg-amber-600 hover:bg-amber-700 focus:outline-none whitespace-nowrap"
          onClick={handleClick}
          tabIndex={0}
        >
          See Detail
        </button>
      </div>
    </>
  );
}
