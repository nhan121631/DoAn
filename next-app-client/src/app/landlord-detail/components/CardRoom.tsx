
"use client";
import Image from 'next/image';
import { RoomListing } from '@/app/landlord/types';
import { useState, useEffect } from 'react'; 
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react"; 
import { message } from "antd"; 
import { useFavoriteStore } from '@/stores/FavoriteStore';



interface CardRoomProps {
  rooms: RoomListing[];
  
}

export default function CardRoom({ rooms }: CardRoomProps) {

  const router = useRouter();
  const { data: session } = useSession(); 
  const [loadingFavorite, setLoadingFavorite] = useState<Record<string, boolean>>({});
  const [favoriteCountMap, setFavoriteCountMap] = useState<Record<string, number>>({}); 
  const [messageApi, contextHolder] = message.useMessage(); 

  const { favoriteRoomIds, addFavorite, removeFavorite } = useFavoriteStore();

  useEffect(() => {
    const initialCounts: Record<string, number> = {};
    rooms.forEach(room => {
      initialCounts[room.id] = room.favoriteCount || 0;
    });
    setFavoriteCountMap(initialCounts);
  }, [rooms]);

  const handleFavorite = async (roomId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!session) {
      router.push("/auth/login");
      return;
    }

    const isFavorite = favoriteRoomIds.has(roomId);
    setLoadingFavorite(prev => ({ ...prev, [roomId]: true }));

    try {
      const res = await fetch(`/api/favorites/rooms/${roomId}`, {
        method: isFavorite ? "DELETE" : "POST",
      });

      if (res.ok) {
        if (isFavorite) {
          removeFavorite(roomId);
          setFavoriteCountMap(prev => ({
            ...prev,
            [roomId]: Math.max(0, (prev[roomId] || 1) - 1)
          }));
          messageApi.success("Removed from favorites");
        } else {
          addFavorite(roomId);
          setFavoriteCountMap(prev => ({
            ...prev,
            [roomId]: (prev[roomId] || 0) + 1
          }));
          messageApi.success("Added to favorites");
        }
      } else {
        throw new Error("Failed to update favorite status");
      }
    } catch (error) {
      console.error("Error updating favorite status:", error);
      messageApi.error("Failed to update favorite status");
    } finally {
      setLoadingFavorite(prev => ({ ...prev, [roomId]: false }));
    }
  };

  const handleRoomClick = (roomId: string) => {
    router.push(`/detail/${roomId}`);
  };

  return (
    <>
      {contextHolder}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            All Posts ({rooms.length})
          </h2>
          <div className="flex space-x-2">
            {/* <button className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg">
              For Sale (0)
            </button> */}
            <button className="px-4 py-2 text-sm text-white bg-gray-900 rounded-lg">
              For Rent ({rooms.length})
            </button>
          </div>
        </div>

        {rooms.length > 0 ? (
          <div className="flex flex-wrap gap-6">
            {rooms.map((room) => {
              const isFavorite = favoriteRoomIds.has(room.id);
              const isLoadingFav = loadingFavorite[room.id] || false;
              const favoriteCount = favoriteCountMap[room.id] || room.favoriteCount || 0;

              return (
                <div 
                  key={room.id} 
                  className="flex-none w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] overflow-hidden transition-all duration-300 bg-white shadow-lg cursor-pointer rounded-2xl hover:shadow-xl group"
                  onClick={() => handleRoomClick(room.id)}
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
                  
<div className="flex flex-col h-auto p-5">
  <h3 className="h-12 mb-2 font-bold text-gray-900 transition-colors line-clamp-2 group-hover:text-blue-600">
    {room.title}
  </h3>
  
  <div className="mb-2 text-lg font-bold text-red-600 h-7">
    {room.price.toLocaleString('vi-VN')}đ/month
    <span className="ml-2 text-sm font-normal text-gray-500">• {room.area}m²</span>
  </div>

  <div className="flex items-center h-5 mb-3 text-sm text-gray-600">
    <svg className="flex-shrink-0 w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
    </svg>
    <span className="line-clamp-1">{room.address}</span>
  </div>

  <div className="flex items-center pt-3 mt-auto border-t border-gray-100">
    <button
      onClick={(e) => {
        e.stopPropagation();
        handleRoomClick(room.id);
      }}
      className="flex-1 h-10 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 hover:scale-105"
    >
      View Details
    </button>
    <div className="flex items-center px-3 py-1 ml-3 bg-white border border-red-200 rounded-full shadow-sm">
    <button
      onClick={(e) => handleFavorite(room.id, e)}
      disabled={isLoadingFav}
      className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 ${
        isFavorite 
          ? "text-red-500" 
          : "text-gray-300 hover:text-red-400"
      } ${
        isLoadingFav 
          ? "opacity-60 cursor-not-allowed" 
          : "hover:bg-white/20 hover:scale-110"
      }`}
      title={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      <svg 
        className="w-5 h-5" 
        fill="currentColor" 
        viewBox="0 0 20 20"
      >
        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
      </svg>
    </button>
    <span className="ml-1 text-base font-bold text-blue-500">{favoriteCount}</span>
  </div>
  </div>
</div>

                  
                </div>
                
                
              );
            })}






          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <h3 className="mb-2 text-lg font-semibold text-gray-900">No listings available</h3>
          </div>
        )}
      </div>
    </>
  );
}

