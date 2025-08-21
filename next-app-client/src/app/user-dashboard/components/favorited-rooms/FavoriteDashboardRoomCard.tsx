// import Image from "next/image";
// import React from "react";
// import { URL_IMAGE } from "@/services/Constant";
// import { RoomInUser } from "@/types/types";
// import { FaMapMarkerAlt, FaStar } from "react-icons/fa";
// import { PiRuler } from "react-icons/pi";
// import Link from "next/link";
// import RoomCardActions from "@/app/users/components/rooms/RoomCardActions";

// export interface RoomCardProps {
//   room: RoomInUser;
//   isFavorite?: boolean;
//   onFavoriteChange?: (id: string) => void;
// }

// // Hàm tiện ích để giới hạn số từ và thêm dấu ba chấm
// const truncateWords = (text: string, maxWords: number) => {
//   const words = text.split(" ");
//   if (words.length > maxWords) {
//     return words.slice(0, maxWords).join(" ") + "...";
//   }
//   return text;
// };

// const FavoriteDashboardRoomCard: React.FC<RoomCardProps> = ({ room, isFavorite, onFavoriteChange }) => {
//   const landlordAvatar = room.landlord?.landlordProfile?.avatar
//     ? `${URL_IMAGE}/${room.landlord.landlordProfile.avatar}`
//     : "/images/useravt.png";

//   const truncatedTitle = truncateWords(room.title, 20);

//   return (
//     <div className="relative flex w-full h-[250px] bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-200">
//       <div className="relative w-1/3 min-w-[250px] h-full flex-shrink-0">
//         <Link href={`/detail/${room.id}`}>
//           <Image
//             src={URL_IMAGE + room.images?.[0]?.url || "/images/room-placeholder.jpg"}
//             alt={room.title || "Room image"}
//             fill
//             sizes="100vw"
//             className="object-cover transition-transform duration-300 transform hover:scale-110"
//           />
//         </Link>
//         {/* Nút trái tim dùng RoomCardActions, giữ vị trí như cũ */}
//         <div className="absolute z-40 top-4 right-4">
//           <RoomCardActions
//             room={room}
//             isFavorite={isFavorite}
//             onFavoriteChange={onFavoriteChange}
//             showHeartOnly={true}
//           />
//         </div>
//       </div>

//       <div className="flex flex-col flex-grow p-4">
//         <h3 className="text-xl font-bold text-blue-600">{truncatedTitle}</h3>
//         <div className="mt-1 text-base font-semibold text-red-500">
//           {typeof room.priceMonth === "number"
//             ? room.priceMonth.toLocaleString("vi-VN") + " VND"
//             : room.priceMonth}
//         </div>
//         <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 line-clamp-2">
//           <FaMapMarkerAlt />
//           <span>
//             {room.address.street}, {room.address.ward.name}, {room.address.ward.district.name}, {room.address.ward.district.province.name}
//           </span>
//         </div>
//         <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
//           <PiRuler />
//           <span>{room.area} m²</span>
//         </div>
//         <div className="flex items-center gap-3 pt-4 mt-auto border-t border-gray-200">
//           <Image
//             src={landlordAvatar}
//             alt="Avatar"
//             width={40}
//             height={40}
//             className="rounded-full"
//           />
//           <div className="flex flex-col">
//             <span className="font-semibold text-gray-800">
//               {room.landlord.landlordProfile.fullName}
//             </span>
//             <div className="flex items-center gap-1 text-sm text-gray-500">
//               <FaStar className="text-sm text-yellow-400" />
//               <span className="text-xs font-semibold">4.8</span>
//               <span className="text-xs text-gray-400">(12 đánh giá)</span>
//             </div>
//           </div>
//         </div>
//         <div className="flex justify-end gap-2 mt-4">
//           <button className="px-4 py-2 text-sm font-semibold text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600">
//             Compare
//           </button>
//           <Link href={`/detail/${room.id}`} className="px-4 py-2 text-sm font-semibold text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-100">
//             See Detail
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default FavoriteDashboardRoomCard;



//-----------------------
import Image from "next/image";
import React from "react";
import { motion } from "framer-motion";
import { URL_IMAGE } from "@/services/Constant";
import { RoomInUser } from "@/types/types";
// import { FaMapMarkerAlt } from "react-icons/fa";
// import { PiRuler } from "react-icons/pi";
import Link from "next/link";
import RoomCardActions from "@/app/users/components/rooms/RoomCardActions";

export interface RoomCardProps {
  room: RoomInUser;
  isFavorite?: boolean;
  onFavoriteChange?: (id: string) => void;
}

const maxShowConveniences = 2;
// ...existing imports...

