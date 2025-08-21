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
import { HiLocationMarker, HiSparkles } from "react-icons/hi";

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
        <div className="flex-1 min-w-0 px-2 sm:px-4 md:px-6">
          {!isEmptyFilter ? (
            filteredRooms.data.length > 0 ? (
              <div className="flex flex-col items-center w-full gap-4 px-2 sm:px-4 my-8 bg-white max-w-7xl lg:px-0 lg:w-auto">
                <div className="w-full text-center space-y-4">
                  <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-700 to-purple-700 bg-clip-text text-transparent leading-tight">
                    Rooms You're Looking For
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
                  className="flex flex-wrap items-start justify-center w-full gap-4 md:gap-6 lg:gap-8"
                >
                  {filteredRooms.data.map((room, index) => (
                    <div
                      key={index}
                      className="basis-full max-w-full sm:basis-1/2 sm:max-w-1/2 lg:basis-1/3 lg:max-w-1/3 flex justify-center"
                    >
                      <RoomCard
                        room={room}
                        isForSale={false}
                        isFeatured={false}
                      />
                    </div>
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
            <div className="flex flex-col items-center w-full gap-4 px-2 sm:px-4 my-8 bg-white max-w-7xl lg:px-0 lg:w-auto">
              {/* Hero Section */}
              <div className="text-center space-y-6 max-w-4xl">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <HiSparkles className="text-yellow-500 text-2xl animate-pulse" />
                  <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
                    Vietnam's #1 Platform
                  </span>
                  <HiSparkles className="text-yellow-500 text-2xl animate-pulse" />
                </div>

                <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Find Your
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                    Perfect Room
                  </span>
                </h1>

                <p className="text-xl lg:text-2xl text-gray-600 font-light leading-relaxed max-w-3xl mx-auto">
                  Discover thousands of{" "}
                  <span className="text-blue-600 font-semibold">
                    verified rooms
                  </span>
                  , apartments, and affordable rentals across Vietnam
                </p>

                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-4 mt-12 max-w-2xl mx-auto">
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                    <div className="text-3xl font-bold text-blue-600">10K+</div>
                    <div className="text-sm text-gray-600">Rooms</div>
                  </div>
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                    <div className="text-3xl font-bold text-purple-600">63</div>
                    <div className="text-sm text-gray-600">Provinces</div>
                  </div>
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                    <div className="text-3xl font-bold text-pink-600">99%</div>
                    <div className="text-sm text-gray-600">Verified</div>
                  </div>
                </div>
              </div>

              {/* VIP Rooms Section */}
              <div className="w-full space-y-8">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <HiSparkles className="text-yellow-500 text-2xl" />
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                      Premium Listings
                    </h3>
                    <HiSparkles className="text-yellow-500 text-2xl" />
                  </div>
                  <p className="text-gray-600">
                    Hand-picked premium rooms for the discerning renter
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center w-full gap-4">
                <div className="flex flex-wrap items-start justify-center w-full gap-4 md:gap-6 lg:gap-8">
                  {roomVips.data.map((room, index) => (
                    <div
                      key={index}
                      className="basis-full w-full max-w-xs sm:max-w-1/2  lg:max-w-none flex justify-center"
                    >
                      <RoomVipCard
                        room={room}
                        isFavorite={initialFavoriteIds.includes(room.id)}
                      />
                    </div>
                  ))}
                  <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
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
        {/* Sidebar - responsive: below main on mobile, right on desktop */}
        <div className="w-full mt-6 lg:mt-0 lg:w-[350px] flex flex-col items-center">
          {/* Mobile: show sidebar below main content */}
          <div className="block lg:hidden w-full max-w-md mx-auto mb-4">
            <CardFilter />
          </div>
          <div className="block lg:hidden w-full max-w-md mx-auto mb-4">
            <FilterForm />
          </div>
          <div className="block lg:hidden w-full max-w-md mx-auto mb-4">
            <FeaturedListingsCard />
          </div>
          {/* Desktop: sidebar on the right */}
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
