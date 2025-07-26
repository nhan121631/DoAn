import React from "react";
import LandlordCard from "./LandlordCard";

const landlordData = {
  id: 1,
  name: "John Doe",
  address: "123 Main St, Springfield, USA",
};

export default function LandlordListCard() {
  return (
    <div
      id="landlords"
      className="flex flex-col items-center justify-center w-full gap-4 px-4 my-6 max-w-7xl"
    >
      <h3 className="w-full text-xl font-semibold text-center">
        Landlord Information
      </h3>
      <h5 className="w-full mb-3 font-normal text-center text-md">
        Some description about the landlord information
      </h5>
      <div className="flex flex-wrap items-start justify-center w-full gap-3">
        <LandlordCard landlord={landlordData} />
        <LandlordCard landlord={landlordData} />
        <LandlordCard landlord={landlordData} />
        <LandlordCard landlord={landlordData} />
        <LandlordCard landlord={landlordData} />
        <LandlordCard landlord={landlordData} />
      </div>
    </div>
  );
}