const FavoriteDashboardRoomCard: React.FC<RoomCardProps> = ({
  room,
  isFavorite,
  onFavoriteChange,
}) => {
  const landlordAvatar = room.landlord?.landlordProfile?.avatar
    ? `${URL_IMAGE}/${room.landlord.landlordProfile.avatar}`
    : "/images/useravt.png";

  const conveniences =
    (room.conveniences || []).map((c: any) =>
      typeof c === "string" ? c : c.name
    ) || [];
  const showConveniences = conveniences.slice(0, maxShowConveniences);
  const moreCount = conveniences.length - maxShowConveniences;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ amount: 0.15 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="relative flex w-full h-[250px] bg-white rounded-2xl overflow-hidden shadow-lg border border-green-400 hover:shadow-green-200 hover:-translate-y-1 hover:scale-[1.015] transition-all duration-300"
    >
      {/* IMAGE SECTION */}
      <div className="relative w-1/3 min-w-[250px] h-full flex-shrink-0">
        <Link href={`/detail/${room.id}`}>
          <Image
            src={
              room.images?.[0]?.url
                ? URL_IMAGE + room.images[0].url
                : "/images/room-placeholder.jpg"
            }
            alt={room.title || "Room image"}
            fill
            sizes="100vw"
            className="object-cover transition-transform duration-300 transform hover:scale-110"
            priority
          />
        </Link>
        <div className="absolute z-40 top-4 right-4">
          <RoomCardActions
            room={room}
            isFavorite={isFavorite}
            onFavoriteChange={onFavoriteChange}
            showHeartOnly={true}
          />
        </div>
      </div>

      {/* CONTENT SECTION */}
      <div className="flex flex-col flex-grow p-4">
        {/* Tên phòng + sao */}
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="text-xl font-bold text-yellow-400 drop-shadow">
            ★★★★★
          </span>
          <span
            className="text-xl font-extrabold text-green-700 uppercase break-words transition-colors duration-200 group-hover:text-emerald-600 line-clamp-2 text-ellipsis"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "normal",
              wordBreak: "break-word",
              maxHeight: "3.2em",
            }}
            title={room.title}
          >
            {room.title}
          </span>
        </div>

        {/* Giá - Diện tích - Địa chỉ */}
        <div className="flex flex-wrap items-center max-w-full gap-4 mb-2 text-base font-semibold text-red-700">
          <span className="truncate max-w-[120px] text-lg font-bold">
            {typeof room.priceMonth === "number"
              ? room.priceMonth.toLocaleString("vi-VN") + "đ"
              : room.priceMonth}
          </span>
          <span className="text-gray-700 font-normal truncate max-w-[80px]">
            • {room.area}m²
          </span>
          <span className="text-blue-600 font-normal truncate max-w-[220px] underline underline-offset-2 cursor-pointer transition-colors duration-150">
            • {room.address.street}, {room.address.ward.name},{" "}
            {room.address.ward.district.name},{" "}
            {room.address.ward.district.province.name}
          </span>
        </div>

        {/* Conveniences (Tiện ích) */}
        {conveniences.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {showConveniences.map((item: string, idx: number) => (
              <span
                key={idx}
                className="inline-flex items-center px-2.5 py-1 border border-emerald-300 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg shadow-sm hover:bg-emerald-100 transition-all duration-200 cursor-default"
                title={item}
                style={{
                  minWidth: 60,
                  justifyContent: "center",
                  letterSpacing: 0.2,
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 20 20"
                  fill="none"
                  className="mr-1 text-emerald-400"
                  style={{ minWidth: 14 }}
                >
                  <circle cx="10" cy="10" r="8" fill="#34d399" opacity="0.2" />
                  <circle cx="10" cy="10" r="4" fill="#34d399" />
                </svg>
                {item}
              </span>
            ))}
            {moreCount > 0 && (
              <span
                className="inline-flex items-center px-2.5 py-1 border border-gray-300 bg-white text-gray-700 text-xs font-semibold rounded-lg shadow-sm cursor-pointer hover:bg-gray-100 transition-all duration-200"
                title={conveniences.slice(maxShowConveniences).join(", ")}
                style={{ minWidth: 40, justifyContent: "center" }}
              >
                +{moreCount}
              </span>
            )}
          </div>
        )}

        {/* Thông tin người đăng + Nút Compare + See Detail */}
        <div className="flex items-center justify-between gap-3 pt-4 mt-auto border-t border-gray-200">
  {/* Chủ trọ bên trái */}
  <div className="flex items-center gap-3">
    <Image
      src={landlordAvatar}
      alt="Avatar"
      width={40}
      height={40}
      className="rounded-full"
    />
    <span className="font-semibold text-gray-800">
      {room.landlord.landlordProfile.fullName}
    </span>
  </div>
  {/* Nút bên phải */}
  <div className="flex items-center gap-2">
    <button className="px-4 py-2 text-sm font-semibold text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600">
      Compare
    </button>
    <Link
      href={`/detail/${room.id}`}
      className="px-4 py-2 text-sm font-semibold text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
    >
      See Detail
    </Link>
  </div>
</div>
      </div>
    </motion.div>
  );
};

export default FavoriteDashboardRoomCard;






