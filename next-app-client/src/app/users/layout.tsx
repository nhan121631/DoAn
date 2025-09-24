import * as React from "react";
import HeaderUserDashboard from "../user-dashboard/components/HeaderUserDashboard";
import AdsBanner from "./components/ads/AdsBanner";
import Footer from "./components/Footer";
import WhyChooseUsSection from "./components/WhyChooseUsSection";
import ContactPage from "./components/contact";
import LandlordListCard from "./components/landlord";
import SuggestAddressBar from "./components/Filter/SuggestAddressBar";
import { LocationProvider } from "@/context/LocationContext";

type UsersLayoutProps = {
  children: React.ReactNode;
};

export default function UsersLayout({ children }: UsersLayoutProps) {
  return (
    <LocationProvider>
      <div className="min-h-screen flex flex-col bg-white items-center">
        <HeaderUserDashboard />
        <SuggestAddressBar showSaveButton={true} />
        {/* Banner/Slider */}
        {/* <Banner /> */}
        <div className="flex flex-row w-full max-w-full justify-center relative">
          {/* Sticky AdsBanner left */}
          <div className="hidden xl:block sticky top-[90px] self-start z-30 h-[calc(100vh-120px)]">
            <AdsBanner position="LEFT" />
          </div>
          <main className="flex-1 mt-5 max-w-6xl mx-auto">{children}</main>
          {/* Sticky AdsBanner right */}
          <div className="hidden xl:block sticky top-[90px] self-start z-30 h-[calc(100vh-120px)]">
            <AdsBanner position="RIGHT" />
          </div>
        </div>
        <div id="why-choose-us" className="w-full max-w-full">
          <WhyChooseUsSection />
          <LandlordListCard />
          <ContactPage />
          <Footer />
        </div>
      </div>
    </LocationProvider>
  );
}
