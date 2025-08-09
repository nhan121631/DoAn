"use client";

import React from "react";
import { BsCheckCircleFill } from "react-icons/bs";
import { FaTimesCircle } from "react-icons/fa";
// import { Slide } from "@/app/landlord/components/room-detail/Slide";

// Define types for Image and ListingData based on your RoomData structure
type ImageType = {
  id: number;
  url: string;
};

// Define a type for each amenity item
type Amenity = {
  label: string;
  enabled: boolean;
};

interface ListingData {
  id: string;
  title: string;
  price: number;
  area: number;
  address: string;
  description: string;
  electricityRate?: number;
  waterRate?: number;
  images: ImageType[];
  amenities: Amenity[]; // Added amenities array
}

interface ListingComparisonDisplayProps {
  listing1: ListingData;
  listing2: ListingData;
}

// Master list of all possible amenities for consistent comparison
const allPossibleAmenities = [
  { label: "Fully furnished" },
  { label: "Washing machine" },
  { label: "Flexible hours" },
  { label: "Mezzanine" },
  { label: "Refrigerator" },
  { label: "Kitchen shelf" },
  { label: "Air conditioner" },
  { label: "No landlord living on site" },
  { label: "Elevator" },
  { label: "24/7 security" },
  { label: "Underground parking" },
];

export default function ListingComparisonDisplay({
  listing1,
  listing2,
}: ListingComparisonDisplayProps) {
  // Helper function to check if an amenity is enabled for a given listing
  const isAmenityEnabled = (
    listingAmenities: Amenity[],
    amenityLabel: string
  ) => {
    return listingAmenities.some((a) => a.label === amenityLabel && a.enabled);
  };

  return (
    <div className="p-6 mx-auto bg-white shadow-md w-250 rounded-xl">
      {/* Listing Titles */}
      <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2">
        <h2 className="text-xl font-semibold text-center text-red-500 md:text-left">
          {listing1.title}
        </h2>
        <h2 className="text-xl font-semibold text-center text-red-500 md:text-left">
          {listing2.title || "Select another listing to compare"}
        </h2>
      </div>

      {/* Image Sliders
      <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2">
        <div className="overflow-hidden border rounded-lg">
          <Slide images={listing1.images} />
        </div>
        <div className="overflow-hidden border rounded-lg">
          {listing2.images.length > 0 ? (
            <Slide images={listing2.images} />
          ) : (
            <div className="w-full h-[200px] md:h-[300px] bg-gray-200 flex items-center justify-center text-gray-500">
              No image available
            </div>
          )}
        </div>
      </div> */}

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
            {listing1.price.toLocaleString()} VND/month
          </span>
        </div>
        <div className="md:col-span-1">
          {listing2.price ? (
            <span className="text-lg font-bold text-green-700">
              {listing2.price.toLocaleString()} VND/month
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
        <div className="text-sm md:col-span-1">{listing1.address}</div>
        <div className="text-sm md:col-span-1">
          {listing2.address || <span className="text-gray-500">N/A</span>}
        </div>

        {/* Row 4: Electricity Rate */}
        <div className="font-bold text-gray-900 md:col-span-1">
          Electricity Rate
        </div>
        <div className="text-sm md:col-span-1">
          {listing1.electricityRate
            ? `${listing1.electricityRate.toLocaleString()} VND/kWh`
            : "Not specified"}
        </div>
        <div className="text-sm md:col-span-1">
          {listing2.electricityRate
            ? `${listing2.electricityRate.toLocaleString()} VND/kWh`
            : "Not specified"}
        </div>

        {/* Row 5: Water Rate */}
        <div className="font-bold text-gray-900 md:col-span-1">Water Rate</div>
        <div className="text-sm md:col-span-1">
          {listing1.waterRate
            ? `${listing1.waterRate.toLocaleString()} VND/person/month`
            : "Not specified"}
        </div>
        <div className="text-sm md:col-span-1">
          {listing2.waterRate
            ? `${listing2.waterRate.toLocaleString()} VND/person/month`
            : "Not specified"}
        </div>

        {/* Row 6: Description Snippet */}
        <div className="font-bold text-gray-900 md:col-span-1">Description</div>
        <div className="text-sm md:col-span-1 line-clamp-3">
          {listing1.description}
        </div>
        <div className="text-sm md:col-span-1 line-clamp-3">
          {listing2.description || <span className="text-gray-500">N/A</span>}
        </div>

        {/* Amenities Comparison Section */}
        <div className="pt-4 mt-4 text-lg font-bold text-gray-900 border-t md:col-span-3">
          Amenities
        </div>

        {allPossibleAmenities.map((amenity, index) => (
          <React.Fragment key={index}>
            <div className="text-sm font-semibold text-gray-800 md:col-span-1">
              {amenity.label}
            </div>
            <div className="text-center md:col-span-1 md:text-left">
              {isAmenityEnabled(listing1.amenities, amenity.label) ? (
                <BsCheckCircleFill className="inline-block text-lg text-green-600" />
              ) : (
                <FaTimesCircle className="inline-block text-lg text-red-500" />
              )}
            </div>
            <div className="text-center md:col-span-1 md:text-left">
              {listing2.id &&
              isAmenityEnabled(listing2.amenities, amenity.label) ? (
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
