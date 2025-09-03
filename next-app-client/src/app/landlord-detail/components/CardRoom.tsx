"use client";
import Image from 'next/image';
import { RoomListing } from '@/app/landlord/types';

interface CardRoomProps {
  rooms: RoomListing[];
}

export default function CardRoom({ rooms }: CardRoomProps) {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Tất cả bài đăng ({rooms.length})
        </h2>
        <div className="flex space-x-2">
          <button className="px-4 py-2 text-sm text-white bg-gray-900 rounded-lg">
            Tin đăng ({rooms.length})
          </button>
        </div>
      </div>

      {rooms.length > 0 ? (
        <div className="flex flex-wrap gap-6">
          {rooms.map((room) => (
            <div 
              key={room.id} 
              className="flex-none w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] overflow-hidden transition-all duration-300 bg-white shadow-lg cursor-pointer rounded-2xl hover:shadow-xl group"
            >
              <div className="relative h-48">
                {room.imageUrl ? (
                  <Image
                    src={`https://res.cloudinary.com${room.imageUrl}`}
                    alt={room.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-gray-200 to-gray-300">
                    <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="p-5">
                <h3 className="mb-2 font-bold text-gray-900 transition-colors line-clamp-2 group-hover:text-blue-600">
                  {room.title}
                </h3>
                
                <div className="mb-2 text-lg font-bold text-red-600">
                  {room.price.toLocaleString('vi-VN')}đ/tháng
                  <span className="ml-2 text-sm font-normal text-gray-500">• {room.area}m²</span>
                </div>

                <div className="flex items-center mb-3 text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span className="line-clamp-1">{room.address}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex items-center justify-center w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6" />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">Chưa có tin đăng</h3>
        </div>
      )}
    </div>
  );
}

// "use client";
// import Image from 'next/image';
// import { RoomListing } from '@/app/landlord/types';
// import { useState } from 'react';

// interface CardRoomProps {
//   rooms: RoomListing[];
// }

// export default function CardRoom({ rooms }: CardRoomProps) {
//   const [favoriteRooms, setFavoriteRooms] = useState<Set<string>>(new Set());

//   const toggleFavorite = (roomId: string, e: React.MouseEvent) => {
//     e.stopPropagation(); // Ngăn không cho click vào card
//     setFavoriteRooms(prev => {
//       const newFavorites = new Set(prev);
//       if (newFavorites.has(roomId)) {
//         newFavorites.delete(roomId);
//       } else {
//         newFavorites.add(roomId);
//       }
//       return newFavorites;
//     });
//   };

//   return (
//     <div>
//       {/* Header */}
//       <div className="flex items-center justify-between mb-6">
//         <h2 className="text-2xl font-bold text-gray-900">
//           Tất cả bài đăng ({rooms.length})
//         </h2>
//         <div className="flex space-x-2">
//           <button className="px-4 py-2 text-sm text-white bg-gray-900 rounded-lg">
//             Tin đăng ({rooms.length})
//           </button>
//         </div>
//       </div>

//       {rooms.length > 0 ? (
//         <div className="flex flex-wrap gap-6">
//           {rooms.map((room) => (
//             <div 
//               key={room.id} 
//               className="flex-none w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] overflow-hidden transition-all duration-300 bg-white shadow-lg cursor-pointer rounded-2xl hover:shadow-xl group"
//             >
//               <div className="relative h-48">
//                 {room.imageUrl ? (
//                   <Image
//                     src={`https://res.cloudinary.com${room.imageUrl}`}
//                     alt={room.title}
//                     fill
//                     className="object-cover transition-transform duration-300 group-hover:scale-105"
//                   />
//                 ) : (
//                   <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-gray-200 to-gray-300">
//                     <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
//                     </svg>
//                   </div>
//                 )}

//                 {/* Heart Icon - Favorite Button */}
//                 <button
//                   onClick={(e) => toggleFavorite(room.id, e)}
//                   className="absolute flex items-center justify-center w-10 h-10 transition-all duration-200 rounded-full top-3 right-3 bg-black/50 hover:bg-black/70 backdrop-blur-sm group/heart"
//                 >
//                   {favoriteRooms.has(room.id) ? (
//                     // Filled heart (favorited)
//                     <svg 
//                       className="w-5 h-5 text-red-500 transition-transform duration-200 group-hover/heart:scale-110" 
//                       fill="currentColor" 
//                       viewBox="0 0 20 20"
//                     >
//                       <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
//                     </svg>
//                   ) : (
//                     // Empty heart (not favorited)
//                     <svg 
//                       className="w-5 h-5 text-white transition-transform duration-200 group-hover/heart:scale-110" 
//                       fill="none" 
//                       stroke="currentColor" 
//                       viewBox="0 0 24 24"
//                     >
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
//                     </svg>
//                   )}
//                 </button>

//                 {/* Count indicator (optional) */}
//                 {/* <div className="absolute px-2 py-1 text-xs text-white rounded-full top-3 left-3 bg-black/60 backdrop-blur-sm">
//                   📷 1+
//                 </div> */}
//               </div>

//               <div className="p-5">
//                 <h3 className="mb-2 font-bold text-gray-900 transition-colors line-clamp-2 group-hover:text-blue-600">
//                   {room.title}
//                 </h3>
                
//                 <div className="mb-2 text-lg font-bold text-red-600">
//                   {room.price.toLocaleString('vi-VN')}đ/tháng
//                   <span className="ml-2 text-sm font-normal text-gray-500">• {room.area}m²</span>
//                 </div>

//                 <div className="flex items-center mb-3 text-sm text-gray-600">
//                   <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
//                   </svg>
//                   <span className="line-clamp-1">{room.address}</span>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       ) : (
//         <div className="flex flex-col items-center justify-center py-12 text-center">
//           <div className="flex items-center justify-center w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full">
//             <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6" />
//             </svg>
//           </div>
//           <h3 className="mb-2 text-lg font-semibold text-gray-900">Chưa có tin đăng</h3>
//         </div>
//       )}
//     </div>
//   );
// }


