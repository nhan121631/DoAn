"use client";
import { RoomData } from "@/app/landlord/types";
import { useRouter } from "next/navigation";
import React from "react";

interface RoomCartActionsWrapperProps {
  room: RoomData;
  children: React.ReactNode;
}


export default function RoomCartActionsWrapper({ room, children }: RoomCartActionsWrapperProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/detail/${room.key}`);
  };

  return (
    <div onClick={handleClick} className="cursor-pointer">
      {children}
    </div>
  );
}
