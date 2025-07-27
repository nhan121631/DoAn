import CardFilter from "../Filter/CardFilter";
import FeaturedListingsCard from "../InfoCardAndFeatured/FeaturedListingsCard";
import RoomCard from "../rooms/RoomCard";
import RoomVipCard from "../rooms/RoomVipCard";

const data = [
  {
    key: "1",
    name: "Room Title Example",
    landlordName: "NGUYEN VAN A",
    phoneNumber: 123456789,
    address: "123 Main St, City",
    price: 250000,
    area: 35,
    postStartDate: "2025-07-20",
    postEndDate: "2025-12-30",
    description:
      "A nice room in the city center with all amenities included. Perfect for students or young professionals.",
    electricityRate: 3000,
    waterRate: 1000,
    img: [
      { id: 1, url: "/images/anh1.jpg" },
      { id: 2, url: "/images/anh2.jpg" },
      { id: 3, url: "/images/anh5.jpg" },
      { id: 4, url: "/images/anh3.jpg" },
    ],
    owner: "John Doe",
    phone: "123-456-7890",
    available: "Available" as const,
    approval: 1 as 0 | 1 | 2,
    isRemove: 0 as 0 | 1,
    hidden: 0 as 0 | 1,
  },
  {
    key: "2",
    name: "Luxury Apartment",
    landlordName: "NGUYEN VAN B",
    phoneNumber: 987654321,
    address: "456 Elm St, City",
    price: 500000,
    area: 50,
    postStartDate: "2025-07-15",
    postEndDate: "2025-12-15",
    description:
      "A luxury apartment with modern amenities and great views. Ideal for families or professionals.",
    electricityRate: 3500,
    waterRate: 1500,
    img: [
      { id: 1, url: "/images/anh2.jpg" },
      { id: 2, url: "/images/anh3.jpg" },
      { id: 3, url: "/images/anh1.jpg" },
      { id: 4, url: "/images/anh4.jpg" },
    ],
    owner: "Jane Smith",
    phone: "987-654-3210",
    available: "Available" as const,
    approval: 1 as 0 | 1 | 2,
    isRemove: 0 as 0 | 1,
    hidden: 0 as 0 | 1,
  },
  {
    key: "3",
    name: "Cozy Studio",
    landlordName: "LE VAN C",
    phoneNumber: 456789123,
    address: "789 Oak St, City",
    price: 200000,
    area: 25,
    postStartDate: "2025-07-10",
    postEndDate: "2025-11-30",
    description:
      "A cozy studio perfect for singles or couples. Close to public transport and amenities.",
    electricityRate: 2800,
    waterRate: 1200,
    img: [
      { id: 1, url: "/images/anh4.jpg" },
      { id: 2, url: "/images/anh3.jpg" },
      { id: 3, url: "/images/anh2.jpg" },
      { id: 4, url: "/images/anh1.jpg" },
    ],
    owner: "Alice Johnson",
    phone: "456-789-1230",
    available: "Available" as const,
    approval: 1 as 0 | 1 | 2,
    isRemove: 0 as 0 | 1,
    hidden: 0 as 0 | 1,
  },
  {
    key: "4",
    name: "Spacious Room",
    landlordName: "TRAN THI D",
    phoneNumber: 321654987,
    address: "101 Pine St, City",
    price: 300000,
    area: 40,
    postStartDate: "2025-07-05",
    postEndDate: "2025-12-05",
    description:
      "A spacious room with plenty of natural light. Great for students or young professionals.",
    electricityRate: 3200,
    waterRate: 1400,
    img: [
      { id: 1, url: "/images/anh4.jpg" },
      { id: 2, url: "/images/anh3.jpg" },
      { id: 3, url: "/images/anh1.jpg" },
      { id: 4, url: "/images/anh2.jpg" },
    ],
    owner: "Bob Brown",
    phone: "321-654-9870",
    available: "Available" as const,
    approval: 1 as 0 | 1 | 2,
    isRemove: 0 as 0 | 1,
    hidden: 0 as 0 | 1,
  },
];

export default function RentalRooms() {
  return (
    <>
      <div
        id="rental-rooms"
        className="flex flex-col justify-center w-full gap-0 mx-auto bg-gray-100 lg:flex-row max-w-7xl lg:gap-x-2"
      >
        <div className="flex flex-col items-center w-full gap-4 px-4 my-8 bg-gray-100 max-w-7xl lg:px-0 lg:w-auto">
          <h1 className="w-full text-2xl font-bold text-left">
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
            {/* {[...Array(3)].map((_, i) => (
              <RoomVipCard key={i} room={data} />
            ))} */}
            {data.map((room, index) => (
              <RoomVipCard key={index} room={room} />
            ))}
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
        <h3 className="w-full text-2xl font-semibold text-center">
          Featured Listings
        </h3>
        <h5 className="w-full mb-3 font-normal text-center text-md">
          Some description about the featured listings
        </h5>
        <div className="flex flex-wrap items-start justify-center w-full gap-8">
          {/* {[...Array(3)].map((_, i) => (
            <RoomCard key={i} room={data} isForSale={true} isFeatured={false} />
          ))} */}
          {data.map((room, index) => (
            <RoomCard
              key={index}
              room={room}
              isForSale={true}
              isFeatured={false}
            />
          ))}
        </div>
      </div>
    </>
  );
}
