import Image from "next/image";
import { LandLordInfo } from "@/app/landlord/types";
import LandlordActionsWrapper from "./LandlordActionsWrapper";

interface LandLordInfoProps {
  landlord: LandLordInfo;
}

const getAvatarSrc = (avatar?: string) => {
  console.log('Avatar value:', avatar);
  if (!avatar || avatar.trim() === '' || avatar === 'null' || avatar === 'undefined') {
    return "/images/default/avatar.jpg";
  }
  if (avatar.startsWith('/dmvvs0ags/')) {
    return `https://res.cloudinary.com${avatar}`;
  }
  if (avatar.startsWith('http') || avatar.startsWith('https://')) {
    return avatar;
  }
  if (avatar.startsWith('/')) {
    return avatar;
  }
  return "/images/avatar.jpg";
};


export default function LandlordCard({ landlord }: LandLordInfoProps) {
  return (
    <LandlordActionsWrapper landlord={landlord}>
      <div className="group relative w-[400px] h-[140px] overflow-hidden rounded-3xl bg-gradient-to-br from-white via-gray-50 to-white p-6 shadow-lg transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 dark:shadow-gray-900/50">
        {/* Animated background gradient */}
        <div className="absolute inset-0 transition-opacity duration-500 opacity-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 group-hover:opacity-100" />

        {/* Glassmorphism border effect */}
        <div className="absolute inset-0 border rounded-3xl border-white/20 bg-white/5 backdrop-blur-sm dark:border-gray-700/50" />

        <div className="relative flex items-center h-full space-x-5">
          {/* Avatar with glow effect - Fixed size */}
          <div className="relative flex-shrink-0">
            <div className="absolute transition-opacity duration-500 opacity-0 -inset-1 rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 blur-sm group-hover:opacity-75" />
            <div className="relative w-20 h-20 overflow-hidden bg-gray-200 rounded-2xl dark:bg-gray-700">
              <Image
                src={getAvatarSrc(landlord.avatar)}
                alt={`${landlord.fullName || 'Landlord'}'s avatar`}
                width={80}
                height={80}
                className="object-cover w-full h-full transition-all duration-500 group-hover:scale-110 group-hover:rotate-2"
              />
            </div>
            {/* Online status indicator */}
            <div className="absolute w-6 h-6 border-white rounded-full shadow-lg -bottom-1 -right-1 border-3 bg-gradient-to-r from-green-400 to-emerald-500 dark:border-gray-900">
              <div className="w-full h-full bg-green-400 rounded-full animate-pulse" />
            </div>
          </div>

          {/* Content - Fixed space with overflow handling */}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center space-x-2">
              <h3 
                className="flex-1 text-lg font-bold text-transparent truncate transition-all duration-300 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text group-hover:from-blue-600 group-hover:via-purple-600 group-hover:to-pink-600 dark:from-gray-100 dark:via-white dark:to-gray-100"
                title={landlord.fullName || "Landlord Name"}  /* ← Tooltip để xem tên đầy đủ */
              >
                {landlord.fullName || "Landlord Name"}
              </h3>
              {/* Verified badge - Fixed size */}
              <div className="flex items-center justify-center flex-shrink-0 w-5 h-5 transition-transform duration-300 rounded-full shadow-lg bg-gradient-to-r from-blue-500 to-purple-600 group-hover:scale-110">
                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            <div className="flex items-start space-x-2 text-sm text-gray-600 dark:text-gray-300">
              <svg className="w-4 h-4 text-gray-400 transition-colors duration-300 group-hover:text-purple-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <p 
                className="flex-1 transition-colors duration-300 group-hover:text-gray-900 dark:group-hover:text-white line-clamp-2"
                title={landlord.address || "Property Address"}  /* ← Tooltip để xem địa chỉ đầy đủ */
              >
                {landlord.address || "Property Address"}
              </p>
            </div>
          </div>

          {/* Arrow indicator - Fixed size */}
          <div className="flex-shrink-0 transition-all duration-300 opacity-0 group-hover:translate-x-1 group-hover:opacity-100">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-3xl">
          <div className="absolute w-2 h-2 transition-opacity duration-500 rounded-full opacity-0 -top-2 -left-2 animate-bounce bg-blue-400/50 group-hover:opacity-100" style={{ animationDelay: "0s" }} />
          <div className="absolute w-1 h-1 transition-opacity duration-500 rounded-full opacity-0 top-1/2 -right-1 animate-bounce bg-purple-400/50 group-hover:opacity-100" style={{ animationDelay: "0.5s" }} />
          <div className="absolute -bottom-1 left-1/3 h-1.5 w-1.5 animate-bounce rounded-full bg-pink-400/50 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ animationDelay: "1s" }} />
        </div>
      </div>
    </LandlordActionsWrapper>
  );
}