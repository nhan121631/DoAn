"use client";
import { useEffect, useState } from "react";
import { FaHeart } from "react-icons/fa";
import { API_URL } from "@/services/Constant";

export default function FavoriteCount({ roomId }: { roomId: string }) {
  const [favoriteCount, setFavoriteCount] = useState(0);

  useEffect(() => {
    // fetch(`${API_URL}/rooms/${roomId}`)
    //   .then(res => res.json())
    //   .then(data => setFavoriteCount(data.favoriteCount ?? 0));
    fetch(`/api/favorites/rooms/${roomId}/count`)
  .then(res => res.json())
  .then(count => setFavoriteCount(count ?? 0));
  }, [roomId]);

  return (
    <span className="flex items-center font-semibold text-red-500 dark:text-red-400">
      <FaHeart className="mr-1" /> {favoriteCount} lượt thích
    </span>
  );
}