"use client";
import { useEffect, useState } from "react";
import { FaEye } from "react-icons/fa";
import { API_URL } from "@/services/Constant";

export default function IncreaseView({ roomId }: { roomId: string }) {
  const [viewCount, setViewCount] = useState(0);

  useEffect(() => {
    if (!roomId) return;
    // Tăng view
    fetch(`${API_URL}/rooms/${roomId}/view`, { method: "POST" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to increase view");
        return fetch(`${API_URL}/rooms/${roomId}`);
      })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch room info");
        return res.json();
      })
      .then((data) => setViewCount(data.viewCount ?? 0))
      .catch(() => setViewCount(0));
  }, [roomId]);

  return (
    <span className="flex items-center text-gray-500 dark:text-gray-300">
      <FaEye className="mr-1" /> {viewCount}
    </span>
  );
}
