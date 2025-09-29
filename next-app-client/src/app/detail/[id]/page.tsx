import BookingForm from "@/app/landlord/components/booking-room/BookingForm";
import FavoriteCount from "@/app/landlord/components/room-detail/FavoriteCount";
import FeedbackLayout from "@/app/landlord/components/room-detail/Feedback";
import IncreaseView from "@/app/landlord/components/room-detail/IncreaseView";
import MapSection from "@/app/landlord/components/room-detail/map";
import { Slide } from "@/app/landlord/components/room-detail/Slide";
import RightSidebar from "@/app/users/components/RightSidebar";
import { getRoomById, getRoomVipUser } from "@/services/RoomService";
import { Image, RoomInUser } from "@/types/types";
import {
  Calendar,
  DollarSign,
  Droplets,
  FileText,
  Home,
  Map,
  MapPin,
  MessageSquare,
  Ruler,
  Users,
  Zap,
} from "lucide-react";
// import { FaEye, FaHeart } from "react-icons/fa";

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
  console.log("type post: ", room?.typepost);
  if (!room) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="p-8 text-center">
          <div className="mb-4 text-6xl text-gray-400">🏠</div>
          <h2 className="mb-2 text-2xl font-bold text-gray-800 dark:text-white">
            Room not found
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            The room you&#39;re looking for doesn&#39;t exist or has been
            removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container px-4 py-6 mx-auto">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Main Content */}
          <div className="w-full lg:w-2/3">
            <div className="overflow-hidden bg-white shadow-xl dark:bg-gray-800 rounded-2xl">
              {/* Header Section with Gradient */}
              <div className="p-6 text-white bg-gradient-to-r from-blue-600 to-purple-600">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-4 py-2 text-sm font-medium border rounded-full bg-white/20 backdrop-blur-sm border-white/30">
                    {room.typepost
                      ? room.typepost.charAt(0).toUpperCase() +
                        room.typepost.slice(1)
                      : "Room"}
                  </span>
                </div>
                <h1 className="mb-2 text-3xl font-bold">
                  {room.title || "Premium Room for Rent"}
                </h1>
                <div className="flex items-center gap-2">
                  {/* <DollarSign className="w-6 h-6 text-green-300" /> */}
                  <span className="text-3xl font-bold text-green-300">
                    {room.priceMonth
                      ? `${room.priceMonth.toLocaleString("vi-VN")} VND`
                      : "Contact"}
                  </span>
                  <span className="text-white/80">/month</span>
                </div>
              </div>

              {/* Image Slider Section */}
              <div className="p-6 bg-gray-50 dark:bg-gray-800">
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

              {/* Room Details Grid - Enhanced */}
              <div className="p-6">
                <div className="flex gap-4 mb-4 items-left">
                  <h2 className="flex items-center gap-2 m-0 text-2xl font-bold text-gray-800 dark:text-white">
                    <Home className="w-6 h-6 text-blue-600" />
                    Room Specifications
                  </h2>
                  <div className="flex items-center gap-3 ml-4">
                    <IncreaseView roomId={room.id} />
                    <FavoriteCount roomId={room.id} />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-3">
                  {/* Area */}
                  <div className="p-5 transition-all duration-300 border border-blue-200 group bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl dark:border-blue-700 hover:shadow-lg hover:scale-105">
                    <div className="flex items-center gap-4">
                      <div className="p-3 transition-colors bg-blue-500 shadow-lg rounded-xl group-hover:bg-blue-600">
                        <Home className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="mb-1 text-sm font-medium text-blue-700 dark:text-blue-300">
                          Area
                        </p>
                        <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                          {room.area ? `${room.area} m²` : "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Length */}
                  <div className="p-5 transition-all duration-300 border border-green-200 group bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl dark:border-green-700 hover:shadow-lg hover:scale-105">
                    <div className="flex items-center gap-4">
                      <div className="p-3 transition-colors bg-green-500 shadow-lg rounded-xl group-hover:bg-green-600">
                        <Ruler className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="mb-1 text-sm font-medium text-green-700 dark:text-green-300">
                          Length
                        </p>
                        <p className="text-xl font-bold text-green-900 dark:text-green-100">
                          {room.roomLength
                            ? `${room.roomLength} m`
                            : "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Width */}
                  <div className="p-5 transition-all duration-300 border border-purple-200 group bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl dark:border-purple-700 hover:shadow-lg hover:scale-105">
                    <div className="flex items-center gap-4">
                      <div className="p-3 transition-colors bg-purple-500 shadow-lg rounded-xl group-hover:bg-purple-600">
                        <Ruler className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="mb-1 text-sm font-medium text-purple-700 dark:text-purple-300">
                          Width
                        </p>
                        <p className="text-xl font-bold text-purple-900 dark:text-purple-100">
                          {room.roomWidth
                            ? `${room.roomWidth} m`
                            : "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Max People */}
                  <div className="p-5 transition-all duration-300 border border-orange-200 group bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl dark:border-orange-700 hover:shadow-lg hover:scale-105">
                    <div className="flex items-center gap-4">
                      <div className="p-3 transition-colors bg-orange-500 shadow-lg rounded-xl group-hover:bg-orange-600">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="mb-1 text-sm font-medium text-orange-700 dark:text-orange-300">
                          Max People
                        </p>
                        <p className="text-xl font-bold text-orange-900 dark:text-orange-100">
                          {room.maxPeople
                            ? `${room.maxPeople} people`
                            : "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Electricity Price */}
                  <div className="p-5 transition-all duration-300 border border-yellow-200 group bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl dark:border-yellow-700 hover:shadow-lg hover:scale-105">
                    <div className="flex items-center gap-4">
                      <div className="p-3 transition-colors bg-yellow-500 shadow-lg rounded-xl group-hover:bg-yellow-600">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="mb-1 text-sm font-medium text-yellow-700 dark:text-yellow-300">
                          Electricity
                        </p>
                        <p className="text-lg font-bold text-yellow-900 dark:text-yellow-100">
                          {room.elecPrice
                            ? `${room.elecPrice.toLocaleString(
                                "vi-VN"
                              )} VND/kWh`
                            : "Per bill"}
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Water Price */}
                  <div className="p-5 transition-all duration-300 border group bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 rounded-xl border-cyan-200 dark:border-cyan-700 hover:shadow-lg hover:scale-105">
                    <div className="flex items-center gap-4">
                      <div className="p-3 transition-colors shadow-lg bg-cyan-500 rounded-xl group-hover:bg-cyan-600">
                        <Droplets className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="mb-1 text-sm font-medium text-cyan-700 dark:text-cyan-300">
                          Water
                        </p>
                        <p className="text-lg font-bold text-cyan-900 dark:text-cyan-100">
                          {room.waterPrice
                            ? `${room.waterPrice.toLocaleString(
                                "vi-VN"
                              )} VND/m³`
                            : "Per bill"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address Section - Enhanced */}
                <div className="mb-8">
                  <h3 className="flex items-center gap-2 mb-4 text-xl font-bold text-gray-800 dark:text-white">
                    <MapPin className="w-5 h-5 text-red-600" />
                    Location Details
                  </h3>
                  <div className="p-6 border border-red-200 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl dark:border-red-700">
                    <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <span className="font-semibold text-red-700 dark:text-red-300 min-w-[70px]">
                            Street:
                          </span>
                          <span className="text-gray-700 dark:text-gray-300">
                            {room.address?.street || "Not available"}
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="font-semibold text-red-700 dark:text-red-300 min-w-[70px]">
                            Ward:
                          </span>
                          <span className="text-gray-700 dark:text-gray-300">
                            {room.address?.ward?.name || "Not available"}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <span className="font-semibold text-red-700 dark:text-red-300 min-w-[70px]">
                            District:
                          </span>
                          <span className="text-gray-700 dark:text-gray-300">
                            {room.address?.ward?.district?.name ||
                              "Not available"}
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="font-semibold text-red-700 dark:text-red-300 min-w-[70px]">
                            City:
                          </span>
                          <span className="text-gray-700 dark:text-gray-300">
                            {room.address?.ward?.district?.province?.name ||
                              "Not available"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Posted Date - Enhanced */}
                <div className="mb-8">
                  <div className="p-5 border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl dark:border-green-700">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500 rounded-lg">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="mb-1 text-sm font-medium text-green-700 dark:text-green-300">
                          Posted Date
                        </p>
                        <p className="text-lg font-bold text-green-900 dark:text-green-100">
                          {room.postStartDate
                            ? new Date(room.postStartDate).toLocaleDateString(
                                "en-US",
                                {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )
                            : "Not available"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Booking Form - Enhanced */}
                <div className="mb-8">
                  <div className="p-6 border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl dark:border-blue-700">
                    <BookingForm
                      roomId={room.id}
                      roomTitle={room.title || "Room for rent"}
                      priceMonth={room.priceMonth || 0}
                    />
                  </div>
                </div>

                {/* Divider */}
                <div className="relative mb-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 text-gray-500 bg-white dark:bg-gray-800 dark:text-gray-400">
                      Room Details
                    </span>
                  </div>
                </div>

                {/* Description Section - Enhanced */}
                <div className="mb-8">
                  <h2 className="flex items-center gap-2 mb-4 text-xl font-bold text-gray-800 dark:text-white">
                    <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    Description
                  </h2>
                  <div className="p-6 border border-gray-200 bg-gray-50 dark:bg-gray-800/50 rounded-xl dark:border-gray-700">
                    <div className="prose dark:prose-invert max-w-none">
                      {room.description ? (
                        room.description
                          .split("\n")
                          .map((line: string, idx: number) => (
                            <p
                              key={idx}
                              className="mb-3 leading-relaxed text-gray-700 dark:text-gray-300"
                            >
                              {line || <span className="opacity-50">•</span>}
                            </p>
                          ))
                      ) : (
                        <div className="py-8 text-center">
                          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                          <p className="italic text-gray-500 dark:text-gray-400">
                            No description available for this room
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Conveniences Section */}
                {/* <div className="mb-8">
                  <Convenient features={room.convenients} />
                </div> */}

                {/* Divider */}
                <div className="relative mb-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 text-gray-500 bg-white dark:bg-gray-800 dark:text-gray-400">
                      Community & Location
                    </span>
                  </div>
                </div>

                {/* Feedback Section - Enhanced */}
                <div className="mb-8">
                  <h2 className="flex items-center gap-2 mb-4 text-xl font-bold text-gray-800 dark:text-white">
                    <MessageSquare className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    Reviews & Comments
                  </h2>
                  <div className="overflow-hidden bg-white border border-gray-200 dark:bg-gray-800/50 rounded-xl dark:border-gray-700">
                    <FeedbackLayout roomId={id} />
                  </div>
                </div>

                {/* Map Section - Enhanced */}
                <div className="mb-8">
                  <h2 className="flex items-center gap-2 mb-4 text-xl font-bold text-gray-800 dark:text-white">
                    <Map className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    Location & Map
                  </h2>
                  <div className="overflow-hidden bg-white border border-gray-200 shadow-lg dark:bg-gray-800/50 rounded-xl dark:border-gray-700">
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
            </div>
          </div>

          {/* Right Sidebar - Enhanced */}
          <div className="w-full lg:w-1/3">
            <div className="sticky top-6">
              <RightSidebar id={id} postType={room.typepost} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
