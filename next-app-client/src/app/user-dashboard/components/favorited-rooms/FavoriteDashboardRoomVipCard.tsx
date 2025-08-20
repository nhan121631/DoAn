import { URL_IMAGE } from "@/services/Constant";
import { RoomInUser } from "@/types/types";
import Image from "next/image";
import { FaMapMarkerAlt, FaStar } from "react-icons/fa";
import { PiRuler } from "react-icons/pi";
import Link from "next/link";
import RoomCardActions from "@/app/users/components/rooms/RoomCardActions";

interface RoomVipCardProps {
  room: RoomInUser;
  isFavorite: boolean;
  onFavoriteChange?: (id: string) => void;
}

const truncateWords = (text: string, maxWords: number) => {
  const words = text.split(" ");
  if (words.length > maxWords) {
    return words.slice(0, maxWords).join(" ") + "...";
  }
  return text;
};

export default function FavoriteDashboardRoomVipCard({ room, isFavorite, onFavoriteChange }: RoomVipCardProps) {
  const landlordAvatar = room.landlord?.landlordProfile?.avatar
    ? `${URL_IMAGE}/${room.landlord.landlordProfile.avatar}`
    : "/images/useravt.png";

  const truncatedTitle = truncateWords(room.title, 20);

  return (
    <div className="relative flex w-full h-[250px] bg-white rounded-2xl overflow-hidden shadow-lg border border-yellow-500">
      <div className="relative w-1/3 min-w-[250px] h-full flex-shrink-0">
        <Link href={`/detail/${room.id}`}>
          <Image
            src={URL_IMAGE + room.images?.[0]?.url || "/placeholder.jpg"}
            alt={room.title || "Room image"}
            fill
            sizes="100vw"
            className="object-cover transition-transform duration-300 transform hover:scale-110"
          />
        </Link>
        {/* Nút trái tim dùng RoomCardActions, giữ vị trí như cũ */}
        <div className="absolute z-40 top-4 right-4">
          <RoomCardActions
            room={room}
            isFavorite={isFavorite}
            onFavoriteChange={onFavoriteChange}
            showHeartOnly={true}
          />
        </div>
      </div>
      

      <div className="flex flex-col flex-grow p-4">
        <h3 className="text-xl font-bold text-blue-600">{truncatedTitle}</h3>
        <div className="mt-1 text-base font-semibold text-red-500">
          {typeof room.priceMonth === "number"
            ? room.priceMonth.toLocaleString("vi-VN") + " VND"
            : room.priceMonth}
        </div>
        <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 line-clamp-2">
          <FaMapMarkerAlt />
          <span>
            {room.address.street}, {room.address.ward.name}, {room.address.ward.district.name}, {room.address.ward.district.province.name}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
          <PiRuler />
          <span>{room.area} m²</span>
        </div>
        <div className="flex items-center gap-3 pt-4 mt-auto border-t border-gray-200">
          <Image
            src={landlordAvatar}
            alt="Avatar"
            width={40}
            height={40}
            className="rounded-full"
          />
          <div className="flex flex-col">
            <span className="font-semibold text-gray-800">
              {room.landlord.landlordProfile.fullName}
            </span>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <FaStar className="text-sm text-yellow-400" />
              <span className="text-xs font-semibold">4.8</span>
              <span className="text-xs text-gray-400">(12 đánh giá)</span>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button className="px-4 py-2 text-sm font-semibold text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600">
            Compare
          </button>
          <Link href={`/detail/${room.id}`} className="px-4 py-2 text-sm font-semibold text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-100">
            See Detail
          </Link>
        </div>
      </div>

      
    </div>
  );
}