import CardFilter from "../Filter/CardFilter";
import FeaturedListingsCard from "../InfoCardAndFeatured/FeaturedListingsCard";
import LandlordCard from "../landlord/LandlordCard";
import RoomCard from "../rooms/RoomCard";
import RoomVipCard from "../rooms/RoomVipCard";
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

const landlordData = {
  id: 1,
  name: "Landlord Name",
  phone: "123-456-7890",
  email: "landlord@example.com",

};

export default function RentalRooms() {
  return (
    <>
      <div className="flex flex-col justify-center w-full gap-0 mx-auto bg-gray-100 lg:flex-row max-w-7xl lg:gap-x-2">
        <div className="flex flex-col items-center w-full gap-4 px-4 my-8 bg-gray-100 max-w-7xl lg:px-0 lg:w-auto">
          <h1 className="w-full text-2xl font-bold text-left ">
            Vietnam’s No.1 Rental Room Platform
          </h1>
          <span className="w-full italic text-left">
            Find thousands of verified rooms, apartments, and affordable rentals
            across Vietnam – quickly and easily
          </span>
          <div className="flex flex-col items-center w-full gap-4">
            <h3 className="w-full text-xl font-semibold text-left">
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
      <div className="flex flex-col items-center justify-center w-full gap-4 px-4 my-6 max-w-7xl">
        <h3 className="w-full text-xl font-semibold text-center">
      <div className="flex flex-col gap-4 my-6 px-4 w-full max-w-7xl items-center justify-center">
        <h3 className="text-2xl font-semibold text-center w-full">
          Featured Listings
        </h3>
        <h5 className="w-full mb-3 font-normal text-center text-md">
          Some description about the featured listings
        </h5>
        <div className="flex flex-wrap items-start justify-center w-full gap-8">
          <RoomCard room={data} isForSale={true} isFeatured={false} />
          <RoomCard room={data} isForSale={true} isFeatured={false} />
          <RoomCard room={data} isForSale={true} isFeatured={false} />
        </div>
      </div>

      <div className="flex flex-col items-center justify-center w-full gap-4 px-4 my-6 max-w-7xl">
        <h3 className="w-full text-xl font-semibold text-center">
          Landlord Information
        </h3>
        <h5 className="w-full mb-3 font-normal text-center text-md">
          Some description about the landlord information
        </h5>
        <div className="flex flex-wrap items-start justify-center w-full gap-3">
          <LandlordCard landlord={landlordData} />
          <LandlordCard landlord={landlordData} />
          <LandlordCard landlord={landlordData} />
          <LandlordCard landlord={landlordData} />
          <LandlordCard landlord={landlordData} />
          <LandlordCard landlord={landlordData} />
        </div>
      </div>
    </>
  );
}
