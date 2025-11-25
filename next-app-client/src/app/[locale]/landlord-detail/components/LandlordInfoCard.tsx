"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LandlordDetail } from "@/app/landlord/types";
import { MdVerified, MdPhone } from "react-icons/md";
import { BiShield } from "react-icons/bi";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

// Mask functions for privacy protection
function maskPhone(phone: string) {
  if (!phone) return "";
  if (phone.length < 4) return phone;
  return phone.slice(0, 2) + "******" + phone.slice(-2);
}

function maskEmail(email: string) {
  if (!email) return "";
  const [name, domain] = email.split("@");
  if (name.length <= 2) {
    return name[0] + "****@" + domain;
  }
  return name[0] + "****" + name.slice(-1) + "@" + domain;
}

const getAvatarSrc = (avatar?: string) => {
  if (!avatar || avatar.trim() === "" || avatar === "null") {
    return "/images/default/avatar.jpg";
  }
  if (avatar.startsWith("/dmvvs0ags/")) {
    return `https://res.cloudinary.com${avatar}`;
  }
  if (avatar.startsWith("http")) {
    return avatar;
  }
  return "/images/default/avatar.jpg";
};

interface LandlordInfoCardProps {
  landlord: LandlordDetail;
  onStartChat: () => void;
}

export default function LandlordInfoCard({
  landlord,
  onStartChat,
}: LandlordInfoCardProps) {
  const { data: session } = useSession();
  // Local state for the report modal (minimal, used by the injected modal markup)
  const [showReportModal, setShowReportModal] = useState(false);

  // Overlay click handler to close modals when clicking outside
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setShowReportModal(false);
    }
  };

  const handleChatClick = () => {
    if (!session?.user?.id) {
      redirect("/auth/login");
      return;
    }
    onStartChat();
  };

  return (
    <div className="sticky overflow-hidden transition-all duration-500 bg-white border border-gray-100 shadow-xl rounded-2xl top-8">
      {/* Header with gradient background */}
      <div className="relative p-6 text-white bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-32 h-32 -mt-16 -mr-16 rounded-full bg-white/10"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 -mb-12 -ml-12 rounded-full bg-white/10"></div>

        <div className="relative flex flex-col items-center">
          {/* Avatar */}
          <div className="relative mb-4">
            <div className="relative">
              <Image
                src={getAvatarSrc(landlord.avatar)}
                alt={`${landlord.fullName}'s avatar`}
                width={96}
                height={96}
                className="object-cover border-4 shadow-xl rounded-2xl border-white/30 backdrop-blur-sm"
                priority
              />
              {/* Online status indicator */}
              <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1.5 shadow-lg">
                <div className="flex items-center justify-center w-4 h-4 rounded-full bg-gradient-to-r from-green-400 to-emerald-500">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Name */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <h2 className="text-xl font-bold text-white">
                {landlord.fullName}
              </h2>
              <span className="text-yellow-300">👑</span>
            </div>

            {/* Email - directly below name, no box */}
            {landlord.email && (
              <p className="text-sm text-white/80 mb-3 truncate max-w-[200px]">
                {/* {session?.user?.id ? maskEmail(landlord.email) : landlord.email} */}
                {maskEmail(landlord.email)}
              </p>
            )}

            {/* Online Status */}
            <div className="flex items-center justify-center gap-2 px-3 py-1 border rounded-full backdrop-blur-sm bg-green-400/20 border-green-300/30">
              <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
              <p className="text-xs font-medium text-green-100">Online</p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="p-6 space-y-6">
        {/* Stats Section */}
        <div className="p-4 border border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex-1 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="text-yellow-500">⭐</span>
                <p className="text-lg font-bold text-gray-800">
                  {landlord.totalListings}
                </p>
              </div>
              <p className="text-xs font-medium text-gray-600">Listings</p>
            </div>

            <div className="w-px h-8 bg-gray-200"></div>

            <div className="flex-1 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="text-blue-500">👤</span>
                <p className="text-sm font-bold text-gray-800">Member</p>
              </div>
              <p className="text-xs font-medium text-gray-600">
                Since {new Date(landlord.memberSince).getFullYear()}
              </p>
            </div>
          </div>
        </div>

        {/* Verification Badges */}
        <div className="flex flex-wrap justify-center gap-2">
          <div className="flex items-center gap-1 px-3 py-1 text-green-700 border border-green-200 rounded-full bg-green-50">
            <MdVerified className="w-3 h-3" />
            <span className="text-xs font-medium">Verified</span>
          </div>
          <div className="flex items-center gap-1 px-3 py-1 text-blue-700 border border-blue-200 rounded-full bg-blue-50">
            <BiShield className="w-3 h-3" />
            <span className="text-xs font-medium">Trusted</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Contact Button - chỉ hiện khi có phone */}
          {landlord.phoneNumber && (
            <Link
              href={`tel:${landlord.phoneNumber}`}
              className="group relative w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-4 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-3 overflow-hidden"
            >
              <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-r from-green-600 to-emerald-700 group-hover:opacity-100"></div>
              <div className="relative flex items-center gap-3">
                <MdPhone className="w-5 h-5" />
                <span className="font-semibold">
                  {/* {session?.user?.id
                    ? maskPhone(landlord.phoneNumber)
                    : landlord.phoneNumber} */}
                  {maskPhone(landlord.phoneNumber)}
                </span>
              </div>
            </Link>
          )}

          {/* Chat Button */}
          <button
            onClick={handleChatClick}
            className="group relative w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-4 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-3 overflow-hidden"
          >
            <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-r from-blue-600 to-indigo-700 group-hover:opacity-100"></div>
            <div className="relative flex items-center gap-3">
              <IoChatbubbleEllipsesOutline className="w-5 h-5" />
              <span className="font-semibold">Start Conversation</span>
            </div>
          </button>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
          onMouseDown={handleOverlayClick}
        >
          <div
            className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-lg max-h-[85vh] relative overflow-y-auto z-[10000]"
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* ...existing code... */}
          </div>
        </div>
      )}
    </div>
  );
}
