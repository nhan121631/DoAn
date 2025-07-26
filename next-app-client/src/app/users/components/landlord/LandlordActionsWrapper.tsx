"use client";
import { LandLordInfo } from "@/app/landlord/types";
import { useRouter } from "next/navigation";
import React from "react";

interface LandlordActionsWrapperProps {
  landlord: LandLordInfo;
  children: React.ReactNode;
}


export default function LandlordActionsWrapper({ landlord, children }: LandlordActionsWrapperProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/landlord-detail/${landlord.id}`);
  };

  return (
    <div onClick={handleClick} className="cursor-pointer">
      {children}
    </div>
  );
}
