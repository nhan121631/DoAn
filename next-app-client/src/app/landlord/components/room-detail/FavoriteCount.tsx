/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";
import { useFavoriteStore } from "@/stores/FavoriteStore";
import { useEffect, useState } from "react";
import { FaHeart } from "react-icons/fa";

export default function FavoriteCount({ roomId }: { roomId: string }) {
  const [favoriteCount, setFavoriteCount] = useState(0);
  const { favoriteRoomIds } = useFavoriteStore(); // 🎯 Listen thay đổi

  useEffect(() => {
    // fetch(`${API_URL}/rooms/${roomId}`)
    //   .then(res => res.json())
    //   .then(data => setFavoriteCount(data.favoriteCount ?? 0));
    fetch(`/api/favorites/rooms/${roomId}/count`)
      .then((res) => res.json())
      .then((count) => setFavoriteCount(count ?? 0));
  }, [roomId, favoriteRoomIds]);

  return (
    <span className="flex items-center font-semibold text-red-500 dark:text-red-400">
      {/* <FaHeart className="mr-1" /> {favoriteCount} like */}
      <FaHeart className="mr-1" /> {favoriteCount} Favorite
      {favoriteCount > 1 ? "s" : ""}
    </span>
  );
}
