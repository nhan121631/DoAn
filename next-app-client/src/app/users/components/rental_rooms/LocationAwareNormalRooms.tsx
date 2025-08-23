"use client";

import { useLocationContext } from "@/context/LocationContext";
import { PaginatedResponse, RoomInUser } from "@/types/types";
import NormalRoomsDisplay from "./NormalRoomsDisplay";

interface LocationAwareNormalRoomsProps {
  initialNormalRooms: PaginatedResponse<RoomInUser>;
  initialFavoriteIds: string[];
  currentPage: number;
  isEmptyFilter: boolean;
}

export default function LocationAwareNormalRooms({
  initialNormalRooms,
  initialFavoriteIds,
  currentPage,
  isEmptyFilter,
}: LocationAwareNormalRoomsProps) {
  const { location, guestRooms } = useLocationContext();

  const hasGuestData = !!(guestRooms && location); // Context data from guest search

  // Use guest rooms from context if available (for guest users with location search),
  // or use initial data for default display
  const normalRooms = hasGuestData
    ? guestRooms.normalRooms
    : initialNormalRooms;

  // Only show when no filters are applied and we have rooms
  if (!isEmptyFilter || !normalRooms) {
    return null;
  }

  return (
    <NormalRoomsDisplay
      rooms={normalRooms as PaginatedResponse<RoomInUser>}
      favoriteIds={initialFavoriteIds}
      currentPage={currentPage}
      hasGuestData={hasGuestData}
      location={location}
    />
  );
}
