"use client";

import { useEffect, useState, useCallback } from "react";
import RoomVipCard from "@/app/users/components/rooms/RoomVipCard";
import RoomCard from "@/app/users/components/rooms/RoomCard";
import { RoomInUser } from "@/types/types";
import { useFavoriteStore } from "@/stores/favoriteStore";
import { fetchAndUpdateFavorites } from "@/services/FavoriteService";

export default function FavoriteRoomList() {
  const { favoriteRoomIds } = useFavoriteStore();
  const [rooms, setRooms] = useState<RoomInUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // State cho phân trang
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 6;

  // Hàm fetch danh sách phòng có phân trang
  const fetchRooms = useCallback(async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/user-dashboard/favorited-rooms?page=${page}&size=${pageSize}`);
      if (!res.ok) throw new Error("Không thể tải danh sách phòng yêu thích.");
      
      const data = await res.json();
      const newRooms: RoomInUser[] = data.content || [];
      
      // Cập nhật state
      setRooms(newRooms);
      setCurrentPage(data.page || page);
      setTotalPages(data.totalPages || 0);

      // Đảm bảo store có đầy đủ thông tin về toàn bộ phòng yêu thích
      // (Không chỉ 6 phòng trên trang hiện tại)
      fetchAndUpdateFavorites();
      
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Đã xảy ra lỗi khi tải dữ liệu.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Load dữ liệu khi trang được load hoặc chuyển trang
  useEffect(() => {
    fetchRooms(currentPage);
  }, [currentPage, fetchRooms]);

  // Xử lý chuyển trang
  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Xử lý khi xóa phòng khỏi danh sách yêu thích
  const handleFavoriteChange = (roomId: string) => {
    // Xóa phòng khỏi danh sách hiện tại
    setRooms(prevRooms => {
      const newRooms = prevRooms.filter(room => room.id !== roomId);
      
      // Nếu trang hiện tại trở nên trống và không phải trang đầu tiên
      if (newRooms.length === 0 && currentPage > 0) {
        // Sử dụng setTimeout để đảm bảo state được cập nhật trước khi chuyển trang
        setTimeout(() => setCurrentPage(currentPage - 1), 0);
      } else if (newRooms.length === 0) {
        // Nếu trang đầu tiên trống, cập nhật lại dữ liệu
        setTimeout(() => fetchRooms(0), 0);
      } else {
        // Nếu trang vẫn còn phòng, cập nhật lại dữ liệu trang hiện tại
        setTimeout(() => fetchRooms(currentPage), 0);
      }
      
      return newRooms;
    });
  };

  if (loading) {
    return <p className="py-4 text-center">Loading room list...</p>;
  }

  if (error) {
    return <p className="py-4 text-center text-red-500">{error}</p>;
  }

  if (rooms.length === 0) {
    return <p className="py-8 text-center text-gray-500">You have no favorited rooms.</p>;
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => {
          // Kiểm tra xem phòng có trong danh sách yêu thích không
          // Lưu ý: favoriteRoomIds từ store chứa đầy đủ tất cả ID phòng yêu thích
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
          Previous Page
        </button>
        <span className="text-lg font-semibold">
          Page {currentPage + 1} / {totalPages || 1}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1 || totalPages === 0}
          className="px-4 py-2 text-white bg-blue-500 rounded-md disabled:bg-gray-400"
        >
          Next Page
        </button>
      </div>
    </div>
  );
}