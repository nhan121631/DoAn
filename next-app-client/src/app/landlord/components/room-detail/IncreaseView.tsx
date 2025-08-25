"use client";
import { useEffect, useState } from "react";
import { FaEye } from "react-icons/fa";
import { API_URL } from "@/services/Constant";


export default function IncreaseView({ roomId }: { roomId: string }) {
  const [viewCount, setViewCount] = useState(0);

  useEffect(() => {
    // Tăng view
    fetch(`${API_URL}/rooms/${roomId}/view`, { method: "POST" }).then(() => {
  fetch(`${API_URL}/rooms/${roomId}`)
    .then(res => res.json())
    .then(data => setViewCount(data.viewCount ?? 0));
});
  }, [roomId]);

  return (
    <span className="flex items-center text-gray-500 dark:text-gray-300">
      <FaEye className="mr-1" /> {viewCount}
    </span>
  );
}