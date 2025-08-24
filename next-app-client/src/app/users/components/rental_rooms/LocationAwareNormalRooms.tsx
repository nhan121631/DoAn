"use client";

import { useLocationContext } from "@/context/LocationContext";
import { PaginatedResponse, RoomInUser } from "@/types/types";
import NormalRoomsDisplay from "./NormalRoomsDisplay";
import { useSession } from "next-auth/react";

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
  const { data: session } = useSession();
  const { location, guestRooms, userRooms } = useLocationContext();

  const isGuestUser = !session?.user?.userProfile?.id;
  const hasGuestData = !!(guestRooms && location); // Context data from guest search
  const hasUserData = !!(userRooms && location); // Context data from user search

  // Use rooms from context if available (for location search - both guest and user),
  // or use initial data for default display
  const normalRooms = isGuestUser
    ? hasGuestData
      ? guestRooms.normalRooms
      : initialNormalRooms
    : hasUserData
    ? userRooms.normalRooms
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
      hasGuestData={hasGuestData || hasUserData}
      location={location}
    />
  );
}
