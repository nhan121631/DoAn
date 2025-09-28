"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import HeaderUserDashboard from "../user-dashboard/components/HeaderUserDashboard";
import RoomCard from "./components/CardRoomMap";
import Footer from "../users/components/Footer";
import SuggestAddressBar from "../users/components/Filter/SuggestAddressBar";
import { LocationProvider } from "@/context/LocationContext";

// Dynamic import for Map component to avoid SSR issues
const MapRoom = dynamic(() => import("./components/Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  ),
});

export interface RoomMap {
  id: string;
  title: string;
  imageUrl: string;
  area: number;
  priceMonth: number;
  postType: string;
  fullAddress: string;
  lng: number;
  lat: number;
}

export default function RoomMapPage() {
  const [rooms, setRooms] = useState<RoomMap[]>([]);
  const [view, setView] = useState<"room" | "map">("room");

  return (
    <LocationProvider>
      <div className="min-h-screen flex flex-col">
        <HeaderUserDashboard />

        {/* Responsive toggle for mobile */}
        <div className="block lg:hidden w-full bg-white z-99 sticky top-0">
          <div className="flex justify-center gap-1 py-2">
            <div className="relative flex bg-gray-100 rounded-full p-1 shadow-inner">
              {/* Background slider animation */}
              <div
                className={`absolute top-1 bottom-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-lg transition-all duration-300 ease-in-out ${
                  view === "room"
                    ? "left-1 w-[calc(50%-4px)]"
                    : "left-[calc(50%+2px)] w-[calc(50%-4px)]"
                }`}
              />

              <button
                className={`relative z-10 px-6 py-2.5 rounded-full font-semibold transition-all duration-300 ease-in-out flex items-center gap-2 min-w-[120px] justify-center hover:scale-105 active:scale-95 ${
                  view === "room"
                    ? "text-white shadow-sm"
                    : "text-gray-700 hover:text-blue-600"
                }`}
                onClick={() => setView("room")}
              >
                <span className="transform transition-transform duration-200 group-hover:scale-110">
                  📋
                </span>
                <span className="font-medium">Danh sách</span>
              </button>

              <button
                className={`relative z-10 px-6 py-2.5 rounded-full font-semibold transition-all duration-300 ease-in-out flex items-center gap-2 min-w-[120px] justify-center hover:scale-105 active:scale-95 ${
                  view === "map"
                    ? "text-white shadow-sm"
                    : "text-gray-700 hover:text-blue-600"
                }`}
                onClick={() => setView("map")}
              >
                <span className="transform transition-transform duration-200 group-hover:scale-110">
                  🗺️
                </span>
                <span className="font-medium">Bản đồ</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex justify-center items-center flex-1 w-full h-full ">
          <div className="flex gap-4 w-[1500px] h-full lg:flex-row flex-col">
            {/* Room List */}

            <div
              className={`flex flex-1 flex-col ${
                view === "map" ? "hidden" : ""
              } lg:block`}
            >
              {/* <div className="flex-shrink-0 mb-4">
              <h1 className="text-xl font-semibold text-gray-900">
                List Rooms {rooms.length > 0 && `(${rooms.length})`}
              </h1>
            </div> */}

              <div
                className="flex-1 overflow-y-auto space-y-3 pr-2"
                style={{
                  maxHeight: "calc(100vh - 100px)",
                }}
              >
                <div className="flex w-[750px]">
                  <SuggestAddressBar showSaveButton={true} width="100%" />
                </div>
                {rooms.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 py-20">
                    <div className="mb-6">
                      <svg
                        className="mx-auto h-16 w-16 text-gray-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m11 0a2 2 0 01-2 2H5a2 2 0 01-2-2m0 0V9a2 2 0 012-2h2m0 0V5a2 2 0 012-2h4a2 2 0 012 2v2M7 7h10m-5 3v8m0 0l-3-3m3 3l3-3"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Rooms will appear here when you select a location on the
                      map
                    </h3>
                    <p className="text-sm text-gray-500 max-w-sm">
                      Try moving and zooming on the map to find available rooms
                      in the area
                    </p>
                  </div>
                ) : (
                  rooms.map((room) => (
                    <RoomCard
                      key={room.id}
                      id={room.id}
                      title={room.title}
                      price={room.priceMonth}
                      area={room.area}
                      location={room.fullAddress}
                      imageUrl={room.imageUrl}
                      postType={room.postType}
                      onFavorite={() =>
                        console.log(`Favorited room ${room.id}`)
                      }
                      onClick={() => console.log(`Clicked room ${room.id}`)}
                    />
                  ))
                )}
                <Footer />
              </div>
            </div>

            {/* Map */}
            <div
              className={`flex-1 ${view === "room" ? "hidden" : ""} lg:block`}
            >
              <div
                className="w-full overflow-hidden shadow-lg border border-gray-200"
                style={{
                  height: "calc(100vh - 100px)",
                }}
              >
                <MapRoom onRoomClick={(room: RoomMap[]) => setRooms(room)} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </LocationProvider>
  );
}
