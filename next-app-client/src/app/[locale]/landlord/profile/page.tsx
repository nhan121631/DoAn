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
    <div className="min-h-screen transition-all duration-500 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/30">
      {/* Header with glassmorphism effect */}
      <div className="sticky top-0 z-10 border-b backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-white/20 dark:border-gray-700/30">
        <div className="px-6 py-6 mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text">
                Profile Dashboard
              </h1>
            </div>
            <ButtonEditProfile userProfile={userProfile} />
          </div>
        </div>
      </div>

      <div className="px-6 py-8 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
          {/* Left Panel - Profile Card */}
          <div className="xl:col-span-4">
            <div className="relative overflow-hidden border shadow-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl border-white/20 dark:border-gray-700/30">
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-pink-500/10 dark:from-blue-400/20 dark:via-purple-400/10 dark:to-pink-400/20"></div>

              <div className="relative p-8 text-center">
                {/* Avatar with glow effect */}
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 rounded-full opacity-75 bg-gradient-to-r from-blue-400 to-purple-500 blur-md animate-pulse"></div>
                  <div className="relative w-32 h-32 mb-4 overflow-hidden border-4 border-blue-500 rounded-full">
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
                  <div className="absolute w-8 h-8 bg-green-500 border-4 border-white rounded-full shadow-lg -bottom-2 -right-2 dark:border-gray-800"></div>
                </div>

                <h2 className="mb-2 text-2xl font-bold text-gray-800 dark:text-white">
                  {userProfile?.fullName || "Welcome User"}
                </h2>
                <p className="mb-8 text-gray-500 dark:text-gray-400">
                  Premium Member
                </p>

                {/* Balance Card */}
                <div className="relative p-6 overflow-hidden shadow-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-2xl">
                  <div className="absolute top-0 right-0 w-32 h-32 translate-x-16 -translate-y-16 rounded-full bg-white/10"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 -translate-x-12 translate-y-12 rounded-full bg-white/5"></div>

                  <div className="relative">
                    <p className="mb-2 text-sm text-blue-100">
                      Account Balance
                    </p>
                    <p className="mb-1 text-3xl font-bold text-white">
                      {typeof wallet?.balance !== null &&
                      typeof wallet?.balance === "number"
                        ? wallet.balance.toLocaleString("vi-VN")
                        : "0"}
                      <span className="ml-1 text-xl">₫</span>
                    </p>
                    <div className="flex items-center gap-2 text-sm text-blue-200">
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
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Name Card */}
              <div className="group relative overflow-hidden bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 dark:border-gray-700/30 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
                <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 group-hover:opacity-100"></div>
                <div className="relative flex items-center gap-4">
                  <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 transition-all duration-300 shadow-lg bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl group-hover:shadow-blue-500/25">
                    <FaUser className="text-lg text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white">
                      Full Name
                    </h3>
                    <p className="text-gray-600 truncate dark:text-gray-300">
                      {userProfile?.fullName || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Phone Card */}
              <div className="group relative overflow-hidden bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 dark:border-gray-700/30 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
                <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 group-hover:opacity-100"></div>
                <div className="relative flex items-center gap-4">
                  <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 transition-all duration-300 shadow-lg bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl group-hover:shadow-emerald-500/25">
                    <IoIosPhonePortrait className="text-lg text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white">
                      Phone Number
                    </h3>
                    <p className="text-gray-600 truncate dark:text-gray-300">
                      {userProfile?.phoneNumber || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Email Card */}
              <div className="group relative overflow-hidden bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 dark:border-gray-700/30 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
                <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 group-hover:opacity-100"></div>
                <div className="relative flex items-center gap-4">
                  <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 transition-all duration-300 shadow-lg bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl group-hover:shadow-purple-500/25">
                    <MdOutlineMail className="text-lg text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white">
                      Email Address
                    </h3>
                    <p className="text-gray-600 truncate dark:text-gray-300">
                      {userProfile?.email || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Address Card */}
              <div className="group relative overflow-hidden bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 dark:border-gray-700/30 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
                <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-r from-orange-500/5 to-red-500/5 group-hover:opacity-100"></div>
                <div className="relative flex items-center gap-4">
                  <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 transition-all duration-300 shadow-lg bg-gradient-to-r from-orange-500 to-red-500 rounded-xl group-hover:shadow-orange-500/25">
                    <FaMapMarkerAlt className="text-lg text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white">
                      Address
                    </h3>
                    <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
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
                <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 group-hover:opacity-100"></div>
                <div className="relative flex items-center gap-4">
                  <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 transition-all duration-300 shadow-lg bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl group-hover:shadow-indigo-500/25">
                    <RiBankCardFill className="text-lg text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white">
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
