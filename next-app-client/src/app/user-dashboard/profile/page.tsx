// /* eslint-disable @typescript-eslint/no-explicit-any */
import Image from "next/image";
import React from "react";
import { FaMapMarkerAlt, FaUser } from "react-icons/fa";
import { IoIosPhonePortrait } from "react-icons/io";
import { MdOutlineMail } from "react-icons/md";
import ButtonEditProfile from "../components/profile/ButtonEditProfile";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserProfile } from "@/services/ProfileService";
import { URL_IMAGE } from "@/services/Constant";

export default async function ProfileInfo() {
  const session = await getServerSession(authOptions);
  const userProfile = await getUserProfile(session);
  return (
    <div className="flex flex-col flex-1 min-h-screen w-full bg-white dark:bg-[#001529] text-gray-900 dark:text-white p-8 transition-colors duration-300">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Profile Information</h1>
        <ButtonEditProfile userProfile={userProfile} />
      </div>
      <div className="flex flex-col gap-8 md:flex-row">
        {/* Left: Avatar + Balance */}
        <div className="flex flex-col items-center bg-gradient-to-br from-purple-200 via-blue-100 to-cyan-100 dark:from-[#232946] dark:via-[#1a1a2e] dark:to-[#0f3460] rounded-2xl shadow-lg p-8 min-w-[300px] max-w-[350px] w-full mx-auto md:mx-0">
          {/* Avatar */}
          <div className="relative w-32 h-32 mb-4 rounded-full overflow-hidden border-4 border-blue-500">
            <Image
              src={
                typeof userProfile?.avatar === "string" &&
                userProfile.avatar?.trim() !== ""
                  ? userProfile.avatar.startsWith("http")
                    ? userProfile.avatar
                    : `${URL_IMAGE}${userProfile.avatar}`
                  : "/images/default/avatar.jpg"
              }
              alt="Avatar"
              fill
              unoptimized
              className="object-cover"
            />
          </div>

          {/* Tên user */}
          <span className="mt-2 text-lg font-semibold">
            {userProfile?.fullName || "No Name"}
          </span>
        </div>
        {/* Right: Personal Information */}
        <div className="flex flex-col flex-1 gap-6">
          <div className="flex bg-gray-100 dark:bg-[#17223b] rounded-lg p-6 items-center gap-4">
            <span className="text-2xl text-sky-600 dark:!text-sky-300">
              <FaUser />
            </span>
            <div>
              <div className="text-lg font-semibold">Name</div>
              <div>{userProfile?.fullName || "Not added yet"}</div>
            </div>
          </div>
          <div className="flex bg-gray-100 dark:bg-[#17223b] rounded-lg p-6 items-center gap-4">
            <span className="text-2xl text-sky-600 dark:!text-sky-300">
              <IoIosPhonePortrait />
            </span>
            <div>
              <div className="text-lg font-semibold">Phone Number</div>
              <div>{userProfile?.phoneNumber || "Not added yet"}</div>
            </div>
          </div>
          <div className="flex bg-gray-100 dark:bg-[#17223b] rounded-lg p-6 items-center gap-4">
            <span className="text-2xl text-sky-600 dark:!text-sky-300">
              <MdOutlineMail />
            </span>
            <div>
              <div className="text-lg font-semibold">Email</div>
              <div>{userProfile?.email || "Not added yet"}</div>
            </div>
          </div>
          <div className="flex bg-gray-100 dark:bg-[#17223b] rounded-lg p-6 items-center gap-4">
            <span className="text-2xl text-sky-600 dark:!text-sky-300">
              <FaMapMarkerAlt />
            </span>
            <div>
              <div className="text-lg font-semibold">Address</div>
              <div>
                {userProfile?.address &&
                userProfile.address.street &&
                userProfile.address.ward?.name &&
                userProfile.address.ward.district?.name &&
                userProfile.address.ward.district.province?.name
                  ? `${userProfile.address.street}, ${userProfile.address.ward.name}, ${userProfile.address.ward.district.name}, ${userProfile.address.ward.district.province.name}`
                  : "Not added yet"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
