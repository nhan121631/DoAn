import React from "react";
import Image from "next/image";
import Link from "next/link";
import { getRecentRooms, getRoomVipUser } from "@/services/RoomService";
import { URL_IMAGE } from "@/services/Constant";
import { PaginatedResponse, RoomInUser } from "@/types/types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export interface FeaturedListing {
  id: number;
  title: string;
  priceMonth: string;
  postStartDate: string;
  imageUrl: string;
  isHot: true;
}

export default async function FeaturedListingsCard() {
  // const featuredListings = (await getRecentRooms()) as FeaturedListing[];
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const roomVips = (await getRoomVipUser(
    0,
    10,
    userId
  )) as PaginatedResponse<RoomInUser>;
  if (roomVips.data.length === 0) return null;

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
    <div
      data-featured-listings
      className="p-5 mt-6 border shadow-lg bg-white rounded-xl border-sky-200 max-w-full overflow-hidden"
    >
      <h3 className="mb-4 text-xl font-bold text-red-600 flex items-center gap-2">
        <svg
          width="20"
          height="20"
          fill="none"
          viewBox="0 0 20 20"
          className="text-red-400"
        >
          <circle cx="10" cy="10" r="9" fill="#f87171" opacity="0.15" />
          <circle cx="10" cy="10" r="4" fill="#f87171" />
        </svg>
        Room VIP Listings
      </h3>
      <div className="flex flex-col gap-2 w-full">
        {roomVips.data.map((listing: RoomInUser, index: number) => (
          <React.Fragment key={listing.id}>
            <Link
              href={`/detail/${listing.id}`}
              className="flex w-full gap-2 p-2 transition duration-200 rounded-lg items-center group hover:bg-emerald-50 hover:shadow-md hover:border-emerald-200 border border-transparent focus-within:ring-2 focus-within:ring-emerald-300"
              style={{ maxWidth: "100%" }}
            >
              <div className="relative flex-shrink-0 w-20 h-20 overflow-hidden rounded-md bg-gray-100 border border-gray-200">
                {listing.images && listing.images.length > 0 ? (
                  <Image
                    src={`${URL_IMAGE}${listing.images[0].url}`}
                    alt={listing.title}
                    fill
                    style={{ objectFit: "cover" }}
                    sizes="(max-width: 640px) 100vw, 120px"
                    className="rounded-md group-hover:scale-105 transition-transform duration-300"
                    priority
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-xs">No Image</span>
                  </div>
                )}
                {/* {listing.isHot && (
                  <span className="absolute left-0 z-10 w-16 px-2 py-0.5 text-xs text-center text-white bg-red-600 shadow rounded top-2 font-bold tracking-wide animate-pulse">
                    HOT
                  </span>
                )} */}
              </div>
              <div className="flex flex-col justify-center flex-grow min-w-0">
                <p className="text-sm font-semibold text-gray-800 md:text-base line-clamp-2 group-hover:text-emerald-700 transition-colors duration-200">
                  {listing.title}
                </p>
                <p className="mt-1 text-[15px] font-bold text-amber-700 md:text-base group-hover:text-amber-800 transition-colors duration-200">
                  {listing.priceMonth
                    ? Number(listing.priceMonth).toLocaleString("vi-VN")
                    : 0}
                  <span className="text-xs font-semibold text-gray-500 ml-1">
                    ₫/month
                  </span>
                </p>
                <p className="text-xs text-gray-500 group-hover:text-gray-700 transition-colors duration-200">
                  {listing.postStartDate
                    ? getRelativeTime(listing.postStartDate)
                    : ""}
                </p>
              </div>
            </Link>
            {index < roomVips.data.length - 1 && (
              <hr className="border-t border-gray-200 mx-2" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
