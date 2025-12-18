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
                So sánh phòng
              </h1>
            </div>
            <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
              So sánh các đặc điểm, giá cả và tiện nghi của phòng để lựa chọn
              phù hợp nhất với nhu cầu của bạn.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại tìm kiếm</span>
            </button>

            {items.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Home className="w-4 h-4" />
                <span>Đã chọn {items.length} phòng</span>
                {items.length > 0 && (
                  <button
                    onClick={clearItems}
                    className="ml-2 px-3 py-1 text-xs bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors duration-200"
                  >
                    Xóa tất cả
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
                Chưa có phòng để so sánh
              </h2>
              <p className="text-gray-600 text-center max-w-md mb-6">
                Hãy thêm phòng vào danh sách so sánh khi bạn duyệt. Bạn có thể
                so sánh tối đa 2 phòng cùng lúc.
              </p>
              <button
                onClick={() => router.push("/users")}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Xem danh sách phòng
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
                    Đã chọn 1 phòng
                  </h2>
                </div>
                <p className="text-amber-700">
                  Hãy thêm 1 phòng nữa để bắt đầu so sánh đặc điểm và giá cả.
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
                      VNĐ/tháng
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(items[0]?.room?.id)}
                    className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors duration-200"
                  >
                    Xóa
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
                  Bạn còn {items.length - 2} phòng nữa trong danh sách so sánh.
                </p>
              </div>
              <p className="text-blue-600 text-xs mt-1 ml-7">
                Chỉ hiển thị 2 phòng đầu tiên để so sánh. Hãy xóa bớt phòng để
                so sánh phòng khác.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
