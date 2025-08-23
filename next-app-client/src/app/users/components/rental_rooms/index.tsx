/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  filterRooms,
  getRoomNormalUser,
  getRoomVipUser,
} from "@/services/RoomService";
import { PaginatedResponse, RoomInUser } from "@/types/types";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BiChevronLeft, BiChevronRight } from "react-icons/bi";
import CardFilter from "../Filter/CardFilter";
import FeaturedListingsCard from "../InfoCardAndFeatured/FeaturedListingsCard";
import RoomCard from "../rooms/RoomCard";
import RentalRoomsWithLocation from "./RentalRoomsWithLocation";

import NoLookingForFilter from "../Filter/NoLookingForFilter";
import { getAllFavoriteIds } from "@/services/FavoriteService";
import FilterForm from "../Filter/FilterForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { HiLocationMarker } from "react-icons/hi";

export interface RentalRoomsSearchParams {
  page?: string | string[];
  pageNormal?: string | string[];
  pageSearch?: string | string[];
  provinceId?: string | string[];
  districtId?: string | string[];
  wardId?: string | string[];
  minPrice?: string | string[];
  maxPrice?: string | string[];
  minArea?: string | string[];
  maxArea?: string | string[];
  listConvenientIds?: string | string[];
  [key: string]: string | string[] | undefined;
}

