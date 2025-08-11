"use client";
import { RoomInUser } from "@/types/types";
import { useRouter } from "next/navigation";
import React from "react";

interface RoomCartActionsWrapperProps {
  room: RoomInUser;
  children: React.ReactNode;
}

// export default function RoomCartActionsWrapper({
//   room,
//   children,
// }: RoomCartActionsWrapperProps) {
export default function RoomCartActionsWrapper({
  children,
  room,
}: RoomCartActionsWrapperProps) {
  const router = useRouter();

  const handleClick = () => {
    // router.push(`/detail/${room.key}`);
    router.push(`/detail/${room.id}`);
  };

  return (
    <div onClick={handleClick} className="cursor-pointer">
      {children}
    </div>
  );
}
