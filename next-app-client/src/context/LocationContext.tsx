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

  // Room data for logged-in users (with session)
  userRooms: {
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
  setUserRooms: (
    rooms: {
      vipRooms: PaginatedResponse<RoomInUser>;
      normalRooms: PaginatedResponse<RoomInUser>;
    } | null
  ) => void;
  // clearGuestRooms: () => void;
  // clearUserRooms: () => void;
  // clearAllRooms: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(
  undefined
);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocationState] = useState<LocationData | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [guestRooms, setGuestRooms] = useState<{
    vipRooms: PaginatedResponse<RoomInUser> | null;
    normalRooms: PaginatedResponse<RoomInUser> | null;
  } | null>(null);

  const [userRooms, setUserRooms] = useState<{
    vipRooms: PaginatedResponse<RoomInUser> | null;
    normalRooms: PaginatedResponse<RoomInUser> | null;
  } | null>(null);

  const setLocation = (newLocation: LocationData | null) => {
    // console.log("🌍 LocationContext.setLocation called:", newLocation);
    setLocationState(newLocation);
  };

  // const clearGuestRooms = () => {
  //   setGuestRooms(null);
  // };

  // const clearUserRooms = () => {
  //   setUserRooms(null);
  // };

  // const clearAllRooms = () => {
  //   setGuestRooms(null);
  //   setUserRooms(null);
  // };

  // console.log("LocationContext location:", location);
  return (
    <LocationContext.Provider
      value={{
        location,
        isSearching,
        guestRooms,
        userRooms,
        setLocation,
        setIsSearching,
        setGuestRooms,
        setUserRooms,
        // clearGuestRooms,
        // clearUserRooms,
        // clearAllRooms,
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
