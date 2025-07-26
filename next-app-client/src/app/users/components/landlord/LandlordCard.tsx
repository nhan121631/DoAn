import React from "react";
import Image from "next/image";
import { LandLordInfo } from "@/app/landlord/types";
import LandlordActionsWrapper from "./LandlordActionsWrapper";

interface LandLordInfoProps {
  landlord: LandLordInfo;
}

export default function LandlordCard({ landlord }: LandLordInfoProps) {
  return (
    <LandlordActionsWrapper landlord={landlord}>
    <div className="rounded-xl overflow-hidden shadow-lg bg-gray-100 relative group w-[380px] h-[100px] flex items-center transition-all duration-300 hover:shadow-2xl hover:bg-white hover:scale-[1.03]">
      <div className="flex-shrink-0 w-[100px] h-[101px]">
        <Image
          src="/images/nhann.png"
          alt="avatar"
          width={100}
          height={101}
          className="object-cover w-full h-full transition-all duration-300 rounded-xl group-hover:scale-105 group-hover:shadow-lg"
        />
      </div>
      <div className="flex-1 gap-5 p-4 transition-colors duration-300">
        <div className="font-bold">Landlord Name</div>
        <div className="text-sm text-gray-600 ">Property Address</div>
      </div>
    </div>
    </LandlordActionsWrapper>
  );
}
