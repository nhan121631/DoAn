import { Slide } from "@/app/landlord/components/room-detail/Slide";
import { Convenient, RoomDetail } from "@/types/types";
import BookingForm from "@/app/landlord/components/booking-room/BookingForm";
import {
  Bed,
  Car,
  CheckCircle,
  ChefHat,
  Clock,
  DollarSign,
  Droplets,
  FileText,
  Key,
  Layers,
  MapPin,
  Package,
  Refrigerator,
  Ruler,
  Shield,
  Square,
  Users,
  Wind,
  X,
  Zap,
} from "lucide-react";

import { PiElevatorLight } from "react-icons/pi";

// Enhanced amenities with better labels and icons
const allPossibleConvenients = [
  { key: "furnished", label: "Furnished", icon: Package },
  { key: "washing_machine", label: "Washing Machine", icon: Package },
  { key: "no_curfew", label: "No Curfew", icon: Clock },
  { key: "mezzanine", label: "Mezzanine", icon: Layers },
  { key: "fridge", label: "Refrigerator", icon: Refrigerator },
  { key: "kitchen_shelf", label: "Kitchen Shelf", icon: ChefHat },
  { key: "aircon", label: "Air Conditioning", icon: Wind },
  { key: "private_entry", label: "Private Entry", icon: Key },
  { key: "elevator", label: "Elevator", icon: PiElevatorLight },
  { key: "security_24h", label: "24h Security", icon: Shield },
  { key: "garage", label: "Garage", icon: Car },
];

