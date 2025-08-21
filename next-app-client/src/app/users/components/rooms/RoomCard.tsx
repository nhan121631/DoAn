// 'use client';

// import Image from "next/image";
// import React from "react";
// import { motion } from "framer-motion";
// import { URL_IMAGE } from "@/services/Constant";
// import { RoomInUser } from "@/types/types";
// import { FaMapMarkerAlt } from "react-icons/fa";
// import { PiRuler } from "react-icons/pi";
// import RoomCardActions from "./RoomCardActions";

// export interface RoomCardProps {
//   room: RoomInUser;
//   isForSale?: boolean;
//   isFeatured?: boolean;
//   isFavorite?: boolean;
//   onFavoriteChange?: (id: string) => void;
//   custom?: number; // for staggered animation
// }

// const RoomCard: React.FC<RoomCardProps> = ({
//   room,
//   isForSale = false,
//   isFeatured = false,
//   isFavorite = false,
//   onFavoriteChange,
//   custom = 0,
// }) => {
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 18 }}
//       whileInView={{ opacity: 1, y: 0 }}
//       viewport={{ amount: 0.15 }} // once: true để chỉ chạy một lần khi vào view
//       transition={{ duration: 0.7, ease: "easeOut", delay: custom * 0.19 }}
//       className="rounded-2xl overflow-hidden shadow-lg bg-white relative group w-[320px] h-[370px] border border-gray-100 hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.015] transition-all duration-300 cursor-pointer focus-within:ring-2 focus-within:ring-amber-400"
//       style={{ willChange: "transform, box-shadow, border-color, background" }}
//       custom={custom}
//     >
//     <div className="rounded-2xl overflow-hidden shadow-lg bg-white relative group w-[300px] h-[300px]">
//       {/* Overlay hover effect */}
//       <div className="absolute inset-0 z-20 transition-opacity duration-300 opacity-0 pointer-events-none bg-black/10 group-hover:opacity-100" />
//       {/* Button hover center */}
//       <div className="absolute z-40 transition-all duration-300 -translate-x-1/2 -translate-y-1/2 opacity-0 left-1/2 top-1/2 group-hover:opacity-100">
//         {/* <RoomCartActions room={room} /> */}
//         <RoomCardActions room={room} isFavorite={isFavorite} onFavoriteChange={onFavoriteChange}/>

//       </div>
//       {/* Ảnh nền */}
//       <div className="relative w-full h-[60%] min-h-[180px] max-h-[220px] select-none">
//         <Image
//           src={room.images?.[0]?.url ? URL_IMAGE + room.images[0].url : "/placeholder.jpg"}
//           alt={room.title}
//           fill
//           className="object-cover w-full h-full transition-transform duration-300"
//           sizes="(max-width: 640px) 100vw, 447px"
//           priority
//         />
//         <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
//         {/* Nhãn top */}
//         <div className="absolute z-30 flex gap-2 top-3 left-3">
//           {isForSale && (
//             <span className="px-3 py-1 text-xs font-semibold text-white transition-all duration-300 bg-green-700 rounded-full shadow group-hover:scale-105 group-hover:shadow-lg">
//               FOR SALE
//             </span>
//           )}
//           {isFeatured && (
//             <span className="px-3 py-1 text-xs font-semibold text-white transition-all duration-300 bg-yellow-500 rounded-full shadow group-hover:scale-105 group-hover:shadow-lg">
//               FEATURED
//             </span>
//           )}
//         </div>
//         {/* Nút action luôn hiển thị, nổi bật */}
//         <div className="absolute z-40 right-3 bottom-3">
//           <div>
//             <RoomCardActions room={room} isFavorite={isFavorite} onFavoriteChange={onFavoriteChange} />
//           </div>
//         </div>
//       </div>
//       {/* Nội dung */}
//       <div className="flex flex-col justify-between h-[40%] p-4 bg-white">
//         <div>
//           <div className="mb-1 text-lg font-bold text-gray-900 truncate transition-colors duration-200 group-hover:text-amber-700">
//             {room.title || "No Title"}
//           </div>
//           <div className="flex items-center gap-2 mb-2 text-sm text-gray-600 transition-colors duration-200 group-hover:text-gray-800">
//             <FaMapMarkerAlt className="text-amber-500" />
//             <span className="break-words whitespace-normal line-clamp-2">
//               {room.address.street +
//                 ", " +
//                 room.address.ward.name +
//                 ", " +
//                 room.address.ward.district.name +
//                 ", " +
//                 room.address.ward.district.province.name}
//             </span>
//           </div>
//         </div>
//         <div className="flex items-center justify-between mt-2">
//           <div className="flex items-center gap-2 px-2 py-1 text-sm text-gray-700 transition-colors duration-200 bg-gray-100 rounded-lg group-hover:bg-amber-100">
//             <PiRuler className="text-base" />
//             <span>{room.area} m²</span>
//           </div>
//           <div className="text-lg font-extrabold transition-colors duration-200 text-amber-600 group-hover:text-amber-700">
//             {typeof room.priceMonth === "number"
//               ? room.priceMonth.toLocaleString("en-US") + " VND"
//               : room.priceMonth}
//           </div>
//         </div>
//       </div>
//     </motion.div>
//   );
// };

