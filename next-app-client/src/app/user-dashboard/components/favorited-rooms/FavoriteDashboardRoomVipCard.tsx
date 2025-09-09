// import { URL_IMAGE } from "@/services/Constant";
// import { RoomInUser } from "@/types/types";
// import Image from "next/image";
// // import { FaMapMarkerAlt } from "react-icons/fa";
// // import { PiRuler } from "react-icons/pi";
// // import RoomCardActions from "@/app/users/components/rooms/RoomCardActions";
// import Link from "next/link";
// import { ButtonForVipCard } from "@/app/users/components/rooms/ButtonForVipCard";

// interface RoomVipCardProps {
//   room: RoomInUser;
//   isFavorite: boolean;
//   onFavoriteChange?: (id: string) => void;
// }

// const maxShowConveniences = 2;
// const truncateWords = (text: string, maxWords: number) => {
//   const words = text.split(" ");
//   if (words.length > maxWords) {
//     return words.slice(0, maxWords).join(" ") + "...";
//   }
//   return text;
// };

// export default function FavoriteDashboardRoomVipCard({ room, isFavorite, onFavoriteChange }: RoomVipCardProps) {
//   const landlordAvatar = room.landlord?.landlordProfile?.avatar
//     ? `${URL_IMAGE}/${room.landlord.landlordProfile.avatar}`
//     : "/images/useravt.png";

//   const truncatedTitle = truncateWords(room.title, 20);
//   const conveniences =
//     (room.conveniences || []).map((c: { name: string } | string) =>
//   typeof c === "string" ? c : c.name
// ) || [];
//   const showConveniences = conveniences.slice(0, maxShowConveniences);
//   const moreCount = conveniences.length - maxShowConveniences;

//   return (
//     <div className="relative flex w-full h-[250px] bg-white rounded-2xl overflow-hidden shadow-lg border border-yellow-500 hover:shadow-yellow-200 hover:-translate-y-1 hover:scale-[1.015] transition-all duration-300">
//       {/* IMAGE SECTION */}
//       <div className="relative w-1/3 min-w-[250px] h-full flex-shrink-0">
//         <Link href={`/detail/${room.id}`}>
//           <Image
//             src={
//               room.images?.[0]?.url
//                 ? URL_IMAGE + room.images[0].url
//                 : "/images/room-placeholder.jpg"
//             }
//             alt={room.title || "Room image"}
//             fill
//             sizes="100vw"
//             className="object-cover transition-transform duration-300 transform hover:scale-110"
//             priority
//           />
//         </Link>
//         <div className="absolute z-40 top-4 right-4">
//           <ButtonForVipCard
//             room={room}
//             isFavorite={isFavorite}
//             onFavoriteChange={onFavoriteChange}
//             showHeartOnly={true}
//           />
//         </div>
//       </div>

//       {/* CONTENT SECTION */}
//       <div className="flex flex-col flex-grow p-4">
//         <div className="flex flex-wrap items-center gap-2 mb-1">
//           {/* <span className="text-xl font-bold text-yellow-400 drop-shadow">
//             ★★★★★
//           </span> */}
//           <span
//             className="text-xl font-extrabold text-yellow-700 uppercase break-words transition-colors duration-200 group-hover:text-yellow-600 line-clamp-2 text-ellipsis"
//             style={{
//               display: "-webkit-box",
//               WebkitLineClamp: 2,
//               WebkitBoxOrient: "vertical",
//               overflow: "hidden",
//               textOverflow: "ellipsis",
//               whiteSpace: "normal",
//               wordBreak: "break-word",
//               maxHeight: "3.2em",
//             }}
//             title={room.title}
//           >
//             {truncatedTitle}
//           </span>
//         </div>

//         <div className="flex flex-wrap items-center max-w-full gap-4 mb-2 text-base font-semibold text-red-700">
//           <span className="truncate max-w-[120px] text-lg font-bold">
//             {typeof room.priceMonth === "number"
//               ? room.priceMonth.toLocaleString("vi-VN") + "đ"
//               : room.priceMonth}
//           </span>
//           <span className="text-gray-700 font-normal truncate max-w-[80px]">
//             • {room.area}m²
//           </span>
//           <span className="text-blue-600 font-normal truncate max-w-[220px] underline underline-offset-2 cursor-pointer transition-colors duration-150">
//             • {room.address.street}, {room.address.ward.name},{" "}
//             {room.address.ward.district.name},{" "}
//             {room.address.ward.district.province.name}
//           </span>
//         </div>

//         {/* Conveniences (Tiện ích) */}
//         {conveniences.length > 0 && (
//           <div className="flex flex-wrap items-center gap-2 mb-2">
//             {showConveniences.map((item: string, idx: number) => (
//               <span
//                 key={idx}
//                 className="inline-flex items-center px-2.5 py-1 border border-yellow-300 bg-yellow-50 text-yellow-700 text-xs font-semibold rounded-lg shadow-sm hover:bg-yellow-100 transition-all duration-200 cursor-default"
//                 title={item}
//                 style={{
//                   minWidth: 60,
//                   justifyContent: "center",
//                   letterSpacing: 0.2,
//                 }}
//               >
//                 <svg
//                   width="14"
//                   height="14"
//                   viewBox="0 0 20 20"
//                   fill="none"
//                   className="mr-1 text-yellow-400"
//                   style={{ minWidth: 14 }}
//                 >
//                   <circle cx="10" cy="10" r="8" fill="#fde68a" opacity="0.2" />
//                   <circle cx="10" cy="10" r="4" fill="#fde68a" />
//                 </svg>
//                 {item}
//               </span>
//             ))}
//             {moreCount > 0 && (
//               <span
//                 className="inline-flex items-center px-2.5 py-1 border border-gray-300 bg-white text-gray-700 text-xs font-semibold rounded-lg shadow-sm cursor-pointer hover:bg-gray-100 transition-all duration-200"
//                 title={conveniences.slice(maxShowConveniences).join(", ")}
//                 style={{ minWidth: 40, justifyContent: "center" }}
//               >
//                 +{moreCount}
//               </span>
//             )}
//           </div>
//         )}

