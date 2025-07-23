import CardFilter from "./components/Filter/CardFilter";
import FeaturedListingsCard from "./components/InfoCardAndFeatured/FeaturedListingsCard";
import FeaturedListings from "./components/rooms/FeaturedListings";
import HightlightListings from "./components/rooms/HightlightListings";

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
          <HightlightListings />
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
      <div>
        
        <FeaturedListings />
      </div>
    </div>
  );
}
