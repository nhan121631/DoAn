// export default function FavoritedRoomsPage() {
//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
//       <h1 className="mb-4 text-2xl font-bold">Favorited Rooms</h1>
//       <p className="text-gray-600">
//         This page will display the rooms you have favorited.
//       </p>
//     </div>
//   );
// }




// // Đây là Server Component, không có "use client";
// import FavoriteRoomList from "../components/favorited-rooms/FavoriteRoomList";
// import { getServerSession } from "next-auth/next"; // getServerSession vẫn đúng chỗ này
// import { authOptions } from "@/lib/auth"; 
// import { Session } from "next-auth"; // Sửa: Import Session từ 'next-auth'

// // Thêm một interface tạm thời để ép kiểu
// interface MySession extends Session {
//   accessToken?: string;
// }

// const fetchInitialFavorites = async (page = 0, size = 10) => {
//   const session = await getServerSession(authOptions) as MySession;

//   if (!session || !session.accessToken) {
//     return {
//       content: [],
//       pageable: { pageNumber: 0, pageSize: 10 },
//       totalPages: 0,
//       totalElements: 0,
//       last: true,
//     };
//   }

//   const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/favorites?page=${page}&size=${size}`, {
//     method: "GET",
//     headers: {
//       "Content-Type": "application/json",
//       "Authorization": `Bearer ${session.accessToken}`,
//     },
//     cache: 'no-store',
//   });

//   if (!response.ok) {
//     throw new Error('Failed to fetch initial favorite rooms.');
//   }

//   return response.json();
// };

// export default async function FavoritedRoomsPage() {
//   let initialData;
//   try {
//     initialData = await fetchInitialFavorites();
//   } catch (error) {
//     console.error("Failed to fetch initial data:", error);
//     initialData = {
//       content: [],
//       pageable: { pageNumber: 0, pageSize: 10 },
//       totalPages: 0,
//       totalElements: 0,
//       last: true,
//     };
//   }

//   return (
//     <main className="container px-4 py-8 mx-auto">
//       <h1 className="mb-6 text-3xl font-bold">Phòng trọ yêu thích</h1>
//       <p className="mb-8 text-gray-600">
//         Đây là danh sách các phòng trọ bạn đã lưu.
//       </p>
//       <FavoriteRoomList initialData={initialData} />
//     </main>
//   );
// }