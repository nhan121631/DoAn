import RoomCard from "./components/rooms/RoomCard";
import RoomVipCard from "./components/rooms/RoomVipCard";

const data = {
  key: "room-1",
  name: "Room Title",
  landlordName: "nGUYEEN VAN A",
  phoneNumber: 123456789,
  address: "123 Main St, City",
  price: 250000,
  area: 35,
  postStartDate: "2025-07-20",
  postEndDate: "2025-12-30",
  description: "A nice room in the city center.guggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg",
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
  return <div className="flex flex-col items-center justify-center bg-gray-100 p-4 gap-4">
    <RoomVipCard room={data} />
    <RoomCard
      room={data}
      isForSale={true}
      isFeatured={false}
    />
  </div>
}
