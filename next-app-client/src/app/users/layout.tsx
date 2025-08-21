import * as React from "react";
import Footer from "./components/Footer";
import AdsBanner from "./components/ads/AdsBanner";
import HeaderUserDashboard from "../user-dashboard/components/HeaderUserDashboard";

type UsersLayoutProps = {
  children: React.ReactNode;
};

export default function UsersLayout({ children }: UsersLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
      <HeaderUserDashboard />

      {/* Banner/Slider */}
      {/* <Banner /> */}
      <div className="flex flex-row w-full max-w-full justify-center relative">
        {/* <AdsBanner position="left" /> */}
        <main className="flex-1 mt-20 max-w-6xl mx-auto">{children}</main>
        <AdsBanner position="right" />
      </div>

      <Footer />
    </div>
  );
}
