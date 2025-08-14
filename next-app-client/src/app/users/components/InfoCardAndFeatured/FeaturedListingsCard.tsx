import React from "react";
import Image from "next/image";
import Link from "next/link";
import { getRecentRooms } from "@/services/RoomService";
import { URL_IMAGE } from "@/services/Constant";

export interface FeaturedListing {
  id: number;
  title: string;
  priceMonth: string;
  postStartDate: string;
  imageUrl: string;
  isHot: true;
}

export default async function FeaturedListingsCard() {
  const featuredListings = (await getRecentRooms()) as FeaturedListing[];
  if (featuredListings.length === 0) return null;

  function getRelativeTime(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // seconds
    if (diff < 0) return "Just now";
    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  }
  return (
    <div className="p-6 mt-6 border shadow-lg bg-sky-50 rounded-xl border-sky-400">
      <h3 className="mb-4 text-xl font-bold text-gray-800">Newest posts</h3>
      <div className="flex flex-col gap-3">
        {featuredListings.map((listing, index) => (
          <React.Fragment key={listing.id}>
            <Link
              href={`/detail/${listing.id}`}
              className="flex w-full gap-2 p-2 transition duration-200 rounded-lg hover:bg-sky-100"
            >
              <div className="relative flex-shrink-0 w-24 h-24 overflow-hidden rounded-md">
                <Image
                  src={`${URL_IMAGE}` + listing.imageUrl}
                  alt={listing.title}
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="(max-width: 640px) 100vw, 300px"
                  className="rounded-md"
                  priority
                />
                {listing.isHot && (
                  <span className="absolute left-0 z-10 w-20 px-2 py-0 text-xs text-center text-white bg-red-600 shadow-md rounded-xs top-2">
                    CHO THUÊ NHANH
                  </span>
                )}
              </div>
              <div className="flex flex-col justify-center flex-grow">
                <p className="text-sm font-semibold text-gray-800 md:text-base line-clamp-2">
                  {listing.title}
                </p>
                <p className="mt-1 text-[14px] font-semibold text-green-700 md:text-base">
                  {listing.priceMonth
                    ? Number(listing.priceMonth).toLocaleString("vi-VN")
                    : 0}
                  ₫/month
                </p>
                <p className="text-xs text-gray-500">
                  {listing.postStartDate
                    ? getRelativeTime(listing.postStartDate)
                    : ""}
                </p>
              </div>
            </Link>
            {index < featuredListings.length - 1 && (
              <hr className="border-t border-gray-300" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
