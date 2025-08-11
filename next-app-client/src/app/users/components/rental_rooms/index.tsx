import { getRoomNormalUser, getRoomVipUser } from "@/services/RoomService";
import CardFilter from "../Filter/CardFilter";
import FeaturedListingsCard from "../InfoCardAndFeatured/FeaturedListingsCard";
import RoomCard from "../rooms/RoomCard";
import RoomVipCard from "../rooms/RoomVipCard";
import { PaginatedResponse, RoomInUser } from "@/types/types";
import Link from "next/link";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";

export default async function RentalRooms({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string; pageNormal?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const size = 4;
  const page = Number(params?.page ?? 0);
  const roomVips = (await getRoomVipUser(
    page,
    size
  )) as PaginatedResponse<RoomInUser>;

  const size_normal = 2;
  const page_normal = Number(params?.pageNormal ?? 0);
  const roomNormals = (await getRoomNormalUser(
    page_normal,
    size_normal
  )) as PaginatedResponse<RoomInUser>;

  return (
    <>
      <div
        id="rental-rooms"
        className="flex flex-col justify-center w-full gap-0 mx-auto bg-gray-100 lg:flex-row max-w-7xl lg:gap-x-2"
      >
        <div className="flex flex-col items-center w-full gap-4 px-4 my-8 bg-gray-100 max-w-7xl lg:px-0 lg:w-auto">
          <h1 className="w-full text-2xl font-bold text-left">
            Vietnam’s No.1 Rental Room Platform
          </h1>
          <span className="w-full italic text-left">
            Find thousands of verified rooms, apartments, and affordable rentals
            across Vietnam – quickly and easily
          </span>

          <div className="flex flex-col items-center w-full gap-4">
            <h3 className="w-full text-xl font-semibold text-left">
              Highlighted Post
            </h3>
            <div className="flex flex-col items-center w-full gap-4">
              {roomVips.data.map((room, index) => (
                <RoomVipCard key={index} room={room} />
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
                  <span className="text-base text-gray-700 font-semibold">
                    Page <span className="text-blue-600">{page + 1}</span> /{" "}
                    <span className="text-blue-600">{roomVips.totalPages}</span>
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

        <div className="w-full lg:w-[350px] flex flex-col items-center">
          <div className="hidden lg:block">
            <CardFilter />
          </div>
          <div className="w-[80%] lg:w-[300px]">
            <FeaturedListingsCard />
          </div>
        </div>
      </div>

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
            <span className="text-base text-gray-700 font-semibold">
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
    </>
  );
}
