"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { MdPhone, MdEmail, MdVerified, MdLocationOn } from "react-icons/md";
import {
  FaRegBookmark,
  FaBookmark,
  FaTimes,
  FaStar,
  FaUserCheck,
  FaCrown,
} from "react-icons/fa";
import {
  IoShareSocialOutline,
  IoWarningOutline,
  IoChatbubbleEllipsesOutline,
} from "react-icons/io5";
import { BiShield } from "react-icons/bi";
import { HiOutlineBadgeCheck } from "react-icons/hi";
import { getLandlordByRoomId } from "@/services/RoomService";
import { LandlordDetailByRoom } from "@/types/types";
import { API_URL, URL_IMAGE } from "@/services/Constant";
import ChatClient from "@/app/components/chat/ChatClient";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { addFavorite, removeFavorite } from "@/services/FavoriteService";
import { useFavoriteStore } from "@/stores/FavoriteStore";

export default function UserInfoCard({ id }: { id: string }) {
  const [isSaved, setIsSaved] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [isRobot, setIsRobot] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [landlord, setLandlord] = useState<LandlordDetailByRoom | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const { data: session } = useSession();
  
  const [favoriteCount, setFavoriteCount] = useState(0);
  const { favoriteRoomIds } = useFavoriteStore();
  const isFavorited = favoriteRoomIds.has(id);

  const currentPostUrl = `http://localhost:3000/detail/${id}`;
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch(`${API_URL}/online-users`);
        const data = await res.json();
        setOnlineUsers(data);
      } catch (e) {
        console.error("Error fetching online users:", e);
        setOnlineUsers([]);
      }
    }
    fetchUsers();
    const interval = setInterval(fetchUsers, 3000);
    return () => clearInterval(interval);
  }, []);

  // Scroll handler for sticky behavior
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const threshold = 200; // Sticky after scrolling 200px

      const viewportHeight = window.innerHeight;
      const cardElement = document.querySelector(
        "[data-user-info-card]"
      ) as HTMLElement | null;
      if (!cardElement) return;
      const cardRect = cardElement.getBoundingClientRect();
      const cardHeight = cardRect.height || 0;

      // Only make sticky if there's enough viewport space
      const hasEnoughSpace = viewportHeight > cardHeight + 100; // 100px buffer

      // By default decide sticky based on scroll and available space
      let shouldStick = scrollPosition > threshold && hasEnoughSpace;

      // If there's a featured listings card, ensure sticky placement won't overlap it.
      const featured = document.querySelector(
        "[data-featured-listings]"
      ) as HTMLElement | null;
      if (featured && shouldStick) {
        const featuredRect = featured.getBoundingClientRect();
        // When sticky, the card will be positioned at top:10 (top-10). Compute its bottom in viewport coords.
        const stickyTop = 10; // matches 'top-10' class
        const stickyBottom = stickyTop + cardHeight;
        // If the sticky card's bottom would be below the featured card's top, disable sticky to avoid overlap
        if (stickyBottom + 8 > featuredRect.top) {
          shouldStick = false;
        }
      }

      setIsSticky(shouldStick);

      // Adjust featured card spacing when sticky, otherwise reset
      if (featured && cardElement) {
        if (shouldStick) {
          featured.style.marginTop = cardHeight + 16 + "px";
        } else {
          featured.style.marginTop = "";
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll); // Also check on resize

    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  useEffect(() => {
    async function fetchData() {
      const data = await getLandlordByRoomId(id);
      setLandlord(data as LandlordDetailByRoom);
    }
    fetchData();
  }, [id]);


    useEffect(() => {
    async function fetchFavoriteCount() {
      if (id) {
        const countRes = await fetch(`/api/favorites/rooms/${id}/count`);
        const count = await countRes.json();
        setFavoriteCount(count);
      }
    }
    fetchFavoriteCount();
  }, [id]);

  const handleFavorite = async () => {
    if (!session?.user?.id) {
      redirect("/auth/login");
      return;
    }

    try {
      if (isFavorited) {
        await removeFavorite(id);
      } else {
        await addFavorite(id);
      }
      
      // Refresh favorite count
      const countRes = await fetch(`/api/favorites/rooms/${id}/count`);
      const newCount = await countRes.json();
      setFavoriteCount(newCount);
    } catch (error) {
      console.error("Failed to update favorite status:", error);
    }
  };

  if (!landlord) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-white border border-gray-200 shadow-lg rounded-2xl min-h-96 animate-pulse">
        <div className="w-24 h-24 mb-4 bg-gray-200 rounded-full"></div>
        <div className="w-32 h-4 mb-2 bg-gray-200 rounded"></div>
        <div className="w-24 h-3 mb-4 bg-gray-200 rounded"></div>
        <div className="w-full space-y-3">
          <div className="w-full h-12 bg-gray-200 rounded-xl"></div>
          <div className="w-full h-12 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  const handleSavePost = () => {
    setIsSaved(!isSaved);
    if (!isSaved) {
      console.log("Tin đã lưu thành công!");
    } else {
      console.log("Tin đã được hủy lưu!");
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard
      .writeText(currentPostUrl)
      .then(() => {
        console.log("Đã sao chép URL vào clipboard!");
      })
      .catch((err) => {
        console.error("Không thể sao chép URL: ", err);
      });
  };

  const handleSubmitReport = () => {
    if (!reportReason) {
      alert("Vui lòng chọn lý do phản ánh.");
      return;
    }
    if (!isRobot) {
      alert("Vui lòng xác nhận bạn không phải là người máy.");
      return;
    }
    if (!contactName.trim() || !contactPhone.trim()) {
      alert("Vui lòng nhập Họ tên và Số điện thoại liên hệ.");
      return;
    }

    console.log("Gửi báo xấu:", {
      reason: reportReason,
      description: reportDescription,
      contactName: contactName,
      contactPhone: contactPhone,
      isRobot: isRobot,
      postUrl: currentPostUrl,
    });

    alert("Cảm ơn bạn đã gửi phản ánh!");
    setShowReportModal(false);
    setReportReason("");
    setReportDescription("");
    setContactName("");
    setContactPhone("");
    setIsRobot(false);
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setShowShareModal(false);
      setShowReportModal(false);
    }
  };

  const isOnline = onlineUsers.includes(landlord.id);

  return (
    <div
      data-user-info-card
      className={`space-y-4 transition-all duration-300 ${
        isSticky ? "sticky top-10 z-10" : ""
      }`}
    >
      {/* Main Profile Card */}
      <div className="overflow-hidden transition-all duration-500 bg-white border border-gray-100 shadow-xl rounded-2xl hover:shadow-2xl">
        {/* Header with gradient background */}
        <div className="relative p-6 text-white bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">
          <div className="absolute top-0 right-0 w-32 h-32 -mt-16 -mr-16 rounded-full bg-white/10"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 -mb-12 -ml-12 rounded-full bg-white/10"></div>

          <div className="relative flex flex-col items-center">
            <div className="relative mb-4">
              <div className="relative">
                <Image
                  src={
                    landlord.avatar
                      ? URL_IMAGE + landlord.avatar
                      : "/images/default/avatar.jpg"
                  }
                  alt="User Avatar"
                  width={90}
                  height={90}
                  className="object-cover border-4 shadow-xl rounded-2xl border-white/30 backdrop-blur-sm"
                  priority
                />
                {/* Online status indicator */}
                <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1.5 shadow-lg">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      isOnline
                        ? "bg-gradient-to-r from-green-400 to-emerald-500"
                        : "bg-gradient-to-r from-gray-400 to-gray-500"
                    }`}
                  >
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <h3 className="text-xl font-bold text-white">
                  {landlord.fullName}
                </h3>
                <FaCrown className="w-4 h-4 text-yellow-300" />
              </div>

              <div
                className={`flex items-center gap-2 justify-center px-3 py-1 rounded-full backdrop-blur-sm ${
                  isOnline
                    ? "bg-green-400/20 border border-green-300/30"
                    : "bg-white/10 border border-white/20"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    isOnline ? "bg-green-300 animate-pulse" : "bg-gray-300"
                  }`}
                ></div>
                <p
                  className={`text-xs font-medium ${
                    isOnline ? "text-green-100" : "text-white/80"
                  }`}
                >
                  {isOnline ? "Online now" : "Offline"}
                </p>
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
                  <FaStar className="w-3 h-3 text-yellow-500" />
                  <p className="text-lg font-bold text-gray-800">
                    {landlord.amountPost}
                  </p>
                </div>
                <p className="text-xs font-medium text-gray-600">Listings</p>
              </div>

              <div className="w-px h-8 bg-gray-200"></div>

              <div className="flex-1 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <FaUserCheck className="w-3 h-3 text-blue-500" />
                  <p className="text-sm font-bold text-gray-800">Member</p>
                </div>
                <p className="text-xs font-medium text-gray-600">
                  Since {landlord.createDate}
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
            {/* Contact Button */}
            <Link
              href={
                landlord.phone
                  ? `tel:${landlord.phone}`
                  : `mailto:${landlord.email}`
              }
              className="group relative w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-4 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-3 overflow-hidden"
            >
              <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-r from-green-600 to-emerald-700 group-hover:opacity-100"></div>
              <div className="relative flex items-center gap-3">
                {landlord.phone ? (
                  <MdPhone className="w-5 h-5" />
                ) : (
                  <MdEmail className="w-5 h-5" />
                )}
                <span className="font-semibold">
                  {landlord.phone || landlord.email}
                </span>
              </div>
            </Link>

            {/* Chat Button */}
            <button
              onClick={() => {
                if (!session?.user?.id) {
                  redirect("/auth/login");
                }
                setShowChat(true);
              }}
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
      </div>

      {/* Action Cards */}
      <div className="p-4 bg-white border border-gray-100 shadow-lg rounded-2xl">
        <div className="grid grid-cols-3 gap-2">
          
          <button
  onClick={handleFavorite}
  className={`group flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300 ${
    isFavorited
      ? "bg-gradient-to-br from-red-50 to-pink-50 text-red-700 shadow-md border border-red-200/50"
      : "text-slate-600 hover:text-red-700 hover:bg-gradient-to-br hover:from-red-50 hover:to-pink-50 hover:shadow-md hover:border hover:border-red-200/50"
  }`}
>
  <div
    className={`p-2 rounded-lg transition-colors ${
      isFavorited ? "bg-red-100" : "bg-gray-100 group-hover:bg-red-100"
    }`}
  >
    {isFavorited ? (
      <AiFillHeart className="w-4 h-4" />
    ) : (
      <AiOutlineHeart className="w-4 h-4" />
    )}
  </div>
  
  {/* Like và số gộp chung */}
  <span className="text-xs font-semibold">
    {isFavorited ? "Favorites" : "Favorite"} {favoriteCount}
  </span>
</button>

          <button
            onClick={() => setShowShareModal(true)}
            className="flex flex-col items-center gap-2 p-4 transition-all duration-300 group rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-gradient-to-br hover:from-emerald-50 hover:to-teal-50 hover:shadow-md hover:border hover:border-emerald-200/50"
          >
            <div className="p-2 transition-colors bg-gray-100 rounded-lg group-hover:bg-emerald-100">
              <IoShareSocialOutline className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold">Share</span>
          </button>

          <button
            onClick={() => setShowReportModal(true)}
            className="flex flex-col items-center gap-2 p-4 transition-all duration-300 group rounded-xl text-slate-600 hover:text-red-700 hover:bg-gradient-to-br hover:from-red-50 hover:to-pink-50 hover:shadow-md hover:border hover:border-red-200/50"
          >
            <div className="p-2 transition-colors bg-gray-100 rounded-lg group-hover:bg-red-100">
              <IoWarningOutline className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold">Report</span>
          </button>
        </div>
      </div>

      {/* Trust & Safety Card */}
      <div className="p-4 border border-gray-200 bg-gradient-to-br from-gray-50 to-blue-50/50 rounded-2xl">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BiShield className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h4 className="mb-1 text-sm font-semibold text-gray-800">
              Safety First
            </h4>
            <p className="text-xs leading-relaxed text-gray-600">
              Always meet in public places and verify property details before
              making any payments.
            </p>
          </div>
        </div>
      </div>

      {/* Chat Modal */}
      {showChat && (
        <div
          className="fixed z-50 flex items-end bottom-6 right-6"
          style={{ pointerEvents: "none" }}
        >
          <div
            className="rounded-2xl shadow-2xl p-0 max-w-sm w-[600px] relative bg-white"
            style={{ pointerEvents: "auto" }}
          >
            <button
              className="absolute z-50 flex items-center justify-center w-8 h-8 text-xl text-gray-400 transition-colors rounded-full top-4 right-6 hover:text-gray-600 hover:bg-gray-100"
              onClick={() => setShowChat(false)}
            >
              &times;
            </button>
            <ChatClient
              senderId={session?.user?.id ? String(session.user.id) : ""}
              recipientId={landlord.id ? String(landlord.id) : ""}
              defaultToUserName={landlord.fullName}
            />
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
          onMouseDown={handleOverlayClick}
        >
          <div
            className="relative w-full max-w-md p-8 bg-white border shadow-2xl rounded-2xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute flex items-center justify-center w-8 h-8 text-gray-400 transition-colors rounded-full top-4 right-4 hover:text-gray-600 hover:bg-gray-100"
            >
              <FaTimes className="w-4 h-4" />
            </button>
            <div className="mb-6 text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600">
                <IoShareSocialOutline className="w-8 h-8 text-white" />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-gray-800">
                Share this listing
              </h2>
              <p className="text-gray-600">
                Copy the link to share with others
              </p>
            </div>
            <div className="flex items-center overflow-hidden transition-colors border-2 border-gray-200 shadow-sm rounded-xl hover:border-blue-300">
              <input
                type="text"
                readOnly
                value={currentPostUrl}
                className="flex-grow p-4 text-sm text-gray-700 outline-none bg-gray-50"
              />
              <button
                onClick={handleCopyLink}
                className="px-6 py-4 font-semibold text-white transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
          onMouseDown={handleOverlayClick}
        >
          <div
            className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-lg max-h-[85vh] relative overflow-y-auto"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowReportModal(false)}
              className="absolute z-10 flex items-center justify-center w-8 h-8 text-gray-400 transition-colors rounded-full top-4 right-4 hover:text-gray-600 hover:bg-gray-100"
            >
              <FaTimes className="w-4 h-4" />
            </button>

            <div className="pr-8 mb-6 text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-red-500 to-pink-600">
                <IoWarningOutline className="w-8 h-8 text-white" />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-gray-800">
                Report this listing
              </h2>
              <p className="text-gray-600">
                Help us keep the platform safe and reliable
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-800">
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full p-4 text-gray-800 placeholder-gray-400 transition-all border border-gray-200 outline-none rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Your full name"
                  />
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full p-4 text-gray-800 placeholder-gray-400 transition-all border border-gray-200 outline-none rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Your phone number"
                  />
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-800">
                  Reason for reporting
                </h3>
                <div className="space-y-2">
                  {[
                    "Information has expired/no longer valid",
                    "Duplicate content",
                    "Unable to contact the listing owner",
                    "Information in the listing is inaccurate (price, area, images...)",
                    "Other reasons",
                  ].map((reason) => (
                    <label
                      key={reason}
                      className="flex items-start gap-3 p-3 transition-all border border-transparent cursor-pointer rounded-xl hover:bg-gray-50 hover:border-gray-200"
                    >
                      <input
                        type="radio"
                        name="reportReason"
                        value={reason}
                        checked={reportReason === reason}
                        onChange={(e) => setReportReason(e.target.value)}
                        className="mt-0.5 w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {reason}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-800">
                  Additional details
                </h3>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  className="w-full p-4 text-gray-800 placeholder-gray-400 transition-all border border-gray-200 outline-none resize-none rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  rows={4}
                  placeholder="Provide more details about the issue..."
                />
              </div>

              <label className="flex items-start gap-3 p-3 border border-gray-200 cursor-pointer rounded-xl hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={isRobot}
                  onChange={(e) => setIsRobot(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  I confirm that I am not a robot
                </span>
              </label>

              <button
                onClick={handleSubmitReport}
                className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold py-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
