"use client";

import { useLocationContext } from "@/context/LocationContext";
import { PaginatedResponse, RoomInUser } from "@/types/types";
import RoomCard from "../rooms/RoomCard";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  getRoomNormalWithLocation,
  getRoomNormalUser,
} from "@/services/RoomService";

interface LocationAwareNormalRoomsProps {
  initialNormalRooms: PaginatedResponse<RoomInUser>;
  initialFavoriteIds: string[];
  currentPage: number;
  isEmptyFilter: boolean;
  userId?: string;
}

export default function LocationAwareNormalRooms({
  initialNormalRooms,
  initialFavoriteIds,
  currentPage,
  isEmptyFilter,
  userId,
}: LocationAwareNormalRoomsProps) {
  // Debug log to check userId
  console.log("🔧 LocationAwareNormalRooms - userId prop:", userId);

  const router = useRouter();
  const { data: session } = useSession();
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const [optimisticPage, setOptimisticPage] = useState<number | null>(null);
  const [paginatedNormalRooms, setPaginatedNormalRooms] =
    useState<PaginatedResponse<RoomInUser> | null>(null);
  const { location, guestRooms, userRooms } = useLocationContext();

  const isGuestUser = !userId;
  const hasGuestData = !!(guestRooms && location); // Context data from guest search
  const hasUserData = !!(userRooms && location); // Context data from user search

  // Reset URL pagination when switching to location-based data
  useEffect(() => {
    if ((hasGuestData || hasUserData) && currentPage !== 0) {
      // Reset URL to page 0 when location data is available but URL shows different page
      const currentParams = new URLSearchParams(window.location.search);
      currentParams.set("pageNormal", "0");
      router.push(`?${currentParams.toString()}`, { scroll: false });
    }
  }, [hasGuestData, hasUserData, currentPage, router]);

  // Handle pagination for normal rooms
  const handleNormalPagination = async (newPage: number) => {
    console.log("🔄 Normal Pagination triggered:", {
      newPage,
      hasGuestData,
      hasUserData,
      location: !!location,
      userId: userId,
    });

    // Immediately set optimistic page and loading state
    setOptimisticPage(newPage);
    setIsLoadingPage(true);

    // Update URL immediately for better UX
    const currentParams = new URLSearchParams(window.location.search);
    currentParams.set("pageNormal", newPage.toString());
    router.push(`?${currentParams.toString()}`, { scroll: false });

    try {
      let newNormalRooms: PaginatedResponse<RoomInUser> | null = null;

      if ((hasGuestData || hasUserData) && location) {
        // For location-based data, fetch new data with coordinates
        console.log(
          "🌍 Using location-based API with coords:",
          location.lat,
          location.lng
        );
        newNormalRooms = await getRoomNormalWithLocation(
          newPage,
          6,
          location.lat,
          location.lng
        );
      } else {
        // For non-location data, fetch regular normal rooms
        console.log("👤 Using regular API with userId:", userId);
        newNormalRooms = await getRoomNormalUser(newPage, 6, userId);
      }

      if (newNormalRooms) {
        // Store paginated data in local state
        setPaginatedNormalRooms(newNormalRooms);
      }
    } catch (error) {
      console.error("Error fetching normal rooms:", error);
      // Reset optimistic page on error
      setOptimisticPage(null);
    } finally {
      // Always reset loading state
      setIsLoadingPage(false);
      // Keep optimistic page until next navigation
    }
  };

  // Use rooms from context if available (for location search - both guest and user),
  // or use initial data for default display
  // Use paginated data if available (from client-side pagination)
  const normalRooms =
    paginatedNormalRooms ||
    (isGuestUser
      ? hasGuestData
        ? guestRooms.normalRooms
        : initialNormalRooms
      : hasUserData
      ? userRooms.normalRooms
      : initialNormalRooms);

  // Calculate effective current page - always 0 when using location data
  const effectiveCurrentPage = hasGuestData || hasUserData ? 0 : currentPage;

  // Use optimistic page if available, otherwise use effective page
  const displayPage =
    optimisticPage !== null ? optimisticPage : effectiveCurrentPage;

  // Reset paginated data when context changes
  useEffect(() => {
    setPaginatedNormalRooms(null);
    setOptimisticPage(null);
  }, [guestRooms, userRooms, location]);

  // Only show when no filters are applied and we have rooms
  if (!isEmptyFilter || !normalRooms) {
    return null;
  }

  // Debug logs (commented out for production)
  // console.log("🔧 LocationAwareNormalRooms Debug:");
  // console.log("- hasGuestData:", hasGuestData);
  // console.log("- hasUserData:", hasUserData);
  // console.log("- currentPage from URL:", currentPage);
  // console.log("- effectiveCurrentPage:", effectiveCurrentPage);
  // console.log("- displayPage:", displayPage);
  // console.log("- optimisticPage:", optimisticPage);
  // console.log("- normalRooms.totalPages:", normalRooms?.totalPages);
  // console.log("- normalRooms.totalRecords:", normalRooms?.totalRecords);
  // console.log("- normalRooms.data.length:", normalRooms?.data?.length);
  // console.log("- Should show pagination:", normalRooms?.totalPages > 1);

  return (
    <div className="flex flex-col items-center justify-center w-full gap-4 px-2 sm:px-4 my-6 max-w-7xl">
      <div className="text-center space-y-6 mb-16">
        <h3 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-blue-600 bg-clip-text text-transparent">
          Featured Properties
        </h3>
        {(hasGuestData || hasUserData) && location && (
          <div className="text-sm text-blue-600 mt-2 flex items-center justify-center gap-2">
            <span className="bg-blue-100 px-4 py-2 rounded-full font-medium">
              📍 Sorted by distance from: {location.address}
            </span>
          </div>
        )}
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          {hasGuestData || hasUserData
            ? "Quality rentals sorted by proximity to your selected location"
            : "Discover our most popular and highly-rated rental properties"}
        </p>
      </div>

      <div className="relative">
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
          id="normal-rooms-list"
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-4 w-full transition-opacity duration-300 ${
            isLoadingPage ? "opacity-30 pointer-events-none" : "opacity-100"
          }`}
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
      </div>

      <div className="flex flex-col items-center justify-center gap-4 mt-8">
        <div className="flex items-center justify-center gap-4">
          {/* Previous Button */}
          <button
            onClick={() => handleNormalPagination(Math.max(0, displayPage - 1))}
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
                size={22}
                className="transition-transform group-hover:-translate-x-1"
              />
            )}
            <span className="hidden sm:inline font-medium">Previous</span>
          </button>

          {/* Page Info */}
          <div className="flex flex-col items-center px-6 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm">
            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              Page {displayPage + 1} / {normalRooms.totalPages || 1}
            </span>
            <span className="text-xs text-gray-500 font-medium">
              {normalRooms.totalRecords || normalRooms.data.length} featured
              rooms
              {(hasGuestData || hasUserData) && " (location-sorted)"}
              {isLoadingPage && " (loading...)"}
            </span>
          </div>

          {/* Next Button */}
          <button
            onClick={() =>
              handleNormalPagination(
                Math.min((normalRooms.totalPages || 1) - 1, displayPage + 1)
              )
            }
            disabled={
              displayPage + 1 >= (normalRooms.totalPages || 1) || isLoadingPage
            }
            className={`group flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 ${
              displayPage + 1 >= (normalRooms.totalPages || 1) || isLoadingPage
                ? "bg-gradient-to-r from-gray-200 to-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-blue-500/30"
            }`}
          >
            <span className="hidden sm:inline font-medium">Next</span>
            {isLoadingPage &&
            optimisticPage ===
              Math.min((normalRooms.totalPages || 1) - 1, displayPage + 1) ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <BiChevronRight
                size={22}
                className="transition-transform group-hover:translate-x-1"
              />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
