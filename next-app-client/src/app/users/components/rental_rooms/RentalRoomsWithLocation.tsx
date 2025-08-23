"use client";

import { useLocationContext } from "@/context/LocationContext";
import { useSession } from "next-auth/react";
import { PaginatedResponse, RoomInUser } from "@/types/types";
import RoomVipCard from "../rooms/RoomVipCard";
import RoomCard from "../rooms/RoomCard";
import Link from "next/link";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";
import { HiSparkles } from "react-icons/hi";

interface RentalRoomsWithLocationProps {
  initialVipRooms: PaginatedResponse<RoomInUser>;
  initialNormalRooms: PaginatedResponse<RoomInUser>;
  initialFavoriteIds: string[];
  page: number;
  pageNormal: number;
  isEmptyFilter: boolean;
  userLocationData?: { 
    hasLocationPreference: boolean; 
    coordinates: { lat: number; lng: number } | null;
    address: string | null;
  } | null;
}

export default function RentalRoomsWithLocation({
  initialVipRooms,
  initialNormalRooms,
  initialFavoriteIds,
  page,
  pageNormal,
  isEmptyFilter,
  userLocationData,
}: RentalRoomsWithLocationProps) {
  const { data: session } = useSession();
  const { location, guestRooms, isSearching, setGuestRooms, setLocation } =
    useLocationContext();

  // Debug logging
  console.log("🏠 RentalRoomsWithLocation Debug:");
  console.log("- Session user ID:", session?.user?.userProfile?.id);
  console.log("- Location from context:", location);
  console.log("- Guest rooms from context:", guestRooms);
  console.log("- isSearching:", isSearching);
  console.log("- User location data from server:", userLocationData);

  const isGuestUser = !session?.user?.userProfile?.id;
  const hasGuestData = guestRooms && location; // Context data from guest search
  const hasUserLocationData = userLocationData?.hasLocationPreference && userLocationData.coordinates; // Server data for logged-in user

  // Use guest rooms from context if available (for guest users with location search),
  // or use initial data which may be location-sorted for logged-in users with saved preferences
  const vipRooms = hasGuestData ? guestRooms.vipRooms : initialVipRooms;
  const normalRooms = hasGuestData
    ? guestRooms.normalRooms
    : initialNormalRooms;

  console.log("- Using guest data:", hasGuestData);
  console.log("- User has saved location:", hasUserLocationData);
  console.log("- VIP rooms count:", vipRooms?.data?.length || 0);
  console.log("- Normal rooms count:", normalRooms?.data?.length || 0);

  // Safety check for null data
  if (!vipRooms || !normalRooms) {
    return (
      <div className="flex flex-col items-center justify-center w-full gap-4 px-2 sm:px-4 my-8 bg-white max-w-7xl lg:px-0 lg:w-auto">
        <div className="text-center space-y-4">
          <div className="text-6xl">🏠</div>
          <h3 className="text-2xl font-bold text-gray-700">
            No rooms available
          </h3>
          <p className="text-gray-500">
            Please try again later or contact support
          </p>
        </div>
      </div>
    );
  }

  if (!isEmptyFilter) {
    return null; // Only show when no filters are applied
  }

  // Show loading state when searching for guest users
  if (isGuestUser && isSearching) {
    return (
      <div className="flex flex-col items-center justify-center w-full gap-4 px-2 sm:px-4 my-8 bg-white max-w-7xl lg:px-0 lg:w-auto">
        <div className="text-center space-y-4 p-8 bg-blue-50/50 rounded-2xl border border-blue-200/30">
          <div className="flex items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            <span className="text-lg font-medium text-blue-700">
              🔍 Searching for rooms near your location...
            </span>
          </div>
          {location?.address && (
            <p className="text-blue-600 bg-white/70 px-4 py-2 rounded-full inline-block">
              📍 {location.address}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full gap-4 px-2 sm:px-4 my-8 bg-white max-w-7xl lg:px-0 lg:w-auto">
      {/* Location-based Search Result Banner for Guest Users */}
      {hasGuestData && (
        <div className="w-full mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">📍</span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-blue-800">
                    Location-Based Results
                  </h4>
                  <p className="text-sm text-blue-600 mt-1">
                    Showing{" "}
                    {(vipRooms.totalRecords || 0) +
                      (normalRooms.totalRecords || 0)}{" "}
                    rooms sorted by distance from:
                  </p>
                  <p className="text-sm font-semibold text-blue-800 bg-white/70 px-3 py-1 rounded-full inline-block mt-2">
                    {location.address}
                  </p>
                </div>
              </div>

              {/* Clear Location Button */}
              <button
                onClick={() => {
                  setGuestRooms(null);
                  setLocation(null);
                  console.log(
                    "🧹 Cleared location data - returning to default view"
                  );
                }}
                className="px-4 py-2 text-sm bg-white border border-blue-300 text-blue-700 rounded-xl hover:bg-blue-50 transition-colors duration-200"
                title="Clear location search and return to default view"
              >
                ❌ Clear Location
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIP Rooms Section */}
      <div className="w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <HiSparkles className="text-yellow-500 text-2xl" />
            <div className="text-center">
              <h3 className="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                Premium Listings
              </h3>
              {hasGuestData && location && (
                <div className="text-sm text-blue-600 mt-2 flex items-center justify-center gap-2">
                  <span className="bg-blue-100 px-3 py-1 rounded-full font-medium">
                    📍 Sorted by distance from: {location.address}
                  </span>
                </div>
              )}
              {isGuestUser && !hasGuestData && (
                <div className="text-sm text-gray-500 mt-2">
                  � Select a location above to see rooms sorted by distance
                </div>
              )}
            </div>
            <HiSparkles className="text-yellow-500 text-2xl" />
          </div>
          <p className="text-gray-600">
            {hasGuestData
              ? "Premium rooms sorted by proximity to your selected location"
              : "Hand-picked premium rooms for the discerning renter"}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center w-full gap-4">
        <div className="flex flex-wrap items-start justify-center w-full gap-4 md:gap-6 lg:gap-8">
          {vipRooms.data
            .filter(
              (room): room is RoomInUser =>
                room &&
                typeof room === "object" &&
                "priceMonth" in room &&
                "postStartDate" in room &&
                "conveniences" in room &&
                "landlord" in room
            )
            .map((room, index) => (
              <div
                key={index}
                className="basis-full w-full max-w-xs sm:max-w-1/2 lg:max-w-none flex justify-center"
              >
                <RoomVipCard
                  room={room}
                  isFavorite={initialFavoriteIds.includes(room.id)}
                />
              </div>
            ))}

          {/* VIP Pagination */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <Link
              href={`?page=${page - 1}#rental-rooms`}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium border transition-all duration-200 shadow ${
                page === 0
                  ? "text-gray-400 bg-gray-100 cursor-not-allowed pointer-events-none border-gray-200"
                  : "text-blue-600 bg-white hover:bg-blue-50 hover:shadow-lg border-blue-300"
              }`}
              scroll={true}
              aria-disabled={page === 0}
            >
              <BiChevronLeft size={20} />
              <span className="hidden sm:inline">Previous</span>
            </Link>

            <div className="flex flex-col items-center px-4">
              <span className="text-base font-semibold text-gray-700">
                Page <span className="text-blue-600">{page + 1}</span> /{" "}
                <span className="text-blue-600">{vipRooms.totalPages}</span>
              </span>
              <span className="text-xs text-gray-400">
                {vipRooms.totalRecords} rooms found
              </span>
            </div>

            <Link
              href={`?page=${page + 1}#rental-rooms`}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium border transition-all duration-200 shadow ${
                page + 1 >= vipRooms.totalPages
                  ? "text-gray-400 bg-gray-100 cursor-not-allowed pointer-events-none border-gray-200"
                  : "text-blue-600 bg-white hover:bg-blue-50 hover:shadow-lg border-blue-300"
              }`}
              scroll={true}
              aria-disabled={page + 1 >= vipRooms.totalPages}
            >
              <span className="hidden sm:inline">Next</span>
              <BiChevronRight size={20} />
            </Link>
          </div>
        </div>
      </div>

      {/* Normal Rooms Section */}
      <div className="flex flex-col items-center justify-center w-full gap-4 px-2 sm:px-4 my-6 max-w-7xl">
        <div className="text-center space-y-6 mb-16">
          <h3 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-blue-600 bg-clip-text text-transparent">
            Featured Properties
          </h3>
          {hasGuestData && location && (
            <div className="text-sm text-blue-600 mt-2 flex items-center justify-center gap-2">
              <span className="bg-blue-100 px-4 py-2 rounded-full font-medium">
                📍 Sorted by distance from: {location.address}
              </span>
            </div>
          )}
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {hasGuestData
              ? "Quality rentals sorted by proximity to your selected location"
              : "Discover our most popular and highly-rated rental properties"}
          </p>
        </div>

        <div
          id="normal-rooms-list"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-4 w-full"
        >
          {normalRooms.data
            .filter(
              (room): room is RoomInUser =>
                room &&
                typeof room === "object" &&
                "priceMonth" in room &&
                "postStartDate" in room &&
                "conveniences" in room &&
                "landlord" in room
            )
            .map((room, index) => (
              <div key={index} className="flex justify-center">
                <RoomCard
                  room={room}
                  isForSale={false}
                  isFeatured={false}
                  isFavorite={initialFavoriteIds.includes(room.id)}
                />
              </div>
            ))}
        </div>

        {/* Normal Rooms Pagination */}
        {/* <div className="flex items-center justify-center gap-4 mt-8">
          <Link
            href={`?pageNormal=${pageNormal - 1}`}
            scroll={false}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium border transition-all duration-200 shadow ${
              pageNormal === 0
                ? "text-gray-400 bg-gray-100 cursor-not-allowed pointer-events-none border-gray-200"
                : "text-blue-600 bg-white hover:bg-blue-50 hover:shadow-lg border-blue-300"
            }`}
            aria-disabled={pageNormal === 0}
          >
            <BiChevronLeft size={20} />
            <span className="hidden sm:inline">Previous</span>
          </Link>

          <div className="flex flex-col items-center px-4">
            <span className="text-base font-semibold text-gray-700">
              Page <span className="text-blue-600">{pageNormal + 1}</span> /{" "}
              <span className="text-blue-600">{normalRooms.totalPages}</span>
            </span>
            <span className="text-xs text-gray-400">
              {normalRooms.totalRecords} rooms found
            </span>
          </div>

          <Link
            href={`?pageNormal=${pageNormal + 1}`}
            scroll={false}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium border transition-all duration-200 shadow ${
              pageNormal + 1 >= normalRooms.totalPages
                ? "text-gray-400 bg-gray-100 cursor-not-allowed pointer-events-none border-gray-200"
                : "text-blue-600 bg-white hover:bg-blue-50 hover:shadow-lg border-blue-300"
            }`}
            aria-disabled={pageNormal + 1 >= normalRooms.totalPages}
          >
            <span className="hidden sm:inline">Next</span>
            <BiChevronRight size={20} />
          </Link>
        </div> */}
      </div>
    </div>
  );
}
