"use client";
import React, { useEffect, useState } from "react";
import Convenient from "./convenient";
import MapSection from "./map";
import { Slide } from "./Slide";
import { getRoomById } from "@/services/RoomService";
import type { RoomDetail } from "@/types/types";
import IncreaseView from "./IncreaseView";
import FavoriteCount from "./FavoriteCount";

type RoomDetailProps = {
  id: string | null;
};

const RoomDetail: React.FC<RoomDetailProps> = ({ id }) => {
  const [room, setRoom] = useState<RoomDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    getRoomById(id)
      .then((data) => {
        setRoom(data as RoomDetail);
        console.log("=== RoomDetail getRoomById payload ===");
        console.log("Room ID:", id);
        console.log("Complete Response Data:", JSON.stringify(data, null, 2));
        console.log("======================================");
      })
      .catch(() => {
        setError("Room not found");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (!id) return null;
  if (loading) return <div>Loading...</div>;
  if (error || !room) return <div>{error || "Room not found"}</div>;

  return (
    <div className="max-w-[900px] mx-auto my-8 bg-white dark:bg-[#181f2b] rounded-xl shadow-lg p-6 dark:text-white">
      {/* Image slider */}
      <div className="p-4 bg-white dark:bg-[#232b3b] rounded-lg">
        <Slide
          images={
            Array.isArray(room.images)
              ? room.images.filter((img) => img && typeof img.url === "string")
              : []
          }
          address={
            room.address.street +
              ", " +
              room.address.ward.name +
              ", " +
              room.address.ward.district.name +
              ", " +
              room.address.ward.district.province.name || ""
          }
        />
      </div>

      {/* Room Info Card */}
      <div className="mt-6 p-5 rounded-lg bg-[#f9f9f9] dark:bg-[#232b3b] shadow-sm flex flex-col gap-4">
        <div className="flex items-center mb-2">
          <span className="text-white font-bold text-xl mr-2 bg-red-500 px-2 rounded">
            {room.typepost
              ? room.typepost.charAt(0).toUpperCase() + room.typepost.slice(1)
              : ""}
          </span>
          <span className="text-[#e53935] font-semibold text-xl mr-2 dark:text-[#ff6b6b]">
            {room.title || "Room for rent"}
          </span>
        </div>
        <div className="flex items-center gap-4 mb-2">
          <span className="text-lg font-bold text-green-700 dark:text-green-400">
            {room.priceMonth
              ? `${room.priceMonth.toLocaleString("vi-VN")} VND/month`
              : ""}
          </span>
          <span className="text-base text-gray-500 dark:text-gray-300">
            · {room.area ? `${room.area} m²` : ""}
          </span>
          <div className="flex items-center gap-3 ml-4">
                              <IncreaseView roomId={room.id} />
                              <FavoriteCount roomId={room.id} />
                            </div>
        </div>
        <div className="text-gray-700 dark:text-gray-200 text-[15px] mb-1 flex justify-start">
          <span className="w-1/5">Ward</span>
          <span className="w-4/5 ml-1">{room.address?.ward?.name || ""}</span>
        </div>
        <div className="text-gray-700 dark:text-gray-200 text-[15px] mb-1 flex justify-start">
          <span className="w-1/5">District:</span>
          <span className="w-4/5 ml-1">
            {room.address?.ward?.district?.name || ""}
          </span>
        </div>
        <div className="text-gray-700 dark:text-gray-200 text-[15px] mb-1 flex justify-start">
          <span className="w-1/5">City/Province:</span>
          <span className="w-4/5 ml-1">
            {room.address?.ward?.district?.province?.name || ""}
          </span>
        </div>
        <div className="text-gray-700 dark:text-gray-200 text-[15px] mb-1 flex justify-start">
          <span className="w-1/5">Address:</span>
          <span className="w-4/5 ml-1">{room.address?.street || ""}</span>
        </div>
        <div className="text-gray-700 dark:text-gray-200 text-[15px] mb-1 flex justify-start">
          <span className="w-1/5">Post Start Date:</span>
          <span className="ml-1">
            {room.postStartDate
              ? new Date(room.postStartDate).toLocaleString()
              : ""}
          </span>
        </div>
        <div className="text-gray-700 dark:text-gray-200 text-[15px] mb-1 flex justify-start">
          <span className="w-1/5">Post End Date:</span>
          <span className="ml-1">
            {room.postEndDate
              ? new Date(room.postEndDate).toLocaleString()
              : ""}
          </span>
        </div>
        {/* <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Updated:{" "}
          {room.updatedAt ? new Date(room.updatedAt).toLocaleString() : ""}
        </div> */}

        <hr className="my-5 text-gray-300 dark:text-gray-600" />

        <h2 className="mb-2 text-lg font-bold text-gray-800 dark:text-white">
          Description
        </h2>
        <div className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-200 text-[15px]">
          {room.description ? (
            room.description
              .split("\n")
              .map((line, idx) => <p key={idx}>{line}</p>)
          ) : (
            <p>No description</p>
          )}
        </div>
        <Convenient features={room.convenients} />
        <hr className="my-5 text-gray-300" />
        <MapSection
          address={
            room.address.street +
              ", " +
              room.address.ward.name +
              ", " +
              room.address.ward.district.name +
              ", " +
              room.address.ward.district.province.name || ""
          }
        />
      </div>
    </div>
  );
};

export default RoomDetail;
