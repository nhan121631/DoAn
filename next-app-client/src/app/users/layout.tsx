import * as React from "react";
import Banner from "./components/Banner";
import Footer from "./components/Footer";
import Header from "./components/Header";
import AdsBanner from "./components/ads/AdsBanner";

type UsersLayoutProps = {
  children: React.ReactNode;
};

export default function UsersLayout({ children }: UsersLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
      <Header />
      {/* Banner/Slider */}
      <Banner />
      <div className="flex flex-row w-full max-w-full justify-center relative">
        {/* <AdsBanner position="left" /> */}
        <main className="flex-1 mt-20 max-w-6xl mx-auto">{children}</main>
        <AdsBanner position="right" />
      </div>
      <Footer />
    </div>
  );
}
