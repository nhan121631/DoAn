// "use client";

// import { useEffect, useState, useRef } from 'react';
// import { FavoriteRoomProjection } from '@/dtos/favorite/FavoriteRoomProjection';
// import RoomVipCard from '@/app/users/components/rooms/RoomVipCard';
// import RoomCard from '@/app/users/components/rooms/RoomCard';

// interface FavoriteRoomListProps {
//   initialData: {
//     content: FavoriteRoomProjection[];
//     pageable: {
//       pageNumber: number;
//       pageSize: number;
//       // ... các thông tin phân trang khác
//     };
//     totalPages: number;
//     totalElements: number;
//     last: boolean;
//   };
// }

// export default function FavoriteRoomList({ initialData }: FavoriteRoomListProps) {
//   const [rooms, setRooms] = useState<FavoriteRoomProjection[]>(initialData.content);
//   const [page, setPage] = useState(initialData.pageable.pageNumber);
//   const [loading, setLoading] = useState(false);
//   const [hasMore, setHasMore] = useState(!initialData.last);
//   const observerTarget = useRef(null);

//   const fetchMoreRooms = async () => {
//     if (loading || !hasMore) return;

//     setLoading(true);
//     const nextPage = page + 1;
    
//     try {
//       const response = await fetch(`/api/favorites?page=${nextPage}&size=10`);
//       if (!response.ok) {
//         throw new Error('Failed to fetch more rooms.');
//       }
//       const data = await response.json();
      
//       setRooms((prevRooms) => [...prevRooms, ...data.content]);
//       setPage(nextPage);
//       setHasMore(!data.last);

//     } catch (error) {
//       console.error("Lỗi khi tải thêm phòng:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (!observerTarget.current || !hasMore) return;

//     const observer = new IntersectionObserver(
//       (entries) => {
//         if (entries[0].isIntersecting && !loading && hasMore) {
//           fetchMoreRooms();
//         }
//       },
//       { threshold: 1 }
//     );

//     observer.observe(observerTarget.current);

//     return () => {
//       observer.disconnect();
//     };
//   }, [loading, hasMore, fetchMoreRooms]);

//   return (
//     <div>
//       <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
//         {rooms.map((room) => (
//           <div key={room.id}>
//             {/* Sử dụng điều kiện để hiển thị loại card phù hợp */}
//             {/* Giả định có một trường isVip để phân biệt */}
//             {room.isVip ? (
//               <RoomVipCard room={room} />
//             ) : (
//               <RoomCard room={room} />
//             )}
//           </div>
//         ))}
//       </div>

//       {/* Target cho Intersection Observer */}
//       {hasMore && (
//         <div ref={observerTarget} className="py-4 text-center">
//           {loading && <p>Đang tải thêm phòng...</p>}
//         </div>
//       )}

//       {!hasMore && rooms.length > 0 && (
//         <p className="py-4 text-center text-gray-500">Bạn đã xem hết danh sách.</p>
//       )}

//       {rooms.length === 0 && !loading && (
//         <p className="py-8 text-center text-gray-500">
//           Bạn chưa có phòng trọ yêu thích nào.
//         </p>
//       )}
//     </div>
//   );
// }