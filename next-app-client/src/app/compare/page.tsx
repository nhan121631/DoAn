"use client";
import { useCompareStore } from "../../stores/CompareStore";
import HeaderUserDashboard from "../user-dashboard/components/HeaderUserDashboard";
import ListingComparisonDisplay from "../users/components/compare/ListingComparisonDisplay";
import Footer from "../users/components/Footer";

export default function ComparePage() {
  const { items } = useCompareStore((state) => state);
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header for the comparison page */}
      <HeaderUserDashboard />

      <main className="flex-grow pt-[80px] p-4 bg-gray-50">
        {" "}
        {/* Adjust pt-[80px] to match header height */}
        <h1 className="mb-6 text-3xl font-bold text-center text-gray-800">
          Listing Comparison
        </h1>
        <ListingComparisonDisplay
          listing1={items[0]?.room}
          listing2={items[1]?.room}
        />
      </main>

      <Footer />
    </div>
  );
}
