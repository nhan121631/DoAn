import BookingForm from "@/app/landlord/components/booking-room/BookingForm";
import Convenient from "@/app/landlord/components/room-detail/convenient";
import FavoriteCount from "@/app/landlord/components/room-detail/FavoriteCount";
import RoomViewCount from "@/app/landlord/components/room-detail/IncreaseView";
import IncreaseView from "@/app/landlord/components/room-detail/IncreaseView";
import MapSection from "@/app/landlord/components/room-detail/map";
import { Slide } from "@/app/landlord/components/room-detail/Slide";
import RightSidebar from "@/app/users/components/RightSidebar";
import { getRoomById, getRoomVipUser } from "@/services/RoomService";
import { Image, RoomInUser } from "@/types/types";
import { FaEye, FaHeart } from "react-icons/fa";


export const dynamic = "force-static";
export const dynamicParams = true;

export async function generateStaticParams() {
  const page = 0;
  const size = 10;
  const response = await getRoomVipUser(page, size);
  if (!response || !response.data || response.data.length === 0) {
    return [];
  }
  return response.data.slice(0, 10).map((room: RoomInUser) => ({
    id: room.id.toString(),
  }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const room = await getRoomById(id);
  if (!room) {
    return <div>Room not found</div>;
  }
  return (
    <>
          {/* {room && <IncreaseView roomId={room.id} />} */}

      <div className="w-full p-6 mb-6 bg-white lg:w-2/3 rounded-xl lg:mb-0">
        <div className="max-w-[900px] mx-auto my-8 bg-white dark:bg-[#181f2b] rounded-xl shadow-lg p-6 dark:text-white">
          {/* Image slider */}
          <div className="p-4 bg-white dark:bg-[#232b3b] rounded-lg">
            <Slide
              images={
                Array.isArray(room.images)
                  ? room.images.filter(
                      (img: Image) => img && typeof img.url === "string"
                    )
                  : []
              }
              address={
                room.address.street +
                  ", " +
                  room.address.ward.name +
                  ", " +
                  room.address.ward.district.name +
                  ", " +
                  room.address.ward.district.province.name || ""
              }
            />
          </div>

          {/* Room Info Card */}
          <div className="mt-6 p-5 rounded-lg bg-[#f9f9f9] dark:bg-[#232b3b] shadow-sm flex flex-col gap-4">
            <div className="flex items-center mb-2">
              <span className="px-2 mr-2 text-xl font-bold text-white bg-red-500 rounded">
                {room.typepost
                  ? room.typepost.charAt(0).toUpperCase() +
                    room.typepost.slice(1)
                  : ""}
              </span>
              <span className="text-[#e53935] font-semibold text-xl mr-2 dark:text-[#ff6b6b]">
                {room.title || "Room for rent"}
              </span>
            </div>
            <div className="flex items-center gap-4 mb-2">
              
              <span className="text-lg font-bold text-green-700 dark:text-green-400">
                {room.priceMonth
                  ? `${room.priceMonth.toLocaleString("vi-VN")} VND/month`
                  : ""}
              </span>
              
              <span className="text-base text-gray-500 dark:text-gray-300">
                · {room.area ? `${room.area} m²` : ""}
              </span>
              <IncreaseView roomId={room.id} />
              <FavoriteCount roomId={room.id} />
            </div>
            <div className="text-gray-700 dark:text-gray-200 text-[15px] mb-1 flex justify-start">
              <span className="w-1/5">Ward</span>
              <span className="w-4/5 ml-1">
                {room.address?.ward?.name || ""}
              </span>
            </div>
            <div className="text-gray-700 dark:text-gray-200 text-[15px] mb-1 flex justify-start">
              <span className="w-1/5">District:</span>
              <span className="w-4/5 ml-1">
                {room.address?.ward?.district?.name || ""}
              </span>
            </div>
            <div className="text-gray-700 dark:text-gray-200 text-[15px] mb-1 flex justify-start">
              <span className="w-1/5">City/Province:</span>
              <span className="w-4/5 ml-1">
                {room.address?.ward?.district?.province?.name || ""}
              </span>
            </div>
            <div className="text-gray-700 dark:text-gray-200 text-[15px] mb-1 flex justify-start">
              <span className="w-1/5">Address:</span>
              <span className="w-4/5 ml-1">{room.address?.street || ""}</span>
            </div>
            <div className="text-gray-700 dark:text-gray-200 text-[15px] mb-1 flex justify-start">
              <span className="w-1/5">Post Start Date:</span>
              <span className="ml-1">
                {room.postStartDate
                  ? new Date(room.postStartDate).toLocaleString()
                  : ""}
              </span>
            </div>
            <div className="text-gray-700 dark:text-gray-200 text-[15px] mb-1 flex justify-start">
              <span className="w-1/5">Post End Date:</span>
              <span className="ml-1">
                {room.postEndDate
                  ? new Date(room.postEndDate).toLocaleString()
                  : ""}
              </span>
            </div>

            {/* Booking Form */}
            <div className="mt-4">
              <BookingForm
                roomId={room.id}
                roomTitle={room.title || "Room for rent"}
                priceMonth={room.priceMonth || 0}
              />
            </div>
            {/* <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
             Updated:{" "}
             {room.updatedAt ? new Date(room.updatedAt).toLocaleString() : ""}
           </div> */}

            <hr className="my-5 text-gray-300 dark:text-gray-600" />

            <h2 className="mb-2 text-lg font-bold text-gray-800 dark:text-white">
              Description
            </h2>
            <div className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-200 text-[15px]">
              {room.description ? (
                room.description
                  .split("\n")
                  .map((line: string, idx: number) => <p key={idx}>{line}</p>)
              ) : (
                <p>No description</p>
              )}
            </div>
            <Convenient features={room.convenients} />
            <hr className="my-5 text-gray-300" />
            <MapSection
              address={
                room.address.street +
                  ", " +
                  room.address.ward.name +
                  ", " +
                  room.address.ward.district.name +
                  ", " +
                  room.address.ward.district.province.name || ""
              }
            />
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/3">
        <RightSidebar id={id} />
      </div>
    </>
  );
}
