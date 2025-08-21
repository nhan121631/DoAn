import { Slide } from "@/app/landlord/components/room-detail/Slide";
import { Convenient, RoomInUser } from "@/types/types";
import React from "react";
import { BsCheckCircleFill } from "react-icons/bs";
import { FaTimesCircle } from "react-icons/fa";
import BookingForm from "@/app/landlord/components/booking-room/BookingForm";

const allPossibleConvenients = [
  { key: "furnished", label: "furnished" },
  { key: "washing_machine", label: "washing_machine" },
  { key: "no_curfew", label: "no_curfew" },
  { key: "mezzanine", label: "mezzanine" },
  { key: "fridge", label: "fridge" },
  { key: "kitchen_shelf", label: "kitchen_shelf" },
  { key: "aircon", label: "aircon" },
  { key: "private_entry", label: "private_entry" },
  { key: "elevator", label: "elevator" },
  { key: "security_24h", label: "security_24h" },
  { key: "garage", label: "garage" },
];
export default function ListingComparisonDisplay({
  listing1,
  listing2,
}: {
  listing1?: RoomInUser;
  listing2?: RoomInUser;
}) {
  // Nếu thiếu 1 trong 2 phòng thì hiển thị thông báo yêu cầu chọn đủ 2 phòng
  if (!listing1 || !listing2) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] bg-white rounded-xl shadow-md">
        <div className="mb-2 text-2xl font-bold text-red-500">
          You need to choose 2 rooms to compare!
        </div>
        <div className="text-gray-600">
          Please add at least 2 rooms to the comparison list to view details.
        </div>
      </div>
    );
  }
  // Sửa lại: so sánh với name trong conveniences
  const isAmenityEnabled = (
    listingAmenities: Convenient[] | undefined,
    amenityKey: string
  ) => {
    if (!Array.isArray(listingAmenities)) return false;
    return listingAmenities.some((a) => a.name === amenityKey);
  };

  console.log("Listing 1 Amenities:", listing1.conveniences);
  console.log("Listing 2 Amenities:", listing2.conveniences);

  return (
    <div className="p-6 mx-auto bg-white shadow-md w-350 rounded-xl">
      {/* Listing Titles */}
      <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2">
        <h2 className="text-xl font-semibold text-center text-red-500 md:text-left">
          {listing1.title}
        </h2>
        <h2 className="text-xl font-semibold text-center text-red-500 md:text-left">
          {listing2.title || "Select another listing to compare"}
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2">
        <div
          className="overflow-hidden rounded-lg"
          style={{
            maxHeight: "800px",
            minHeight: "200px",
            height: "650px",
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
            address={
              listing1.address.street +
                ", " +
                listing1.address.ward.name +
                ", " +
                listing1.address.ward.district.name +
                ", " +
                listing1.address.ward.district.province.name || ""
            }
          />
        </div>
        <div
          className="overflow-hidden rounded-lg"
          style={{
            maxHeight: "800px",
            minHeight: "200px",
            height: "650px",
            overflowY: "auto",
            scrollbarWidth: "none",
          }}
        >
          {listing2.images.length > 0 ? (
            <Slide
              images={
                Array.isArray(listing2.images)
                  ? listing2.images.filter(
                      (img) => img && typeof img.url === "string"
                    )
                  : []
              }
              address={
                listing2.address.street +
                  ", " +
                  listing2.address.ward.name +
                  ", " +
                  listing2.address.ward.district.name +
                  ", " +
                  listing2.address.ward.district.province.name || ""
              }
            />
          ) : (
            <div className="w-full h-[200px] md:h-[300px] bg-gray-200 flex items-center justify-center text-gray-500">
              No image available
            </div>
          )}
        </div>
      </div>
      <style jsx>{`
        .overflow-hidden::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div className="flex items-center justify-center w-full mb-6 gap-x-100">
  <div className="flex justify-end flex-1">
    <div className="w-full max-w-xs">
      <BookingForm
        roomId={listing1.id}
        roomTitle={listing1.title}
        priceMonth={listing1.priceMonth}
      />
    </div>
  </div>
  <div className="flex justify-start flex-1">
    <div className="w-full max-w-xs">
      <BookingForm
        roomId={listing2.id}
        roomTitle={listing2.title}
        priceMonth={listing2.priceMonth}
      />
    </div>
  </div>
</div>
      {/* Comparison Details Table */}
      <div className="grid  text-gray-700 [grid-template-columns:150px_1fr_1fr] gap-y-4 gap-x-6">
        {/* Header Row for Comparison Table */}
        <div className="pb-2 text-lg font-bold text-gray-900 border-b md:col-span-1">
          Feature
        </div>
        <div className="pb-2 text-lg font-bold text-center text-gray-900 border-b md:col-span-1 md:text-left">
          Listing 1
        </div>
        <div className="pb-2 text-lg font-bold text-center text-gray-900 border-b md:col-span-1 md:text-left">
          Listing 2
        </div>

        {/* Row 1: Price */}
        <div className="font-bold text-gray-900 md:col-span-1">Price</div>
        <div className="md:col-span-1">
          <span className="text-lg font-bold text-green-700">
            {typeof listing1.priceMonth === "number" ? (
              listing1.priceMonth.toLocaleString("vi-VN") + " VND/month"
            ) : (
              <span className="text-gray-500">N/A</span>
            )}
          </span>
        </div>
        <div className="md:col-span-1">
          {typeof listing2.priceMonth === "number" ? (
            <span className="text-lg font-bold text-green-700">
              {listing2.priceMonth.toLocaleString("vi-VN")} VND/month
            </span>
          ) : (
            <span className="text-gray-500">N/A</span>
          )}
        </div>

        {/* Row 2: Area */}
        <div className="font-bold text-gray-900 md:col-span-1">Area</div>
        <div className="md:col-span-1">
          <span className="text-base text-gray-500">{listing1.area} m²</span>
        </div>
        <div className="md:col-span-1">
          {listing2.area ? (
            <span className="text-base text-gray-500">{listing2.area} m²</span>
          ) : (
            <span className="text-gray-500">N/A</span>
          )}
        </div>

        {/* Row 3: Address */}
        <div className="font-bold text-gray-900 md:col-span-1">Address</div>
        <div className="text-sm md:col-span-1">
          {listing1.address.street +
            ", " +
            listing1.address.ward.name +
            ", " +
            listing1.address.ward.district.name +
            ", " +
            listing1.address.ward.district.province.name}
        </div>
        <div className="text-sm md:col-span-1">
          {listing2.address.street +
            ", " +
            listing2.address.ward.name +
            ", " +
            listing2.address.ward.district.name +
            ", " +
            listing2.address.ward.district.province.name}
        </div>

        {/* Row 6: Description Snippet */}
        <div className="font-bold text-gray-900 md:col-span-1">Description</div>
        <div className="text-sm md:col-span-1 ">{listing1.description}</div>
        <div className="text-sm md:col-span-1 ">
          {listing2.description || <span className="text-gray-500">N/A</span>}
        </div>

        {/* Convenients Comparison Section */}
        <div className="pt-4 mt-4 text-lg font-bold text-gray-900 border-t md:col-span-3">
          Convenients
        </div>

        {allPossibleConvenients.map((amenity, index) => (
          <React.Fragment key={index}>
            <div className="text-sm font-semibold text-gray-800 md:col-span-1">
              {amenity.label}
            </div>
            <div className="text-center md:col-span-1 md:text-left">
              {isAmenityEnabled(listing1.conveniences, amenity.key) ? (
                <BsCheckCircleFill className="inline-block text-lg text-green-600" />
              ) : (
                <FaTimesCircle className="inline-block text-lg text-red-500" />
              )}
            </div>
            <div className="text-center md:col-span-1 md:text-left">
              {listing2.id &&
              isAmenityEnabled(listing2.conveniences, amenity.key) ? (
                <BsCheckCircleFill className="inline-block text-lg text-green-600" />
              ) : listing2.id ? (
                <FaTimesCircle className="inline-block text-lg text-red-500" />
              ) : (
                <span className="text-gray-500">N/A</span>
              )}
            </div>
          </React.Fragment>
        ))}

        {/* Add more rows for other comparison points as needed */}
      </div>
    </div>
  );
}