export default async function RentalRooms({
  searchParams,
}: {
  searchParams?: RentalRoomsSearchParams;
}) {
  // Session user
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  // Favorite Ids
  const initialFavoriteIds = await getAllFavoriteIds();

  const params: RentalRoomsSearchParams = searchParams ?? {};

  const getString = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] : v ?? "";

  const provinceId = getString(params.provinceId);
  const districtId = getString(params.districtId);
  const wardId = getString(params.wardId);
  const minPrice = getString(params.minPrice);
  const maxPrice = getString(params.maxPrice);
  const minArea = getString(params.minArea);
  const maxArea = getString(params.maxArea);
  const listConvenientIdsRaw = getString(params.listConvenientIds);
  const listConvenientIds = listConvenientIdsRaw
    ? listConvenientIdsRaw.split(",")
    : [];

  const filters = {
    provinceId,
    districtId,
    wardId,
    minPrice,
    maxPrice,
    minArea,
    maxArea,
    listConvenientIds,
  };

  let filteredRooms: PaginatedResponse<RoomInUser> | null = null;
  let roomVips: PaginatedResponse<RoomInUser> | null = null;
  let roomNormals: PaginatedResponse<RoomInUser> | null = null;

  const sizeSearch = 6;
  const pageSearch = Number(params?.pageSearch ?? 0);
  const size = 4;
  const page = Number(params?.page ?? 0);
  const size_normal = 6;
  const page_normal = Number(params?.pageNormal ?? 0);

  try {
    filteredRooms = await filterRooms(pageSearch, sizeSearch, filters);
    roomVips = await getRoomVipUser(page, size, userId);
    roomNormals = await getRoomNormalUser(page_normal, size_normal, userId);
  } catch (e) {
    console.error("Error fetching rental rooms:", e);
    return notFound();
  }

  if (!filteredRooms || !roomVips || !roomNormals) {
    return notFound();
  }

  const isEmptyFilter = Object.entries(filters).every(([, value]) => {
    if (Array.isArray(value)) return value.length === 0;
    return !value;
  });

  const buildFilterQuery = (filters: any, pageSearch: number) => {
    const queryObj = { ...filters, pageSearch };
    Object.keys(queryObj).forEach((key) => {
      const val = queryObj[key];
      if (
        val === undefined ||
        val === "" ||
        (Array.isArray(val) && val.length === 0)
      ) {
        delete queryObj[key];
      }
    });
    if (Array.isArray(queryObj.listConvenientIds)) {
      queryObj.listConvenientIds = queryObj.listConvenientIds.join(",");
    }
    return "?" + new URLSearchParams(queryObj).toString();
  };

  return (
    <>
      <div
        id="rental-rooms"
        className="flex flex-col w-full mx-auto bg-white max-w-7xl lg:flex-row lg:gap-x-2"
      >
        {/* Main Content */}
        <div className="flex-1 min-w-0 px-2 sm:px-4 md:px-6">
          {!isEmptyFilter ? (
            filteredRooms.data.length > 0 ? (
              <div className="flex flex-col items-center w-full gap-4 px-2 sm:px-4 my-8 bg-white max-w-7xl lg:px-0 lg:w-auto">
                <div className="w-full text-center space-y-4">
                  <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-700 to-purple-700 bg-clip-text text-transparent leading-tight">
                    Rooms You&#39;re Looking For
                  </h1>
                  <div className="flex items-center justify-center gap-2 text-lg text-gray-600">
                    <HiLocationMarker className="text-blue-500" />
                    <span className="font-medium">
                      Found{" "}
                      <span className="text-blue-600 font-bold">
                        {filteredRooms.totalRecords}
                      </span>{" "}
                      perfect matches
                    </span>
                  </div>
                </div>

                <div
                  id="normal-rooms-list"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-4 w-full"
                >
                  {filteredRooms.data.map((room) => (
                    <div key={room.id} className="flex justify-center">
                      <RoomCard
                        room={room}
                        isForSale={false}
                        isFeatured={false}
                        isFavorite={initialFavoriteIds.includes(room.id)}
                      />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-center gap-4 mt-8">
                  <Link
                    href={buildFilterQuery(filters, pageSearch - 1)}
                    className={`group flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 ${
                      pageSearch === 0
                        ? "bg-gradient-to-r from-gray-200 to-gray-300 text-gray-500 cursor-not-allowed pointer-events-none"
                        : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-blue-500/30"
                    }`}
                    scroll={false}
                    aria-disabled={pageSearch === 0}
                  >
                    <BiChevronLeft size={20} />
                    <span className="hidden sm:inline">Previous</span>
                  </Link>
                  <div className="flex flex-col items-center px-4">
                    <span className="text-base font-semibold text-gray-700">
                      Page{" "}
                      <span className="text-blue-600">{pageSearch + 1}</span> /{" "}
                      <span className="text-blue-600">
                        {filteredRooms.totalPages}
                      </span>
                    </span>
                    <span className="text-xs text-gray-400">
                      {filteredRooms.totalRecords} rooms found
                    </span>
                  </div>
                  <Link
                    href={buildFilterQuery(filters, pageSearch + 1)}
                    className={`group flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 ${
                      pageSearch + 1 >= filteredRooms.totalPages
                        ? "bg-gradient-to-r from-gray-200 to-gray-300 text-gray-500 cursor-not-allowed pointer-events-none"
                        : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-blue-500/30"
                    }`}
                    scroll={false}
                    aria-disabled={pageSearch + 1 >= filteredRooms.totalPages}
                  >
                    <span className="hidden sm:inline font-medium">Next</span>
                    <BiChevronRight
                      size={22}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </Link>
                </div>
              </div>
            ) : (
              <NoLookingForFilter />
            )
          ) : (
            <div className="flex flex-col items-center w-full gap-4 px-2 sm:px-4 my-8 bg-white max-w-7xl lg:px-0 lg:w-auto">
              {/* Hero Section placeholder nếu muốn */}
            </div>
          )}

          {/* Location-aware display */}
          <RentalRoomsWithLocation
            initialVipRooms={roomVips}
            initialNormalRooms={roomNormals}
            initialFavoriteIds={initialFavoriteIds}
            page={page}
            pageNormal={page_normal}
            isEmptyFilter={isEmptyFilter}
          />
        </div>

        {/* Sidebar */}
        <div className="w-full mt-6 lg:mt-0 lg:w-[350px] flex flex-col items-center">
          <div className="block lg:hidden w-full max-w-md mx-auto mb-4">
            <CardFilter />
          </div>
          <div className="block lg:hidden w-full max-w-md mx-auto mb-4">
            <FilterForm />
          </div>
          <div className="block lg:hidden w-full max-w-md mx-auto mb-4">
            <FeaturedListingsCard />
          </div>

          <div className="hidden lg:block w-full">
            <CardFilter />
            <div className="mt-3">
              <FilterForm />
            </div>
            <div className="w-[80%] lg:w-[300px] mt-3">
              <FeaturedListingsCard />
            </div>
          </div>
        </div>
      </div>
      {isEmptyFilter && (
        <div className="flex flex-col items-center justify-center w-full gap-4 px-2 sm:px-4 my-6 max-w-7xl">
          <div className="text-center space-y-6 mb-16">
            <h3 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-blue-600 bg-clip-text text-transparent">
              Featured Properties
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our most popular and highly-rated rental properties
            </p>
          </div>
          <div
            id="normal-rooms-list"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-4 w-full"
          >
            {roomNormals.data.map((room, index) => (
              <div key={index} className="flex justify-center">
                <RoomCard
                  room={room}
                  isForSale={false}
                  isFeatured={false}
                  isFavorite={initialFavoriteIds.includes(room.id)}
                  // custom={index}
                />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-4 mt-8">
            {/* Previous Button */}
            <Link
              href={`?pageNormal=${page_normal - 1}`}
              scroll={false}
              className={`group flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 ${
                page_normal === 0
                  ? "bg-gradient-to-r from-gray-200 to-gray-300 text-gray-500 cursor-not-allowed pointer-events-none"
                  : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-blue-500/30"
              }`}
              aria-disabled={page_normal === 0}
            >
              <BiChevronLeft
                size={22}
                className="transition-transform group-hover:-translate-x-1"
              />
              <span className="hidden sm:inline font-medium">Previous</span>
            </Link>

            {/* Page Info */}
            <div className="flex flex-col items-center px-6 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm">
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                Page {page_normal + 1} / {roomNormals.totalPages}
              </span>
              <span className="text-xs text-gray-500 font-medium">
                {roomNormals.totalRecords} featured rooms
              </span>
            </div>

            {/* Next Button */}
            <Link
              href={`?pageNormal=${page_normal + 1}`}
              scroll={false}
              className={`group flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 ${
                page_normal + 1 >= roomNormals.totalPages
                  ? "bg-gradient-to-r from-gray-200 to-gray-300 text-gray-500 cursor-not-allowed pointer-events-none"
                  : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-blue-500/30"
              }`}
              aria-disabled={page_normal + 1 >= roomNormals.totalPages}
            >
              <span className="hidden sm:inline font-medium">Next</span>
              <BiChevronRight
                size={22}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
