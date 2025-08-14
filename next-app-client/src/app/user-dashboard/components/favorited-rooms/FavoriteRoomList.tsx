"use client";

import { useEffect, useState, useRef } from "react";
import RoomVipCard from "@/app/users/components/rooms/RoomVipCard";
import RoomCard from "@/app/users/components/rooms/RoomCard";

export default function FavoriteRoomList() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Fetch initial data
  useEffect(() => {
    const fetchInitial = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/user-dashboard/favorited-rooms?page=0&size=10`);
        if (!res.ok) throw new Error("Không thể tải danh sách phòng yêu thích.");
        const data = await res.json();
        setRooms(data.content || []);
        setPage(data.pageable?.pageNumber || 0);
        setHasMore(!data.last);
      } catch (e: any) {
        setRooms([]);
        setHasMore(false);
        setError(e.message || "Đã xảy ra lỗi.");
      } finally {
        setLoading(false);
      }
    };
    fetchInitial();
  }, []);

  // Fetch more rooms when scroll to bottom
  const fetchMoreRooms = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    setError(null);
    const nextPage = page + 1;
    try {
      const res = await fetch(`/api/user-dashboard/favorited-rooms?page=${nextPage}&size=10`);
      if (!res.ok) throw new Error("Không thể tải thêm phòng.");
      const data = await res.json();
      setRooms((prev) => [...prev, ...(data.content || [])]);
      setPage(nextPage);
      setHasMore(!data.last);
    } catch (e: any) {
      setHasMore(false);
      setError(e.message || "Đã xảy ra lỗi khi tải thêm phòng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!observerTarget.current || !hasMore || rooms.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          fetchMoreRooms();
        }
      },
      { threshold: 1 }
    );
    observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [loading, hasMore, rooms]);

  return (
    <div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => (
          <div key={room.id}>
            {room.isVip ? <RoomVipCard room={room} /> : <RoomCard room={room} />}
          </div>
        ))}
      </div>
      {hasMore && rooms.length > 0 && (
        <div ref={observerTarget} className="py-4 text-center">
          {loading && <p>Đang tải thêm phòng...</p>}
        </div>
      )}
      {!hasMore && rooms.length > 0 && (
        <p className="py-4 text-center text-gray-500">Bạn đã xem hết danh sách.</p>
      )}
      {rooms.length === 0 && !loading && !error && (
        <p className="py-8 text-center text-gray-500">
          Bạn chưa có phòng trọ yêu thích nào.
        </p>
      )}
      {error && (
        <p className="py-8 text-center text-red-500">{error}</p>
      )}
    </div>
  );
}