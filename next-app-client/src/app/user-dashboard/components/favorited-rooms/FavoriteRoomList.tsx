"use client";

import { useEffect, useState, useCallback } from "react";
import { RoomInUser } from "@/types/types";
import { fetchAndUpdateFavorites } from "@/services/FavoriteService";
import FavoriteDashboardRoomCard from "./FavoriteDashboardRoomCard";
import FavoriteDashboardRoomVipCard from "./FavoriteDashboardRoomVipCard";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";
import { useFavoriteStore } from "@/stores/FavoriteStore";

export default function FavoriteRoomList() {
  const { favoriteRoomIds } = useFavoriteStore();
  const [rooms, setRooms] = useState<RoomInUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 6;

  const fetchRooms = useCallback(async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/user-dashboard/favorited-rooms?page=${page}&size=${pageSize}`
      );

      if (!res.ok) throw new Error("Không thể tải danh sách phòng yêu thích.");

      const data = await res.json();
      const newRooms: RoomInUser[] = data.content || [];

      setRooms(newRooms);
      setCurrentPage(data.page || page);
      setTotalPages(data.totalPages || 0);
      // Update favoriteRoomIds in store
      fetchAndUpdateFavorites();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Đã có lỗi xảy ra");
      } else {
        setError("Đã có lỗi xảy ra");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms(currentPage);
  }, [fetchRooms, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  };

  const handleFavoriteChange = useCallback((id: string) => {
    setRooms((prevRooms) => {
      const newRooms = prevRooms.filter((room) => room.id !== id);
      
      // Nếu trang hiện tại không còn phòng nào và không phải trang đầu tiên
      if (newRooms.length === 0 && currentPage > 0) {
        // Chuyển về trang trước
        setCurrentPage(currentPage - 1);
      }
      
      return newRooms;
    });
  }, [currentPage]);

  if (loading && rooms.length === 0) {
    return <p className="text-center text-gray-500">Loading...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">Error: {error}</p>;
  }

  if (rooms.length === 0) {
    return (
      <p className="text-center text-gray-500">You have no favorite rooms.</p>
    );
  }

  return (
    <div className="flex flex-col w-full">
      {/* <div className="flex flex-col w-full gap-6">
        {rooms.map((room) => {
          const isFavorite = favoriteRoomIds.has(room.id);
          return (
            <div key={room.id}>
              {room.isVip ? (
                <FavoriteDashboardRoomVipCard
                  room={room}
                  isFavorite={isFavorite}
                  onFavoriteChange={handleFavoriteChange}
                />
              ) : (
                <FavoriteDashboardRoomCard
                  room={room}
                  isFavorite={isFavorite}
                  onFavoriteChange={handleFavoriteChange}
                />
              )}
            </div>
          );
        })}
      </div> */}
      <div className="flex flex-col w-full gap-6">
        {rooms.map((room) => {
          const isFavorite = favoriteRoomIds.has(room.id);
          
          // DEBUG: Thêm log này để check
          console.log('Room ID:', room.id, 'isVip:', room.isVip, 'Type:', typeof room.isVip);
          
          return (
            <div key={room.id}>
              {room.isVip ? (
                <FavoriteDashboardRoomVipCard
                  room={room}
                  isFavorite={isFavorite}
                  onFavoriteChange={handleFavoriteChange}
                />
              ) : (
                <FavoriteDashboardRoomCard
                  room={room}
                  isFavorite={isFavorite}
                  onFavoriteChange={handleFavoriteChange}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* <div className="flex items-center justify-center gap-4 py-6">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="px-4 py-2 text-white bg-blue-500 rounded-md disabled:bg-gray-400"
        >
          Trang trước
        </button>
        <span className="text-lg font-semibold">
          Trang {currentPage + 1} / {totalPages || 1}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1 || totalPages === 0}
          className="px-4 py-2 text-white bg-blue-500 rounded-md disabled:bg-gray-400"
        >
          Trang tiếp
        </button>
      </div> */}
      <div className="flex items-center justify-center gap-4 py-6">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium border transition-all duration-200 shadow ${
            currentPage === 0
              ? "text-gray-400 bg-gray-100 cursor-not-allowed pointer-events-none border-gray-200"
              : "text-blue-600 bg-white hover:bg-blue-50 hover:shadow-lg border-blue-300"
          }`}
          aria-disabled={currentPage === 0}
        >
          <BiChevronLeft size={20} />
          <span className="hidden sm:inline">Previous Page</span>
        </button>

        <div className="flex flex-col items-center px-4">
          <span className="text-base font-semibold text-gray-700">
            Page <span className="text-blue-600">{currentPage + 1}</span> /{" "}
            <span className="text-blue-600">{totalPages || 1}</span>
          </span>
          <span className="text-xs text-gray-400">
            {rooms.length} rooms displayed
          </span>
        </div>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage + 1 >= totalPages || totalPages === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium border transition-all duration-200 shadow ${
            currentPage + 1 >= totalPages || totalPages === 0
              ? "text-gray-400 bg-gray-100 cursor-not-allowed pointer-events-none border-gray-200"
              : "text-blue-600 bg-white hover:bg-blue-50 hover:shadow-lg border-blue-300"
          }`}
          aria-disabled={currentPage + 1 >= totalPages || totalPages === 0}
        >
          <span className="hidden sm:inline">Next Page</span>
          <BiChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
