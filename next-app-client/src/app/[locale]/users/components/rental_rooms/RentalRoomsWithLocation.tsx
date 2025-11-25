"use client";

import { useLocationContext } from "@/context/LocationContext";
import { getRoomVipUser, getRoomVipWithLocation } from "@/services/RoomService";
import { PaginatedResponse, RoomInUser } from "@/types/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";
import { HiSparkles } from "react-icons/hi";
import RoomVipCard from "../rooms/RoomVipCard";

interface RentalRoomsWithLocationProps {
  initialVipRooms?: PaginatedResponse<RoomInUser>;
  initialNormalRooms?: PaginatedResponse<RoomInUser>;
  initialFavoriteIds: string[];
  page?: number;
  isEmptyFilter: boolean;
  userId?: string;
}

export default function RentalRoomsWithLocation({
  initialVipRooms,
  initialNormalRooms,
  initialFavoriteIds,
  page,
  isEmptyFilter,
  userId,
}: RentalRoomsWithLocationProps) {
  // Debug log to check userId
  console.log("🔧 RentalRoomsWithLocation - userId prop:", userId);

  const router = useRouter();
  // const { data: session } = useSession();
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const [optimisticPage, setOptimisticPage] = useState<number | null>(null);
  const [paginatedVipRooms, setPaginatedVipRooms] =
    useState<PaginatedResponse<RoomInUser> | null>(null);
  const {
    location,
    guestRooms,
    userRooms,
    isSearching,
    setGuestRooms,
    setUserRooms,
    setLocation,
  } = useLocationContext();

  // Component state tracking

  const isGuestUser = !userId;

  // Simplified: only use location data when we have context location (from search)
  const isUsingLocationData = !!location;

  // Get coordinates for API calls - only from context location
  const getLocationCoordinates = () => {
    if (location) {
      // Use context location (from search)
      return { lat: location.lat, lng: location.lng, source: "context" };
    }
    return null;
  };

  // Location state

  // Reset URL pagination when switching to location-based data
  useEffect(() => {
    if (isUsingLocationData && page !== undefined && page !== 0) {
      // Reset URL to page 0 when location data is available but URL shows different page
      router.push("?page=0", { scroll: false });
    }
  }, [isUsingLocationData, page, router]);

  // Use rooms from context if available (for location search - both guest and user),
  // or use initial data which may be location-sorted for logged-in users with saved preferences
  // Use paginated data if available (from client-side pagination)
  const vipRooms =
    paginatedVipRooms ||
    (isGuestUser
      ? guestRooms && location
        ? guestRooms.vipRooms
        : initialVipRooms
      : userRooms && location
      ? userRooms.vipRooms
      : initialVipRooms);

  // Calculate effective current page - always 0 when using location data
  const effectivePage = isUsingLocationData ? 0 : page || 0;

  // Use optimistic page if available, otherwise use effective page
  const displayPage = optimisticPage !== null ? optimisticPage : effectivePage;

  const normalRooms = isGuestUser
    ? guestRooms && location
      ? guestRooms.normalRooms
      : initialNormalRooms
    : userRooms && location
    ? userRooms.normalRooms
    : initialNormalRooms;

  // Room counts for debugging if needed
  // console.log("- VIP rooms count:", vipRooms?.data?.length || 0);
  // console.log("- Normal rooms count:", normalRooms?.data?.length || 0);

  // Reset paginated data when context changes
  useEffect(() => {
    setPaginatedVipRooms(null);
    setOptimisticPage(null);
  }, [guestRooms, userRooms, location]);

  // Handle pagination for location-based data
  const handleVipPagination = async (newPage: number) => {
    const coords = getLocationCoordinates();

    console.log("🔄 VIP Pagination triggered:", {
      newPage,
      isUsingLocationData,
      coords,
      userId: userId,
    });

    // Immediately set optimistic page and loading state
    setOptimisticPage(newPage);
    setIsLoadingPage(true);

    // Update URL immediately for better UX
    const currentParams = new URLSearchParams(window.location.search);
    currentParams.set("page", newPage.toString());
    router.push(`?${currentParams.toString()}`, { scroll: false });

    try {
      let newVipRooms: PaginatedResponse<RoomInUser> | null = null;

      if (isUsingLocationData && coords) {
        // For location-based data, fetch new data with coordinates
        console.log("🌍 Calling location-based VIP API:", {
          page: newPage,
          size: 4,
          lat: coords.lat,
          lng: coords.lng,
          source: coords.source,
          apiURL: `/rooms/allroom-vip-location?page=${newPage}&size=4&lat=${coords.lat}&lng=${coords.lng}`,
        });

        newVipRooms = await getRoomVipWithLocation(
          newPage,
          4,
          coords.lat,
          coords.lng
        );
      } else {
        // For non-location data, fetch regular VIP rooms
        console.log("👤 Calling regular VIP API:", {
          page: newPage,
          size: 4,
          userId,
          apiURL: `/rooms/allroom-vip?page=${newPage}&size=4${
            userId ? `&userId=${userId}` : ""
          }`,
        });

        newVipRooms = await getRoomVipUser(newPage, 4, userId);
      }

      console.log("📦 VIP API Response:", {
        success: !!newVipRooms,
        totalRecords: newVipRooms?.totalRecords,
        totalPages: newVipRooms?.totalPages,
        page: newVipRooms?.page,
        dataLength: newVipRooms?.data?.length,
        firstRoomId: newVipRooms?.data?.[0]?.id,
        firstRoomTitle: newVipRooms?.data?.[0]?.title?.substring(0, 50),
        isLocationSorted: !!coords,
      });

      if (newVipRooms) {
        // Store paginated data in local state
        setPaginatedVipRooms(newVipRooms);
      }
    } catch (error) {
      console.error("❌ Error fetching VIP rooms:", error);
      // Reset optimistic page on error
      setOptimisticPage(null);
    } finally {
      // Always reset loading state
      setIsLoadingPage(false);
      // Keep optimistic page until next navigation
    }
  };

  // Check if we have VIP rooms to show
  const shouldShowVipRooms = vipRooms && vipRooms.data.length > 0;

  // Safety check for null data
  if (!vipRooms && !normalRooms) {
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
      {guestRooms && location && (
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
                    {(vipRooms?.totalRecords || 0) +
                      (normalRooms?.totalRecords || 0)}{" "}
                    rooms sorted by distance from:
                  </p>
                  <p className="text-sm font-semibold text-blue-800 bg-white/70 px-3 py-1 rounded-full inline-block mt-2">
                    {location?.address}
                  </p>
                </div>
              </div>

              {/* Clear Location Button */}
              <button
                onClick={() => {
                  setGuestRooms(null);
                  setLocation(null);
                  // console.log("🧹 Cleared location data - returning to default view");
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

      {/* VIP Rooms Section - Show only if we have VIP rooms */}
      {shouldShowVipRooms && (
        <>
          <div className="w-full space-y-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <HiSparkles className="text-yellow-500 text-2xl" />
                <div className="text-center">
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                    Premium Listings
                  </h3>
                  {((guestRooms && location) || (userRooms && location)) && (
                    <div className="text-sm text-blue-600 mt-2 flex items-center justify-center gap-2">
                      <span className="bg-blue-100 px-3 py-1 rounded-full font-medium">
                        📍 Sorted by distance from: {location?.address}
                      </span>
                    </div>
                  )}
                  {isGuestUser && !(guestRooms && location) && (
                    <div className="text-sm text-gray-500 mt-2">
                      📍 Select a location above to see rooms sorted by distance
                    </div>
                  )}
                </div>
                <HiSparkles className="text-yellow-500 text-2xl" />
              </div>
              <p className="text-gray-600">
                {isUsingLocationData
                  ? "Premium rooms sorted by proximity to your location"
                  : "Hand-picked premium rooms for the discerning renter"}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center w-full gap-4">
            <div className="relative flex flex-wrap items-start justify-center w-full gap-4 md:gap-6 lg:gap-8">
              {/* Loading overlay when fetching new page */}
              {isLoadingPage && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
                  <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-lg border border-gray-200">
                    <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                    <span className="text-sm font-medium text-gray-700">
                      Loading new page...
                    </span>
                  </div>
                </div>
              )}

              <div
                className={`contents transition-opacity duration-300 ${
                  isLoadingPage
                    ? "opacity-30 pointer-events-none"
                    : "opacity-100"
                }`}
              >
                {vipRooms?.data
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
              </div>

              {/* VIP Pagination - Always show when we have more than 1 page */}
              {vipRooms && vipRooms.totalPages > 1 && (
                <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
                  <button
                    onClick={() =>
                      handleVipPagination(Math.max(0, displayPage - 1))
                    }
                    disabled={displayPage === 0 || isLoadingPage}
                    className={`group flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 ${
                      displayPage === 0 || isLoadingPage
                        ? "bg-gradient-to-r from-gray-200 to-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-blue-500/30"
                    }`}
                  >
                    {isLoadingPage &&
                    optimisticPage === Math.max(0, displayPage - 1) ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <BiChevronLeft
                        size={20}
                        className="transition-transform group-hover:-translate-x-1"
                      />
                    )}
                    <span className="hidden sm:inline">Previous</span>
                  </button>

                  <div className="flex flex-col items-center px-6 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm">
                    <span className="text-lg font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                      Page {displayPage + 1} / {vipRooms.totalPages}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">
                      {vipRooms.totalRecords} premium rooms
                      {isUsingLocationData && " (location-sorted)"}
                      {isLoadingPage && " (loading...)"}
                    </span>
                  </div>

                  <button
                    onClick={() =>
                      handleVipPagination(
                        Math.min(vipRooms.totalPages - 1, displayPage + 1)
                      )
                    }
                    disabled={
                      displayPage + 1 >= vipRooms.totalPages || isLoadingPage
                    }
                    className={`group flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 ${
                      displayPage + 1 >= vipRooms.totalPages || isLoadingPage
                        ? "bg-gradient-to-r from-gray-200 to-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-blue-500/30"
                    }`}
                  >
                    <span className="hidden sm:inline">Next</span>
                    {isLoadingPage &&
                    optimisticPage ===
                      Math.min(vipRooms.totalPages - 1, displayPage + 1) ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <BiChevronRight
                        size={20}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Normal Rooms Section - Commented out, moved to index.tsx for proper positioning */}
      {/* 
      {shouldShowNormalRooms && (
        <NormalRoomsDisplay
          rooms={normalRooms}
          favoriteIds={initialFavoriteIds}
          currentPage={pageNormal || 0}
          hasGuestData={hasGuestData}
          location={location}
        />
      )}
      */}
    </div>
  );
}
