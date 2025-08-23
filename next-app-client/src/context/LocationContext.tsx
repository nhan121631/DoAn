"use client";

import { createContext, useContext, useState, ReactNode } from "react";

// Type definitions
interface PaginatedResponse<T> {
  data: T[];
  totalRecords: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

interface RoomInUser {
  id: string;
  title: string;
  description: string;
  price: number;
  area: number;
  address: string;
  images: string[];
  // ... other room properties
}

interface LocationData {
  lat: number;
  lng: number;
  address: string;
}

interface LocationContextType {
  // Location state
  location: LocationData | null;
  isSearching: boolean;

  // Room data for guest users (no session)
  guestRooms: {
    vipRooms: PaginatedResponse<RoomInUser> | null;
    normalRooms: PaginatedResponse<RoomInUser> | null;
  } | null;

  // Actions
  setLocation: (location: LocationData | null) => void;
  setIsSearching: (searching: boolean) => void;
  setGuestRooms: (
    rooms: {
      vipRooms: PaginatedResponse<RoomInUser>;
      normalRooms: PaginatedResponse<RoomInUser>;
    } | null
  ) => void;
  clearGuestRooms: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(
  undefined
);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [guestRooms, setGuestRooms] = useState<{
    vipRooms: PaginatedResponse<RoomInUser> | null;
    normalRooms: PaginatedResponse<RoomInUser> | null;
  } | null>(null);

  const clearGuestRooms = () => {
    setGuestRooms(null);
  };

  return (
    <LocationContext.Provider
      value={{
        location,
        isSearching,
        guestRooms,
        setLocation,
        setIsSearching,
        setGuestRooms,
        clearGuestRooms,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocationContext() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error(
      "useLocationContext must be used within a LocationProvider"
    );
  }
  return context;
}
