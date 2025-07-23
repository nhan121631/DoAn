import CardFilter from "./components/Filter/CardFilter";
import FeaturedListingsCard from "./components/InfoCardAndFeatured/FeaturedListingsCard";
import RoomCard from "./components/rooms/RoomCard";
import RoomVipCard from "./components/rooms/RoomVipCard";

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

export default function UsersPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="flex flex-col lg:flex-row justify-center w-full max-w-7xl mx-auto bg-gray-100 gap-0 lg:gap-x-2">
        <div className="flex flex-col bg-gray-100 gap-4 max-w-7xl my-8 px-4 lg:px-0 w-full lg:w-auto items-center">
          <h1 className="text-2xl font-bold text-left w-full ">
            Vietnam’s No.1 Rental Room Platform
          </h1>
          <span className="w-full text-left italic">
            Find thousands of verified rooms, apartments, and affordable rentals
            across Vietnam – quickly and easily
          </span>
          <div className="w-full flex flex-col items-center gap-4">
            <h3 className="text-xl font-semibold text-left w-full">
              Highlighted Post
            </h3>
            <RoomVipCard room={data} />
            <RoomVipCard room={data} />
            <RoomVipCard room={data} />
          </div>
        </div>
        <div className="w-full lg:w-[350px] flex flex-col items-center">
          <div className="hidden lg:block">
            <CardFilter />
          </div>
          <div className="w-[80%] lg:w-[300px]">
            <FeaturedListingsCard />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4 my-8 px-4 w-full max-w-7xl items-center justify-center">
        <h3 className="text-xl font-semibold text-left w-full">
          Featured Listings
        </h3>
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 justify-center">
          <RoomCard room={data} isForSale={true} isFeatured={false} />
          <RoomCard room={data} isForSale={true} isFeatured={false} />
          <RoomCard room={data} isForSale={true} isFeatured={false} />
        </div>
      </div>
    </div>
  );
}