export default function ListingComparisonDisplay({
  listing1,
  listing2,
}: {
  listing1?: RoomDetail;
  listing2?: RoomDetail;
}) {
  // Enhanced empty state
  if (!listing1 || !listing2) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl shadow-lg border border-blue-200">
        <div className="p-4 mb-6 bg-blue-500 rounded-full shadow-lg">
          <Bed className="w-8 h-8 text-white" />
        </div>
        <div className="max-w-md px-6 text-center">
          <h3 className="mb-3 text-2xl font-bold text-blue-800">
            Ready to Compare Rooms?
          </h3>
          <p className="leading-relaxed text-blue-600">
            Select two rooms from your search results to see a detailed
            side-by-side comparison of features, prices, and amenities.
          </p>
        </div>
      </div>
    );
  }

  const isAmenityEnabled = (
    listingAmenities: Convenient[] | undefined,
    amenityKey: string
  ) => {
    if (!Array.isArray(listingAmenities)) return false;
    return listingAmenities.some((a) => a.name === amenityKey);
  };

  const formatAddress = (listing: RoomDetail) => {
    return [
      listing.address.street,
      listing.address.ward.name,
      listing.address.ward.district.name,
      listing.address.ward.district.province.name,
    ]
      .filter(Boolean)
      .join(", ");
  };

  return (
    <div className="mx-auto max-w-7xl">
      {/* Room Titles with Enhanced Styling */}
      <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-2">
        <div className="p-6 text-white shadow-lg bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-white/20">
              <Bed className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium opacity-90">Room 1</span>
          </div>
          <h2 className="text-xl font-bold truncate">{listing1.title}</h2>
        </div>
        <div className="p-6 text-white shadow-lg bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-white/20">
              <Bed className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium opacity-90">Room 2</span>
          </div>
          <h2 className="text-xl font-bold truncate">{listing2.title}</h2>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-2">
        <div className="relative group">
          <div className="overflow-hidden bg-white border border-gray-200 shadow-lg rounded-2xl">
            <div
              className="relative"
              style={{
                height: "auto",
                overflowY: "auto",
                scrollbarWidth: "none",
              }}
            >
              <Slide
                images={
                  Array.isArray(listing1.images)
                    ? listing1.images.filter(
                        (img) => img && typeof img.url === "string"
                      )
                    : []
                }
                address={formatAddress(listing1)}
              />
              <style jsx>{`
                div::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="overflow-hidden bg-white border border-gray-200 shadow-lg rounded-2xl">
            <div
              className="relative"
              style={{
                height: "auto",
                overflowY: "auto",
                scrollbarWidth: "none",
              }}
            >
              {listing2.images && listing2.images.length > 0 ? (
                <Slide
                  images={
                    Array.isArray(listing2.images)
                      ? listing2.images.filter(
                          (img) => img && typeof img.url === "string"
                        )
                      : []
                  }
                  address={formatAddress(listing2)}
                />
              ) : (
                <div className="flex flex-col items-center justify-center w-full h-full text-gray-500 bg-gradient-to-br from-gray-100 to-gray-200">
                  <Package className="w-12 h-12 mb-3 opacity-50" />
                  <p className="text-lg font-medium">No Images Available</p>
                  <p className="text-sm">Images will appear here</p>
                </div>
              )}
              <style jsx>{`
                div::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Forms */}
      <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-2">
        <div className="p-6 border border-blue-200 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl">
          <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold text-blue-800">
            <Bed className="w-5 h-5" />
            Book Room 1
          </h3>
          <BookingForm
            roomId={listing1.id}
            roomTitle={listing1.title || "Room for rent"}
            priceMonth={listing1.priceMonth || 0}
          />
        </div>
        <div className="p-6 border border-purple-200 shadow-lg bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl">
          <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold text-purple-800">
            <Bed className="w-5 h-5" />
            Book Room 2
          </h3>
          <BookingForm
            roomId={listing2.id}
            roomTitle={listing2.title || "Room for rent"}
            priceMonth={listing2.priceMonth || 0}
          />
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-hidden bg-white border border-gray-200 shadow-lg rounded-2xl">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <h3 className="text-xl font-bold text-gray-800">
            Detailed Comparison
          </h3>
        </div>

        <div className="p-6">
          {/* Mobile-friendly comparison layout */}
          <div className="space-y-6">
            {/* Price Comparison */}
            <div className="grid grid-cols-1 gap-4 p-4 border border-green-200 md:grid-cols-3 bg-green-50 rounded-xl">
              <div className="flex items-center gap-2 font-semibold text-gray-800 md:col-span-1">
                <DollarSign className="w-5 h-5 text-green-600" />
                Monthly Price
              </div>
              <div className="md:col-span-1">
                <div className="text-lg font-bold text-green-700">
                  {typeof listing1.priceMonth === "number" ? (
                    <>₫{listing1.priceMonth.toLocaleString("vi-VN")}</>
                  ) : (
                    <span className="text-gray-500">N/A</span>
                  )}
                </div>
                <div className="mt-1 text-xs text-green-600">Room 1</div>
              </div>
              <div className="md:col-span-1">
                <div className="text-lg font-bold text-green-700">
                  {typeof listing2.priceMonth === "number" ? (
                    <>₫{listing2.priceMonth.toLocaleString("vi-VN")}</>
                  ) : (
                    <span className="text-gray-500">N/A</span>
                  )}
                </div>
                <div className="mt-1 text-xs text-green-600">Room 2</div>
              </div>
            </div>

            {/* Area Comparison */}
            <div className="grid grid-cols-1 gap-4 p-4 border border-blue-200 md:grid-cols-3 bg-blue-50 rounded-xl">
              <div className="flex items-center gap-2 font-semibold text-gray-800 md:col-span-1">
                <Square className="w-5 h-5 text-blue-600" />
                Area
              </div>
              <div className="md:col-span-1">
                <div className="text-lg font-semibold text-blue-700">
                  {listing1.area} m²
                </div>
                <div className="mt-1 text-xs text-blue-600">Room 1</div>
              </div>
              <div className="md:col-span-1">
                <div className="text-lg font-semibold text-blue-700">
                  {listing2.area ? `${listing2.area} m²` : "N/A"}
                </div>
                <div className="mt-1 text-xs text-blue-600">Room 2</div>
              </div>
            </div>

            {/* Room Dimensions */}
            <div className="grid grid-cols-1 gap-4 p-4 border border-indigo-200 md:grid-cols-3 bg-indigo-50 rounded-xl">
              <div className="flex items-center gap-2 font-semibold text-gray-800 md:col-span-1">
                <Ruler className="w-5 h-5 text-indigo-600" />
                Dimensions
              </div>
              <div className="md:col-span-1">
                <div className="space-y-1 text-sm font-semibold text-indigo-700">
                  <div>
                    Length:{" "}
                    {listing1.roomLength ? `${listing1.roomLength}m` : "N/A"}
                  </div>
                  <div>
                    Width:{" "}
                    {listing1.roomWidth ? `${listing1.roomWidth}m` : "N/A"}
                  </div>
                </div>
                <div className="mt-1 text-xs text-indigo-600">Room 1</div>
              </div>
              <div className="md:col-span-1">
                <div className="space-y-1 text-sm font-semibold text-indigo-700">
                  <div>
                    Length:{" "}
                    {listing2.roomLength ? `${listing2.roomLength}m` : "N/A"}
                  </div>
                  <div>
                    Width:{" "}
                    {listing2.roomWidth ? `${listing2.roomWidth}m` : "N/A"}
                  </div>
                </div>
                <div className="mt-1 text-xs text-indigo-600">Room 2</div>
              </div>
            </div>

            {/* Max People */}
            <div className="grid grid-cols-1 gap-4 p-4 border md:grid-cols-3 bg-cyan-50 rounded-xl border-cyan-200">
              <div className="flex items-center gap-2 font-semibold text-gray-800 md:col-span-1">
                <Users className="w-5 h-5 text-cyan-600" />
                Max People
              </div>
              <div className="md:col-span-1">
                <div className="text-lg font-semibold text-cyan-700">
                  {listing1.maxPeople ? `${listing1.maxPeople} people` : "N/A"}
                </div>
                <div className="mt-1 text-xs text-cyan-600">Room 1</div>
              </div>
              <div className="md:col-span-1">
                <div className="text-lg font-semibold text-cyan-700">
                  {listing2.maxPeople ? `${listing2.maxPeople} people` : "N/A"}
                </div>
                <div className="mt-1 text-xs text-cyan-600">Room 2</div>
              </div>
            </div>

            {/* Utility Costs */}
            <div className="grid grid-cols-1 gap-4 p-4 border border-yellow-200 md:grid-cols-3 bg-yellow-50 rounded-xl">
              <div className="flex items-center gap-2 font-semibold text-gray-800 md:col-span-1">
                <Zap className="w-5 h-5 text-yellow-600" />
                <Droplets className="w-5 h-5 ml-1 text-blue-400" />
                Utility Costs
              </div>
              <div className="md:col-span-1">
                <div className="space-y-1 text-sm font-semibold text-gray-700">
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-yellow-500" />
                    Electricity:{" "}
                    {listing1.elecPrice
                      ? `₫${listing1.elecPrice.toLocaleString("vi-VN")}/kWh`
                      : "Per bill"}
                  </div>
                  <div className="flex items-center gap-1">
                    <Droplets className="w-3 h-3 text-blue-500" />
                    Water:{" "}
                    {listing1.waterPrice
                      ? `₫${listing1.waterPrice.toLocaleString("vi-VN")}/m³`
                      : "Per bill"}
                  </div>
                </div>
                <div className="mt-1 text-xs text-yellow-600">Room 1</div>
              </div>
              <div className="md:col-span-1">
                <div className="space-y-1 text-sm font-semibold text-gray-700">
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-yellow-500" />
                    Electricity:{" "}
                    {listing2.elecPrice
                      ? `₫${listing2.elecPrice.toLocaleString("vi-VN")}/kWh`
                      : "Per bill"}
                  </div>
                  <div className="flex items-center gap-1">
                    <Droplets className="w-3 h-3 text-blue-500" />
                    Water:{" "}
                    {listing2.waterPrice
                      ? `₫${listing2.waterPrice.toLocaleString("vi-VN")}/m³`
                      : "Per bill"}
                  </div>
                </div>
                <div className="mt-1 text-xs text-yellow-600">Room 2</div>
              </div>
            </div>

            {/* Location Comparison */}
            <div className="grid grid-cols-1 gap-4 p-4 border border-purple-200 md:grid-cols-3 bg-purple-50 rounded-xl">
              <div className="flex items-center gap-2 font-semibold text-gray-800 md:col-span-1">
                <MapPin className="w-5 h-5 text-purple-600" />
                Location
              </div>
              <div className="md:col-span-1">
                <div className="text-sm leading-relaxed text-gray-700">
                  {formatAddress(listing1)}
                </div>
                <div className="mt-1 text-xs text-purple-600">Room 1</div>
              </div>
              <div className="md:col-span-1">
                <div className="text-sm leading-relaxed text-gray-700">
                  {formatAddress(listing2)}
                </div>
                <div className="mt-1 text-xs text-purple-600">Room 2</div>
              </div>
            </div>

            {/* Description Comparison */}
            <div className="grid grid-cols-1 gap-4 p-4 border border-orange-200 md:grid-cols-3 bg-orange-50 rounded-xl">
              <div className="flex items-center gap-2 font-semibold text-gray-800 md:col-span-1">
                <FileText className="w-5 h-5 text-orange-600" />
                Description
              </div>
              <div className="md:col-span-1">
                <div className="text-sm leading-relaxed text-gray-700 line-clamp-3">
                  {listing1.description}
                </div>
                <div className="mt-1 text-xs text-orange-600">Room 1</div>
              </div>
              <div className="md:col-span-1">
                <div className="text-sm leading-relaxed text-gray-700 line-clamp-3">
                  {listing2.description || (
                    <span className="italic text-gray-500">
                      No description available
                    </span>
                  )}
                </div>
                <div className="mt-1 text-xs text-orange-600">Room 2</div>
              </div>
            </div>
          </div>

          {/* Amenities Section */}
          <div className="mt-8">
            <div className="flex items-center gap-2 pb-3 mb-6 border-b border-gray-200">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Package className="w-5 h-5 text-gray-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-800">
                Amenities & Features
              </h4>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {allPossibleConvenients.map((amenity, index) => {
                console.log("listing1.convenients:", listing1.convenients);
                console.log("listing2.convenients:", listing2.convenients);
                const IconComponent = amenity.icon;
                const room1HasAmenity = isAmenityEnabled(
                  listing1.convenients,
                  amenity.key
                );
                const room2HasAmenity = isAmenityEnabled(
                  listing2.convenients,
                  amenity.key
                );

                return (
                  <div
                    key={index}
                    className="p-4 transition-shadow border border-gray-200 bg-gray-50 rounded-xl hover:shadow-md"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <IconComponent className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-800">
                        {amenity.label}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-center">
                        {room1HasAmenity ? (
                          <CheckCircle className="w-5 h-5 mx-auto text-green-500" />
                        ) : (
                          <X className="w-5 h-5 mx-auto text-red-400" />
                        )}
                        <div className="mt-1 text-xs text-gray-500">Room 1</div>
                      </div>

                      <div className="text-center">
                        {listing2.id && room2HasAmenity ? (
                          <CheckCircle className="w-5 h-5 mx-auto text-green-500" />
                        ) : listing2.id ? (
                          <X className="w-5 h-5 mx-auto text-red-400" />
                        ) : (
                          <div className="w-5 h-5 mx-auto bg-gray-300 rounded-full" />
                        )}
                        <div className="mt-1 text-xs text-gray-500">Room 2</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}