//         <div className="flex items-center justify-between gap-3 pt-4 mt-auto border-t border-gray-200">
//           <div className="flex items-center gap-3">
//             <Image
//               src={landlordAvatar}
//               alt="Avatar"
//               width={40}
//               height={40}
//               className="rounded-full"
//             />
//             <span className="font-semibold text-gray-800">
//               {room.landlord.landlordProfile.fullName}
//             </span>
//           </div>
//           <div className="flex items-center gap-2">
//             <button className="px-4 py-2 text-sm font-semibold text-white transition-colors bg-yellow-500 rounded-lg hover:bg-yellow-600">
//               Compare
//             </button>
//             <Link
//               href={`/detail/${room.id}`}
//               className="px-4 py-2 text-sm font-semibold text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
//             >
//               See Detail
//             </Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



"use client";

import Image from "next/image";
import React from "react";
import { motion } from "framer-motion";
import { URL_IMAGE } from "@/services/Constant";
import { RoomInUser } from "@/types/types";
import Link from "next/link";
import RoomCardActions from "@/app/users/components/rooms/RoomCardActions";
import { AiFillCrown } from "react-icons/ai";

export interface RoomCardProps {
  room: RoomInUser;
  isFavorite?: boolean;
  onFavoriteChange?: (id: string) => void;
}

const maxShowConveniences = 2;

const FavoriteDashboardRoomVipCard: React.FC<RoomCardProps> = ({
  room,
  isFavorite,
  onFavoriteChange,
}) => {
  const landlordAvatar = room.landlord?.landlordProfile?.avatar
    ? `${URL_IMAGE}/${room.landlord.landlordProfile.avatar}`
    : "/images/useravt.png";

  const conveniences =
    (room.conveniences || []).map((c: { name: string } | string) =>
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
      className="relative flex w-full h-[280px] bg-gradient-to-br from-yellow-50 via-white to-amber-50 rounded-3xl overflow-hidden shadow-xl border-2 border-yellow-400 hover:shadow-yellow-300/50 hover:-translate-y-2 hover:scale-[1.015] transition-all duration-500"
    >
      {/* VIP Crown Badge */}
      <div className="absolute z-30 flex items-center gap-2 px-3 py-2 text-sm font-bold text-white rounded-full shadow-lg top-4 left-4 bg-gradient-to-r from-yellow-400 to-amber-500">
        <AiFillCrown className="w-4 h-4" />
        <span>VIP</span>
      </div>

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

      {/* {room.postType === "Post VIP" && (
  <div className="absolute z-20 top-2 left-2 sm:top-3 sm:left-3">
    <span className="flex items-center gap-1 px-2 py-1 text-xs font-bold text-white rounded-full shadow-lg bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 sm:px-3 sm:py-1 animate-pulse">
      ⭐ VIP
    </span>
  </div>
)} */}

      {/* CONTENT SECTION */}
      <div className="flex flex-col flex-grow p-4">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          {/* <span className="text-xl font-bold text-yellow-400 drop-shadow">
            ★★★★★
          </span> */}
          <span
            className="text-xl font-extrabold text-yellow-700 uppercase break-words transition-colors duration-200 group-hover:text-yellow-600 line-clamp-2 text-ellipsis"
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
          <span className="truncate max-w-[120px] text-lg font-bold text-yellow-600">
            {typeof room.priceMonth === "number"
              ? room.priceMonth.toLocaleString("vi-VN") + "đ"
              : room.priceMonth}
          </span>
          <span className="text-gray-700 font-normal truncate max-w-[80px]">
            • {room.area}m²
          </span>
          <span className="text-yellow-600 font-normal truncate max-w-[220px] underline underline-offset-2 cursor-pointer transition-colors duration-150">
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
                className="inline-flex items-center px-2.5 py-1 border border-yellow-300 bg-yellow-50 text-yellow-700 text-xs font-semibold rounded-lg shadow-sm hover:bg-yellow-100 transition-all duration-200 cursor-default"
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
                  className="mr-1 text-yellow-400"
                  style={{ minWidth: 14 }}
                >
                  <circle cx="10" cy="10" r="8" fill="#fbbf24" opacity="0.2" />
                  <circle cx="10" cy="10" r="4" fill="#fbbf24" />
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

        <div className="flex items-center justify-between gap-3 pt-4 mt-auto border-t border-yellow-200">
          <div className="flex items-center gap-3">
            <Image
              src={landlordAvatar}
              alt="Avatar"
              width={40}
              height={40}
              className="border-2 border-yellow-300 rounded-full"
            />
            <div>
              <span className="font-semibold text-gray-800">
                {room.landlord.landlordProfile.fullName}
              </span>
              <div className="text-xs font-medium text-yellow-600">VIP Host</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 text-sm font-semibold text-white transition-colors rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600">
              Compare
            </button>
            <Link
              href={`/detail/${room.id}`}
              className="px-4 py-2 text-sm font-semibold text-yellow-700 transition-colors border border-yellow-300 rounded-lg bg-yellow-50 hover:bg-yellow-100"
            >
              See Detail
            </Link>
          </div>
        </div>
      </div>

      {/* Premium corner glow */}
      <div className="absolute bottom-0 right-0 w-16 h-16 rounded-tl-full bg-gradient-to-tl from-yellow-400/20 to-transparent"></div>
    </motion.div>
  );
};

export default FavoriteDashboardRoomVipCard;