"use client";
import { useEffect, useState } from "react";
import { useCompareStore } from "../../stores/CompareStore";
import HeaderUserDashboard from "../user-dashboard/components/HeaderUserDashboard";
import ListingComparisonDisplay from "../users/components/compare/ListingComparisonDisplay";
import Footer from "../users/components/Footer";
import { Scale, Home, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import RoomDetail from "../landlord/components/room-detail/RoomDetail";
import { getRoomById } from "@/services/RoomService";

export default function ComparePage() {
  const { items, removeItem, clearItems } = useCompareStore((state) => state);
  const router = useRouter();

  const [room1, setRoom1] = useState<RoomDetail | null>(null);
  const [room2, setRoom2] = useState<RoomDetail | null>(null);

  useEffect(() => {
    if (items.length > 0) {
      const fetchRooms = async () => {
        const room1Data = await getRoomById(items[0]?.room.id);
        const room2Data = await getRoomById(items[1]?.room.id);
        setRoom1(room1Data);
        setRoom2(room2Data);
      };
      fetchRooms();
    }
  }, [items]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header for the comparison page */}
      <HeaderUserDashboard />

      <main className="flex-grow pt-20 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section with Better Styling */}
          <div className="mb-8 text-center">
            <div className="flex justify-center items-center gap-3 mb-4">
              <div className="p-3 bg-blue-500 rounded-full shadow-lg">
                <Scale className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Room Comparison
              </h1>
            </div>
            <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
              Compare room features, prices, and amenities side by side to make
              the best choice for your needs.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Search</span>
            </button>

            {items.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Home className="w-4 h-4" />
                <span>
                  {items.length} room{items.length !== 1 ? "s" : ""} selected
                </span>
                {items.length > 0 && (
                  <button
                    onClick={clearItems}
                    className="ml-2 px-3 py-1 text-xs bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors duration-200"
                  >
                    Clear All
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Enhanced Empty State */}
          {items.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="p-6 bg-gray-50 rounded-full mb-6">
                <Scale className="w-12 h-12 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                No Rooms to Compare
              </h2>
              <p className="text-gray-600 text-center max-w-md mb-6">
                Start by adding rooms to your comparison list while browsing.
                You can compare up to 2 rooms at a time.
              </p>
              <button
                onClick={() => router.push("/users")}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Browse Rooms
              </button>
            </div>
          )}

          {/* Enhanced Single Item State */}
          {items.length === 1 && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-amber-100 rounded-full">
                    <Home className="w-5 h-5 text-amber-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-amber-800">
                    One Room Selected
                  </h2>
                </div>
                <p className="text-amber-700">
                  Add one more room to start comparing features and prices.
                </p>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">
                      {items[0]?.room?.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {items[0]?.room?.priceMonth?.toLocaleString("vi-VN")}{" "}
                      VND/month
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(items[0]?.room?.id)}
                    className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors duration-200"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Comparison Display */}
          {items.length >= 2 && (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              <ListingComparisonDisplay
                listing1={room1 || undefined}
                listing2={room2 || undefined}
              />
            </div>
          )}

          {/* Additional rooms notice */}
          {items.length > 2 && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center gap-2 text-blue-700">
                <div className="p-1 bg-blue-100 rounded-full">
                  <Scale className="w-4 h-4" />
                </div>
                <p className="text-sm font-medium">
                  You have {items.length - 2} more room
                  {items.length - 2 !== 1 ? "s" : ""} in your comparison list.
                </p>
              </div>
              <p className="text-blue-600 text-xs mt-1 ml-7">
                Only the first 2 rooms are shown in the comparison. Remove rooms
                to compare different ones.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
