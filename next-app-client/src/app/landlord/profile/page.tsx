import { authOptions } from "@/lib/auth";
import { getUserProfile } from "@/services/ProfileService";
import { getUserWallet } from "@/services/WalletService";
import { getServerSession } from "next-auth";
import Image from "next/image";
import { redirect } from "next/navigation";
import { FaMapMarkerAlt, FaUser } from "react-icons/fa";
import { IoIosPhonePortrait } from "react-icons/io";
import { MdOutlineMail } from "react-icons/md";
import { RiBankCardFill } from "react-icons/ri";
import ButtonEditProfile from "../components/profile/ButtonEditProfile";

export default async function ProfileInfo() {
  const session = await getServerSession(authOptions);
  const wallet = await getUserWallet(session);
  if (wallet?.forbidden) {
    // async () => await signOut({ callbackUrl: "/auth/login" });
    redirect("/auth/login");
  }
  const userProfile = await getUserProfile(session);
  return (
    <div className="flex flex-col flex-1 min-h-screen w-full bg-white dark:bg-[#001529] text-gray-900 dark:text-white p-8 transition-colors duration-300">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Profile Information</h1>
        <ButtonEditProfile userProfile={userProfile} />
      </div>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left: Avatar + Balance */}
        <div className="flex flex-col items-center bg-gradient-to-br from-purple-200 via-blue-100 to-cyan-100 dark:from-[#232946] dark:via-[#1a1a2e] dark:to-[#0f3460] rounded-2xl shadow-lg p-8 min-w-[300px] max-w-[350px] w-full mx-auto md:mx-0">
          <Image
            src={
              typeof userProfile?.avatar === "string" &&
              userProfile.avatar?.trim() !== ""
                ? userProfile.avatar.startsWith("http")
                  ? userProfile.avatar
                  : `http://localhost:3333${userProfile.avatar}`
                : "/images/default/avatar.jpg"
            }
            alt="Avatar"
            width={128}
            height={128}
            unoptimized
            className="rounded-full border-4 border-blue-500 mb-4"
          />
          <span className="mt-2 font-semibold text-lg">
            {userProfile?.fullName || "No Name"}
          </span>
          <div className="flex flex-col items-center mt-32 bg-blue-50 dark:bg-[#22304a] rounded-xl px-4 py-2 w-full shadow">
            <span className="text-gray-500 dark:text-gray-300 text-base mb-1">
              Account Balance
            </span>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {typeof wallet?.balance !== null &&
              typeof wallet?.balance === "number"
                ? wallet.balance.toLocaleString("vi-VN")
                : "0"}
              ₫
            </span>
          </div>
        </div>
        {/* Right: Personal Information */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="flex bg-gray-100 dark:bg-[#17223b] rounded-lg p-6 items-center gap-4">
            <span className="text-2xl text-sky-600 dark:!text-sky-300">
              <FaUser />
            </span>
            <div>
              <div className="font-semibold text-lg">Name</div>
              <div>{userProfile?.fullName || "Not added yet"}</div>
            </div>
          </div>
          <div className="flex bg-gray-100 dark:bg-[#17223b] rounded-lg p-6 items-center gap-4">
            <span className="text-2xl text-sky-600 dark:!text-sky-300">
              <IoIosPhonePortrait />
            </span>
            <div>
              <div className="font-semibold text-lg">Phone Number</div>
              <div>{userProfile?.phoneNumber || "Not added yet"}</div>
            </div>
          </div>
          <div className="flex bg-gray-100 dark:bg-[#17223b] rounded-lg p-6 items-center gap-4">
            <span className="text-2xl text-sky-600 dark:!text-sky-300">
              <MdOutlineMail />
            </span>
            <div>
              <div className="font-semibold text-lg">Email</div>
              <div>{userProfile?.email || "Not added yet"}</div>
            </div>
          </div>
          <div className="flex bg-gray-100 dark:bg-[#17223b] rounded-lg p-6 items-center gap-4">
            <span className="text-2xl text-sky-600 dark:!text-sky-300">
              <FaMapMarkerAlt />
            </span>
            <div>
              <div className="font-semibold text-lg">Address</div>
              {userProfile?.address &&
              userProfile.address.street &&
              userProfile.address.ward?.name &&
              userProfile.address.ward.district?.name &&
              userProfile.address.ward.district.province?.name
                ? `${userProfile.address.street}, ${userProfile.address.ward.name}, ${userProfile.address.ward.district.name}, ${userProfile.address.ward.district.province.name}`
                : "Not added yet"}
            </div>
          </div>

          <div className="flex bg-gray-100 dark:bg-[#17223b] rounded-lg p-6 items-center gap-4">
            <span className="text-2xl text-sky-600 dark:!text-sky-300">
              <RiBankCardFill />
            </span>
            <div>
              <div className="font-semibold text-lg">
                {userProfile?.bankName || "Bank Name"}
              </div>
              <div>
                {userProfile?.bankNumber && userProfile?.accoutHolderName
                  ? `${userProfile.bankNumber}-${userProfile.accoutHolderName}`
                  : "Not added yet"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
