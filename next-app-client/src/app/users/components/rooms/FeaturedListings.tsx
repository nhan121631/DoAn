import React from "react";
import RoomCard from "./RoomCard";

const data = {
  key: "1",
  name: "Room Title Example",
  landlordName: "nGUYEEN VAN A",
  phoneNumber: 123456789,
  address: "123 Main St, City",
  price: 250000,
  area: 35,
  postStartDate: "2025-07-20",
  postEndDate: "2025-12-30",
  description:
    "A nice room in the city center.guggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg",
  electricityRate: 3000,
  waterRate: 1000,
  img: [
    {
      id: 1,
      url: "/images/anh1.jpg",
    },
    {
      id: 2,
      url: "/images/anh2.jpg",
    },
    {
      id: 2,
      url: "/images/anh5.jpg",
    },
    {
      id: 2,
      url: "/images/anh3.jpg",
    },
  ],
  owner: "John Doe",
  phone: "123-456-7890",
  available: "Available" as const,
  approval: 1 as 0 | 1 | 2,
  isRemove: 0 as 0 | 1,
  hidden: 0 as 0 | 1,
};

export default function FeaturedListings() {
  return (
    <div className="flex flex-col gap-4 my-6 px-4 w-full max-w-7xl items-center justify-center">
      <h3 className="text-xl font-semibold text-center w-full">
        Featured Listings
      </h3>
      <h5 className="text-md mb-3 font-normal text-center w-full">
        Some description about the featured listings
      </h5>
      <div className="w-full flex flex-wrap justify-center items-start gap-8">
        <RoomCard room={data} isForSale={true} isFeatured={false} />
        <RoomCard room={data} isForSale={true} isFeatured={false} />
        <RoomCard room={data} isForSale={true} isFeatured={false} />
      </div>
    </div>
  );
}