// export default RoomCard;

"use client";

import Image from "next/image";
import React from "react";
import { motion } from "framer-motion";
import { URL_IMAGE } from "@/services/Constant";
import { RoomInUser } from "@/types/types";
import { FaMapMarkerAlt } from "react-icons/fa";
import { PiRuler } from "react-icons/pi";
import RoomCardActions from "./RoomCardActions";

export interface RoomCardProps {
  room: RoomInUser;
  isForSale?: boolean;
  isFeatured?: boolean;
  isFavorite?: boolean;
  onFavoriteChange?: (id: string) => void;
  custom?: number; // for staggered animation
}

const RoomCard: React.FC<RoomCardProps> = ({
  room,
  isForSale = false,
  isFeatured = false,
  isFavorite = false,
  onFavoriteChange,
  custom = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }} // once: true để chỉ chạy một lần khi vào view
      transition={{ duration: 0.7, ease: "easeOut", delay: custom * 0.19 }}
      className="rounded-lg overflow-hidden shadow-lg bg-white relative group w-[320px] h-[370px] border border-gray-100 hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.015] transition-all duration-300 cursor-pointer focus-within:ring-2 focus-within:ring-amber-400"
      style={{ willChange: "transform, box-shadow, border-color, background" }}
      custom={custom}
    >
      {/* Ảnh nền */}
      <div className="relative w-full h-[60%] min-h-[180px] max-h-[220px] select-none">
        <Image
          src={
            room.images?.[0]?.url
              ? URL_IMAGE + room.images[0].url
              : "/placeholder.jpg"
          }
          alt={room.title}
          fill
          className="object-cover w-full h-full transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, 447px"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        {/* Nhãn top */}
        <div className="absolute z-30 flex gap-2 top-3 left-3">
          {isForSale && (
            <span className="px-3 py-1 text-xs font-semibold text-white transition-all duration-300 bg-green-700 rounded-full shadow group-hover:scale-105 group-hover:shadow-lg">
              FOR SALE
            </span>
          )}
          {isFeatured && (
            <span className="px-3 py-1 text-xs font-semibold text-white transition-all duration-300 bg-yellow-500 rounded-full shadow group-hover:scale-105 group-hover:shadow-lg">
              FEATURED
            </span>
          )}
        </div>
        {/* Nút action luôn hiển thị, nổi bật */}
        <div className="absolute z-40 right-3 bottom-3">
          <div>
            <RoomCardActions
              room={room}
              isFavorite={isFavorite}
              onFavoriteChange={onFavoriteChange}
            />
          </div>
        </div>
      </div>
      {/* Nội dung */}
      <div className="flex flex-col justify-between h-[40%] p-4 bg-white">
        <div>
          <div className="mb-1 text-lg font-bold text-gray-900 truncate transition-colors duration-200 group-hover:text-amber-700">
            {room.title || "No Title"}
          </div>
          <div className="flex items-center gap-2 mb-2 text-sm text-gray-600 transition-colors duration-200 group-hover:text-gray-800">
            <FaMapMarkerAlt className="text-amber-500" />
            <span className="break-words whitespace-normal line-clamp-2">
              {room.address.street +
                ", " +
                room.address.ward.name +
                ", " +
                room.address.ward.district.name +
                ", " +
                room.address.ward.district.province.name}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2 px-2 py-1 text-sm text-gray-700 transition-colors duration-200 bg-gray-100 rounded-lg group-hover:bg-amber-100">
            <PiRuler className="text-base" />
            <span>{room.area} m²</span>
          </div>
          <div className="text-lg font-extrabold transition-colors duration-200 text-amber-600 group-hover:text-amber-700">
            {typeof room.priceMonth === "number"
              ? room.priceMonth.toLocaleString("en-US") + " VND"
              : room.priceMonth}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RoomCard;
