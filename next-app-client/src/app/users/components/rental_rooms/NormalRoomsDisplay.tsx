"use client";

import { PaginatedResponse, RoomInUser } from "@/types/types";
import RoomCard from "../rooms/RoomCard";
import Link from "next/link";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";

interface NormalRoomsDisplayProps {
  rooms: PaginatedResponse<RoomInUser>;
  favoriteIds: string[];
  currentPage: number;
  hasGuestData?: boolean;
  location?: { address: string } | null;
}

export default function NormalRoomsDisplay({
  rooms,
  favoriteIds,
  currentPage,
  hasGuestData = false,
  location = null,
}: NormalRoomsDisplayProps) {
  return (
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
        {rooms.data
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
                isFavorite={favoriteIds.includes(room.id)}
              />
            </div>
          ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-4 mt-8">
        {/* Previous Button */}
        <Link
          href={`?pageNormal=${currentPage - 1}`}
          scroll={false}
          className={`group flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 ${
            currentPage === 0
              ? "bg-gradient-to-r from-gray-200 to-gray-300 text-gray-500 cursor-not-allowed pointer-events-none"
              : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-blue-500/30"
          }`}
          aria-disabled={currentPage === 0}
        >
          <BiChevronLeft
            size={22}
            className="transition-transform group-hover:-translate-x-1"
          />
          <span className="hidden sm:inline font-medium">Previous</span>
        </Link>

        {/* Page Info */}
        <div className="flex flex-col items-center px-6 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm">
          <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
            Page {currentPage + 1} / {rooms.totalPages}
          </span>
          <span className="text-xs text-gray-500 font-medium">
            {rooms.totalRecords} featured rooms
          </span>
        </div>

        {/* Next Button */}
        <Link
          href={`?pageNormal=${currentPage + 1}`}
          scroll={false}
          className={`group flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 ${
            currentPage + 1 >= rooms.totalPages
              ? "bg-gradient-to-r from-gray-200 to-gray-300 text-gray-500 cursor-not-allowed pointer-events-none"
              : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-blue-500/30"
          }`}
          aria-disabled={currentPage + 1 >= rooms.totalPages}
        >
          <span className="hidden sm:inline font-medium">Next</span>
          <BiChevronRight
            size={22}
            className="transition-transform group-hover:translate-x-1"
          />
        </Link>
      </div>
    </div>
  );
}
