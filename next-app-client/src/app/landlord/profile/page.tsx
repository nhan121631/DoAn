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
import { HiSparkles } from "react-icons/hi";
import ButtonEditProfile from "../components/profile/ButtonEditProfile";
import { URL_IMAGE } from "@/services/Constant";

export default async function ProfileInfo() {
  const session = await getServerSession(authOptions);
  const wallet = await getUserWallet(session);
  if (wallet?.forbidden) {
    redirect("/auth/login");
  }
  const userProfile = await getUserProfile(session);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/30 transition-all duration-500">
      {/* Header with glassmorphism effect */}
      <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-white/20 dark:border-gray-700/30 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Profile Dashboard
              </h1>
            </div>
            <ButtonEditProfile userProfile={userProfile} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Left Panel - Profile Card */}
          <div className="xl:col-span-4">
            <div className="relative overflow-hidden bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/30">
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-pink-500/10 dark:from-blue-400/20 dark:via-purple-400/10 dark:to-pink-400/20"></div>

              <div className="relative p-8 text-center">
                {/* Avatar with glow effect */}
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-md opacity-75 animate-pulse"></div>
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
                    width={120}
                    height={120}
                    unoptimized
                    className="relative rounded-full border-4 border-white dark:border-gray-700 shadow-xl"
                  />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white dark:border-gray-800 shadow-lg"></div>
                </div>

                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                  {userProfile?.fullName || "Welcome User"}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8">
                  Premium Member
                </p>

                {/* Balance Card */}
                <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-6 shadow-xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>

                  <div className="relative">
                    <p className="text-blue-100 text-sm mb-2">
                      Account Balance
                    </p>
                    <p className="text-3xl font-bold text-white mb-1">
                      {typeof wallet?.balance !== null &&
                      typeof wallet?.balance === "number"
                        ? wallet.balance.toLocaleString("vi-VN")
                        : "0"}
                      <span className="text-xl ml-1">₫</span>
                    </p>
                    <div className="flex items-center gap-2 text-blue-200 text-sm">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span>Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Information Cards */}
          <div className="xl:col-span-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name Card */}
              <div className="group relative overflow-hidden bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 dark:border-gray-700/30 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
                    <FaUser className="text-white text-lg" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
                      Full Name
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 truncate">
                      {userProfile?.fullName || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Phone Card */}
              <div className="group relative overflow-hidden bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 dark:border-gray-700/30 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-emerald-500/25 transition-all duration-300">
                    <IoIosPhonePortrait className="text-white text-lg" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
                      Phone Number
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 truncate">
                      {userProfile?.phoneNumber || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Email Card */}
              <div className="group relative overflow-hidden bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 dark:border-gray-700/30 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300">
                    <MdOutlineMail className="text-white text-lg" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
                      Email Address
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 truncate">
                      {userProfile?.email || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Address Card */}
              <div className="group relative overflow-hidden bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 dark:border-gray-700/30 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-orange-500/25 transition-all duration-300">
                    <FaMapMarkerAlt className="text-white text-lg" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
                      Address
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                      {userProfile?.address &&
                      userProfile.address.street &&
                      userProfile.address.ward?.name &&
                      userProfile.address.ward.district?.name &&
                      userProfile.address.ward.district.province?.name
                        ? `${userProfile.address.street}, ${userProfile.address.ward.name}, ${userProfile.address.ward.district.name}, ${userProfile.address.ward.district.province.name}`
                        : "Not provided"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bank Info Card - Full width */}
              <div className="md:col-span-2 group relative overflow-hidden bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 dark:border-gray-700/30 hover:shadow-2xl hover:scale-[1.01] transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-indigo-500/25 transition-all duration-300">
                    <RiBankCardFill className="text-white text-lg" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
                      {userProfile?.bankName || "Bank Information"}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {userProfile?.bankNumber && userProfile?.accoutHolderName
                        ? `${userProfile.bankNumber} - ${userProfile.accoutHolderName}`
                        : "Not provided"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
