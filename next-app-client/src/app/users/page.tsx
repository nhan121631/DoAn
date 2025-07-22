import RoomCard from "./components/rooms/RoomCard";

const data = {
  key: "room-1",
  name: "Room Title",
  title: "Room Title",
  address: "123 Main St, City",
  price: 250000,
  area: 35,
  postStartDate: "2024-06-01",
  postEndDate: "2024-06-30",
  description: "A nice room in the city center.",
  electricityRate: 3000,
  waterRate: 1000,
  img: [
    {
      id: 1,
      url: "/images/anh1.jpg",
    },
    {
      id: 2,
      url: "https://example.com/image2.jpg",
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
    <div className="flex items-center justify-center bg-gray-100 p-4">
      <RoomCard room={data} isForSale={true} isFeatured={false} />
    </div>
  );
}
