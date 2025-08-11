import BackToTop from "./components/BackToTop";
import Chatbot from "./components/Chatbot";
import CompareRoom from "./components/CompareRoom";
import ContactPage from "./components/contact";
import LandlordListCard from "./components/landlord";
import RentalRooms from "./components/rental_rooms";
import WhyChooseUsSection from "./components/WhyChooseUsSection";

export default function UsersPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string; pageNormal?: string }>;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <RentalRooms searchParams={searchParams} />
      <WhyChooseUsSection />
      <LandlordListCard />
      <ContactPage />
      <BackToTop />
      <CompareRoom />
      <Chatbot />
    </div>
  );
}
