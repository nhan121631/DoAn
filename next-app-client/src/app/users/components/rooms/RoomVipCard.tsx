import { URL_IMAGE } from "@/services/Constant";
import { RoomInUser } from "@/types/types";
import Image from "next/image";
import { IoCameraOutline } from "react-icons/io5";
import { ButtonForVipCard } from "./ButtonForVipCard";
import RoomCartActionsWrapper from "./RoomCardActionsWrapper";

interface RoomVipCardProps {
  room: RoomInUser;
}

export default function RoomVipCard({ room }: RoomVipCardProps) {
  // Xử lý ngày đăng bài
  // function getPostDateLabel(postStartDate: string) {
  //   if (!postStartDate) return "";
  //   const today = new Date();
  //   const postDate = new Date(postStartDate);
  //   today.setHours(0, 0, 0, 0);
  //   postDate.setHours(0, 0, 0, 0);
  //   const diffTime = today.getTime() - postDate.getTime();
  //   const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  //   if (diffDays === 0) return "Hôm nay";
  //   if (diffDays === 1) return "Hôm qua";
  //   if (diffDays > 1 && diffDays <= 5) return `${diffDays} ngày trước`;
  //   return postStartDate;
  // }
  function getRelativeTime(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // seconds
    if (diff < 0) return "Just now";
    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  }

  return (
    <div className="rounded-xl overflow-hidden shadow bg-gray-100 border border-gray-300 mx-auto w-full max-w-[750px] min-w-[320px]">
      {/* IMAGE SECTION */}
      <RoomCartActionsWrapper room={room}>
        <div className="flex sm:flex-row flex-col gap-1 p-3 w-full sm:h-[320px] min-h-[200px]">
          {/* Ảnh lớn bên trái (hoặc trên ở mobile) */}
          <div className="relative rounded-sm overflow-hidden group/image-main sm:w-[65%] w-full aspect-[4/3] sm:aspect-auto">
            <Image
              src={
                URL_IMAGE + room.images?.[0]?.url || "/images/default/room.png"
              }
              alt={room.title}
              fill
              className="object-cover w-full h-full transition-all duration-500 ease-in-out group-hover/image-main:scale-105 group-hover/image-main:shadow-2xl group-hover/image-main:brightness-95"
              sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 300px"
              priority
            />
            <div className="absolute flex items-center gap-1 px-2 py-1 text-xs text-white rounded left-2 bottom-2 bg-black/60">
              <IoCameraOutline className="text-base" />
              {room.images?.length ?? 0}
            </div>
          </div>

          {/* Nhóm ảnh nhỏ bên phải hoặc dưới */}
          <div className="flex sm:flex-col flex-row gap-1 sm:w-[35%] w-full sm:aspect-auto">
            {room.images?.slice(1, 4).map((img, idx) => (
              <div
                key={idx}
                className="relative flex-1 aspect-[1/1] rounded-sm overflow-hidden group/image-thumb"
              >
                <Image
                  src={URL_IMAGE + img?.url || "/images/default/room.png"}
                  alt={`${room.title} ${idx + 2}`}
                  fill
                  className="object-cover w-full h-full transition-all duration-500 ease-in-out group-hover/image-thumb:scale-105 group-hover/image-thumb:shadow-xl group-hover/image-thumb:brightness-95"
                  sizes="(max-width: 640px) 50vw, (max-width: 1200px) 25vw, 120px"
                />
              </div>
            ))}
          </div>
        </div>
      </RoomCartActionsWrapper>

      {/* CONTENT SECTION */}
      <div className="p-4 flex flex-col gap-2 min-h-[120px] max-h-[380px] sm:max-w-[700px] overflow-hidden">
        {/* Tên phòng + sao */}
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="text-lg text-yellow-400">★★★★★</span>
          <RoomCartActionsWrapper room={room}>
            <span className="text-lg font-bold text-red-700 uppercase break-words">
              {room.title}
            </span>
          </RoomCartActionsWrapper>
        </div>

        {/* Giá - Diện tích - Địa chỉ */}
        <div className="flex flex-wrap items-center max-w-full gap-3 text-base font-semibold text-green-800">
          <span className="truncate max-w-[120px]">
            {room.priceMonth.toLocaleString("en-US") + "đ"}
          </span>
          <span className="text-gray-700 font-normal truncate max-w-[80px]">
            • {room.area}m²
          </span>
          <span className="text-gray-700 font-normal truncate max-w-[180px]">
            •{" "}
            {room.address.street +
              ", " +
              room.address.ward.name +
              ", " +
              room.address.ward.district.name +
              ", " +
              room.address.ward.district.province.name}
          </span>
        </div>

        {/* Mô tả */}
        <div className="max-w-full mb-2 text-sm text-gray-800 line-clamp-3 text-ellipsis">
          {room.description}
        </div>

        {/* Thông tin người đăng */}
        <div className="flex flex-wrap items-center gap-2 mt-auto">
          <Image
            src="/images/useravt.png"
            alt="Avatar"
            width={32}
            height={32}
            style={{ width: 32, height: 32 }}
            className="border rounded-full"
          />
          <span className="font-medium text-gray-800">
            {room.landlord.landlordProfile.fullName}
          </span>
          <span className="text-xs text-gray-600">
            {getRelativeTime(room.postStartDate)}
          </span>
          <span className="px-3 py-1 ml-auto text-sm font-semibold rounded-full bg-emerald-100 text-emerald-700">
            {room.landlord.landlordProfile.phoneNumber
              ? room.landlord.landlordProfile.phoneNumber
              : room.landlord.landlordProfile.email}
          </span>
          <ButtonForVipCard room={room} />
        </div>
      </div>
    </div>
  );
}
