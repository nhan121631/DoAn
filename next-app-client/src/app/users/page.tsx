// import { SearchParamsType } from "@/types/types";
import BackToTop from "./components/BackToTop";
import Chatbot from "./components/Chatbot";
import CompareRoom from "./components/CompareRoom";
import ContactPage from "./components/contact";
import LandlordListCard from "./components/landlord";
import RentalRooms, {
  RentalRoomsSearchParams,
} from "./components/rental_rooms";
import WhyChooseUsSection from "./components/WhyChooseUsSection";

export default async function UsersPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[]>>;
}) {
  // Await the searchParams promise
  const params = await searchParams;

  // Normalize the params to match RentalRoomsSearchParams
  const normalizedParams = params
    ? Object.fromEntries(
        Object.entries(params).map(([key, value]) => [key, value])
      )
    : undefined;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <RentalRooms searchParams={normalizedParams as RentalRoomsSearchParams} />
      <WhyChooseUsSection />
      <LandlordListCard />
      <ContactPage />
      <BackToTop />
      <CompareRoom />
      <Chatbot />
    </div>
  );
}
