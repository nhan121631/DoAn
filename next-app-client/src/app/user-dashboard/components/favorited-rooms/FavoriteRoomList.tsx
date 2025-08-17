"use client";

import { useEffect, useState, useCallback } from "react";
import RoomVipCard from "@/app/users/components/rooms/RoomVipCard";
import RoomCard from "@/app/users/components/rooms/RoomCard";
import { RoomInUser } from "@/types/types";
import { useFavoriteStore } from "@/stores/favoriteStore";

export default function FavoriteRoomList() {
  const { setFavoriteRoomIds, favoriteRoomIds } = useFavoriteStore();
  const [rooms, setRooms] = useState<RoomInUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // State cho phân trang
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 3;

  const fetchRooms = useCallback(async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/user-dashboard/favorited-rooms?page=${page}&size=${pageSize}`);
      if (!res.ok) throw new Error("Không thể tải danh sách phòng yêu thích.");
      const data = await res.json();
      
      const newRooms: RoomInUser[] = data.content || [];
      const newFavoriteIds: string[] = newRooms.map(room => room.id);
      
      setFavoriteRoomIds(newFavoriteIds);
      setRooms(newRooms);
      setCurrentPage(data.page);
      setTotalPages(data.totalPages);

    } catch (e: unknown) {
  if (e instanceof Error) {
    setError(e.message);
  } else {
    setError("Đã xảy ra lỗi khi tải dữ liệu.");
  }
} finally {
  setLoading(false);
}
  }, [setFavoriteRoomIds]);

  useEffect(() => {
    fetchRooms(currentPage);
  }, [currentPage, fetchRooms]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleFavoriteChange = (roomId: string) => {
    // Cập nhật trạng thái hiển thị bằng cách lọc bỏ phòng đã xóa
    setRooms(prevRooms => prevRooms.filter(room => room.id !== roomId));
    // Sau khi xóa, fetch lại trang hiện tại để cập nhật
    fetchRooms(currentPage);
  };

  if (loading) {
    return <p className="py-4 text-center">Đang tải danh sách phòng...</p>;
  }

  if (error) {
    return <p className="py-4 text-center text-red-500">{error}</p>;
  }

  if (rooms.length === 0) {
    return <p className="py-8 text-center text-gray-500">Bạn chưa có phòng trọ yêu thích nào.</p>;
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => {
          const isFavorite = favoriteRoomIds.has(room.id);
          return (
            <div key={room.id}>
              {room.isVip ? (
                <RoomVipCard
                  room={room}
                  isFavorite={isFavorite}
                  onFavoriteChange={handleFavoriteChange}
                />
              ) : (
                <RoomCard
                  room={room}
                  isFavorite={isFavorite}
                  onFavoriteChange={handleFavoriteChange}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-center gap-4 py-8">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="px-4 py-2 text-white bg-blue-500 rounded-md disabled:bg-gray-400"
        >
          Trang trước
        </button>
        <span className="text-lg font-semibold">
          Trang {currentPage + 1} / {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          className="px-4 py-2 text-white bg-blue-500 rounded-md disabled:bg-gray-400"
        >
          Trang sau
        </button>
      </div>
    </div>
  );
}
