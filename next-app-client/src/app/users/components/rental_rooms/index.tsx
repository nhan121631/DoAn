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
import RoomVipCard from "../rooms/RoomVipCard";

import NoLookingForFilter from "../Filter/NoLookingForFilter";

// import { getFavoriteRoomIds } from "@/services/FavoriteService";
import { getAllFavoriteIds } from "@/services/FavoriteService";
import FilterForm from "../Filter/FilterForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Lấy danh sách ID yêu thích trên Server
// const initialFavoriteIds = await getFavoriteRoomIds();
const initialFavoriteIds = await getAllFavoriteIds();

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
  // Get session for user-specific sorting
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const params: RentalRoomsSearchParams = searchParams ? searchParams : {};

  // Helper ép về string
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
    filteredRooms = (await filterRooms(
      pageSearch,
      sizeSearch,
      filters
    )) as PaginatedResponse<RoomInUser>;
    roomVips = (await getRoomVipUser(
      page,
      size,
      userId
    )) as PaginatedResponse<RoomInUser>;
    roomNormals = (await getRoomNormalUser(
      page_normal,
      size_normal,
      userId
    )) as PaginatedResponse<RoomInUser>;
  } catch (e) {
    console.error("Error fetching rental rooms:", e);
    return notFound();
  }

  // Nếu fetch thành công nhưng dữ liệu không hợp lệ (null hoặc không có data)
  if (!filteredRooms || !roomVips || !roomNormals) {
    return notFound();
  }
  const isEmptyFilter = Object.entries(filters).every(([, value]) => {
    if (Array.isArray(value)) return value.length === 0;
    return value === undefined || value === null || value === "";
  });
  const buildFilterQuery = (filters: any, pageSearch: number) => {
    const queryObj = { ...filters, pageSearch };
    Object.keys(queryObj).forEach(
      (key) =>
        (queryObj[key] === undefined ||
          queryObj[key] === "" ||
          (Array.isArray(queryObj[key]) && queryObj[key].length === 0)) &&
        delete queryObj[key]
    );
    if (Array.isArray(queryObj.listConvenientIds)) {
      queryObj.listConvenientIds = queryObj.listConvenientIds.join(",");
    }
    return "?" + new URLSearchParams(queryObj).toString();
  };

  console.log("isEmpty Filter:", isEmptyFilter);
  return (
    <>
      <div
        id="rental-rooms"
        className="flex flex-col w-full mx-auto bg-white max-w-7xl lg:flex-row lg:gap-x-2"
      >
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {!isEmptyFilter ? (
            filteredRooms.data.length > 0 ? (
              <div className="flex flex-col items-center w-full gap-4 px-4 my-8 bg-white max-w-7xl lg:px-0 lg:w-auto">
                <h1 className="w-full text-2xl font-bold text-left">
                  The room you&#39;re looking for
                </h1>
                <span className="w-full italic text-left">
                  We found {filteredRooms.totalRecords} rooms matching your
                  search criteria
                </span>
                <div
                  id="normal-rooms-list"
                  className="flex flex-wrap items-start justify-center w-full gap-8"
                >
                  {filteredRooms.data.map((room, index) => (
                    <RoomCard
                      key={index}
                      room={room}
                      isForSale={false}
                      isFeatured={false}
                    />
                  ))}
                </div>
                {/* Previous Button */}
                <div className="flex items-center justify-center gap-4 mt-8">
                  <Link
                    href={buildFilterQuery(filters, pageSearch - 1)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium border transition-all duration-200 shadow ${
                      pageSearch === 0
                        ? "text-gray-400 bg-gray-100 cursor-not-allowed pointer-events-none border-gray-200"
                        : "text-blue-600 bg-white hover:bg-blue-50 hover:shadow-lg border-blue-300"
                    }`}
                    scroll={false}
                    aria-disabled={pageSearch === 0}
                  >
                    <BiChevronLeft size={20} />
                    <span className="hidden sm:inline">Previous</span>
                  </Link>
                  {/* Page Info */}
                  <div className="flex flex-col items-center px-4">
                    <span className="text-base font-semibold text-gray-700">
                      Page{" "}
                      <span className="text-blue-600">{pageSearch + 1}</span> /{" "}
                      <span className="text-blue-600">
                        {filteredRooms.totalPages}
                      </span>
                    </span>
                    <span className="text-xs text-gray-400">
                      {filteredRooms.totalPages} rooms found
                    </span>
                  </div>
                  {/* Next Button */}
                  <Link
                    href={buildFilterQuery(filters, pageSearch + 1)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium border transition-all duration-200 shadow ${
                      pageSearch + 1 >= filteredRooms.totalPages
                        ? "text-gray-400 bg-gray-100 cursor-not-allowed pointer-events-none border-gray-200"
                        : "text-blue-600 bg-white hover:bg-blue-50 hover:shadow-lg border-blue-300"
                    }`}
                    scroll={false}
                    aria-disabled={pageSearch + 1 >= filteredRooms.totalPages}
                  >
                    <span className="hidden sm:inline">Next</span>
                    <BiChevronRight size={20} />
                  </Link>
                </div>
              </div>
            ) : (
              <NoLookingForFilter />
            )
          ) : (
            <div className="flex flex-col items-center w-full gap-4 px-4 my-8 bg-white max-w-7xl lg:px-0 lg:w-auto">
              <h1 className="w-full text-2xl font-bold text-left">
                Vietnam’s No.1 Rental Room Platform
              </h1>
              <span className="w-full italic text-left">
                Find thousands of verified rooms, apartments, and affordable
                rentals across Vietnam – quickly and easily
              </span>
              <div className="flex flex-col items-center w-full gap-4">
                <h3 className="w-full text-xl font-semibold text-left">
                  Highlighted Post
                </h3>
                <div className="flex flex-col items-center w-full gap-4">
                  {roomVips.data.map((room, index) => (
                    <RoomVipCard
                      key={index}
                      room={room}
                      isFavorite={initialFavoriteIds.includes(room.id)}
                    />
                  ))}
                  <div className="flex items-center justify-center gap-4 mt-8">
                    {/* Previous Button */}
                    <Link
                      href={`?page=${page - 1}#rental-rooms`}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium border transition-all duration-200 shadow ${
                        page === 0
                          ? "text-gray-400 bg-gray-100 cursor-not-allowed pointer-events-none border-gray-200"
                          : "text-blue-600 bg-white hover:bg-blue-50 hover:shadow-lg border-blue-300"
                      }`}
                      scroll={true}
                      aria-disabled={page === 0}
                    >
                      <BiChevronLeft size={20} />
                      <span className="hidden sm:inline">Previous</span>
                    </Link>
                    {/* Page Info */}
                    <div className="flex flex-col items-center px-4">
                      <span className="text-base font-semibold text-gray-700">
                        Page <span className="text-blue-600">{page + 1}</span> /{" "}
                        <span className="text-blue-600">
                          {roomVips.totalPages}
                        </span>
                      </span>
                      <span className="text-xs text-gray-400">
                        {roomVips.totalPages} rooms found
                      </span>
                    </div>
                    {/* Next Button */}
                    <Link
                      href={`?page=${page + 1}#rental-rooms`}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium border transition-all duration-200 shadow ${
                        page + 1 >= roomVips.totalPages
                          ? "text-gray-400 bg-gray-100 cursor-not-allowed pointer-events-none border-gray-200"
                          : "text-blue-600 bg-white hover:bg-blue-50 hover:shadow-lg border-blue-300"
                      }`}
                      scroll={true}
                      aria-disabled={page + 1 >= roomVips.totalPages}
                    >
                      <span className="hidden sm:inline">Next</span>
                      <BiChevronRight size={20} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Sidebar - always fixed on the right */}
        <div className="w-full lg:w-[350px] flex flex-col items-center">
          <div className="hidden lg:block">
            <CardFilter />
          </div>
          <div className="mt-3 hidden lg:block">
            <FilterForm />
          </div>
          <div className="w-[80%] lg:w-[300px]">
            <FeaturedListingsCard />
          </div>
        </div>
      </div>
      {isEmptyFilter && (
        <div className="flex flex-col items-center justify-center w-full gap-4 px-4 my-6 max-w-7xl">
          <h3 className="w-full text-2xl font-semibold text-center">
            Featured Listings
          </h3>
          <h5 className="w-full mb-3 font-normal text-center text-md">
            Some description about the featured listings
          </h5>
          <div
            id="normal-rooms-list"
            className="flex flex-wrap items-start justify-center w-full gap-8"
          >
            {roomNormals.data.map((room, index) => (
              <RoomCard
                key={index}
                room={room}
                isForSale={false}
                isFeatured={false}
                isFavorite={initialFavoriteIds.includes(room.id)}
                custom={index}
              />
            ))}
          </div>
          <div className="flex items-center justify-center gap-4 mt-8">
            {/* Previous Button */}
            <Link
              href={`?pageNormal=${page_normal - 1}`}
              scroll={false}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium border transition-all duration-200 shadow ${
                page_normal === 0
                  ? "text-gray-400 bg-gray-100 cursor-not-allowed pointer-events-none border-gray-200"
                  : "text-blue-600 bg-white hover:bg-blue-50 hover:shadow-lg border-blue-300"
              }`}
              aria-disabled={page_normal === 0}
            >
              <BiChevronLeft size={20} />
              <span className="hidden sm:inline">Previous</span>
            </Link>
            {/* Page Info */}
            <div className="flex flex-col items-center px-4">
              <span className="text-base font-semibold text-gray-700">
                Page <span className="text-blue-600">{page_normal + 1}</span> /{" "}
                <span className="text-blue-600">{roomNormals.totalPages}</span>
              </span>
              <span className="text-xs text-gray-400">
                {roomNormals.totalPages} rooms found
              </span>
            </div>
            {/* Next Button */}
            <Link
              href={`?pageNormal=${page_normal + 1}`}
              scroll={false}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium border transition-all duration-200 shadow ${
                page_normal + 1 >= roomNormals.totalPages
                  ? "text-gray-400 bg-gray-100 cursor-not-allowed pointer-events-none border-gray-200"
                  : "text-blue-600 bg-white hover:bg-blue-50 hover:shadow-lg border-blue-300"
              }`}
              aria-disabled={page_normal + 1 >= roomNormals.totalPages}
            >
              <span className="hidden sm:inline">Next</span>
              <BiChevronRight size={20} />
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
