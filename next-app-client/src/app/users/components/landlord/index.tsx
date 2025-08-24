import React from "react";
import LandlordCard from "./LandlordCard";

const landlordData = [
  {
    id: 1,
    name: "John Doe",
    address: "123 Main St, Springfield, USA",
  },
  {
    id: 2,
    name: "Jane Smith",
    address: "456 Oak Ave, Downtown, USA",
  },
  {
    id: 3,
    name: "Mike Johnson",
    address: "789 Pine St, Uptown, USA",
  },
  {
    id: 4,
    name: "Sarah Wilson",
    address: "321 Elm St, Midtown, USA",
  },
  {
    id: 5,
    name: "David Brown",
    address: "654 Maple Dr, Suburbs, USA",
  },
  {
    id: 6,
    name: "Lisa Davis",
    address: "987 Cedar Ln, Riverside, USA",
  },
];

export default function LandlordListCard() {
  return (
    <section
      id="landlords"
      className="relative bg-gradient-to-b from-white via-gray-50/50 to-white overflow-hidden"
    >
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/30 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-100/20 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 text-sm font-medium rounded-full mb-6">
            👥 Our Partners
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Trusted
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {" "}
              Landlords
            </span>
          </h2>

          <p className="text-lg text-gray-600 leading-relaxed">
            Connect with verified property owners who provide quality
            accommodations and exceptional service across Vietnam
          </p>
        </div>

        {/* Landlords Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {landlordData.map((landlord, index) => (
            <div
              key={landlord.id}
              className="transform transition-all duration-500 hover:-translate-y-2"
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              <LandlordCard landlord={landlord} />
            </div>
          ))}
        </div>

        {/* Bottom Stats Section */}
        <div className="mt-20 pt-12 border-t border-gray-200/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-blue-600">500+</div>
              <div className="text-gray-600 text-sm font-medium">
                Verified Landlords
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-3xl font-bold text-purple-600">10K+</div>
              <div className="text-gray-600 text-sm font-medium">
                Available Properties
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-3xl font-bold text-green-600">98%</div>
              <div className="text-gray-600 text-sm font-medium">
                Customer Satisfaction
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-gray-500 bg-white/70 backdrop-blur-sm px-6 py-3 rounded-full border border-gray-200/50 shadow-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            All landlords are verified and background-checked
          </div>
        </div>
      </div>
    </section>
  );
}
