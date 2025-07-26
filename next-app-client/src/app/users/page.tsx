import ContactPage from "./components/contact";
import RentalRooms from "./components/rental_rooms";
import WhyChooseUsSection from "./components/WhyChooseUsSection";

export default function UsersPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <RentalRooms />
      <WhyChooseUsSection />
      <ContactPage />
    </div>
  );
}
