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

      // Get viewport height to ensure we don't make it sticky if there's not enough space
      const viewportHeight = window.innerHeight;
      const cardElement = document.querySelector("[data-user-info-card]");
      const cardHeight = cardElement?.getBoundingClientRect().height || 0;

      // Only make sticky if there's enough viewport space
      const hasEnoughSpace = viewportHeight > cardHeight + 100; // 100px buffer

      setIsSticky(scrollPosition > threshold && hasEnoughSpace);
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

  if (!landlord) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 min-h-96 flex flex-col items-center justify-center text-center animate-pulse">
        <div className="w-24 h-24 bg-gray-200 rounded-full mb-4"></div>
        <div className="w-32 h-4 bg-gray-200 rounded mb-2"></div>
        <div className="w-24 h-3 bg-gray-200 rounded mb-4"></div>
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
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500">
        {/* Header with gradient background */}
        <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-6 text-white">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>

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
                  className="rounded-2xl object-cover border-4 border-white/30 shadow-xl backdrop-blur-sm"
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
              <div className="flex items-center gap-2 justify-center mb-2">
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
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <FaStar className="w-3 h-3 text-yellow-500" />
                  <p className="text-lg font-bold text-gray-800">
                    {landlord.amountPost}
                  </p>
                </div>
                <p className="text-xs text-gray-600 font-medium">Listings</p>
              </div>

              <div className="w-px h-8 bg-gray-200"></div>

              <div className="text-center flex-1">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <FaUserCheck className="w-3 h-3 text-blue-500" />
                  <p className="text-sm font-bold text-gray-800">Member</p>
                </div>
                <p className="text-xs text-gray-600 font-medium">
                  Since {landlord.createDate}
                </p>
              </div>
            </div>
          </div>

          {/* Verification Badges */}
          <div className="flex flex-wrap gap-2 justify-center">
            <div className="flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200">
              <MdVerified className="w-3 h-3" />
              <span className="text-xs font-medium">Verified</span>
            </div>
            <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
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
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center gap-3">
                {landlord.phone ? (
                  <MdPhone className="h-5 w-5" />
                ) : (
                  <MdEmail className="h-5 w-5" />
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
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center gap-3">
                <IoChatbubbleEllipsesOutline className="w-5 h-5" />
                <span className="font-semibold">Start Conversation</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={handleSavePost}
            className={`group flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300 ${
              isSaved
                ? "bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-700 shadow-md border border-blue-200/50"
                : "text-slate-600 hover:text-blue-700 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 hover:shadow-md hover:border hover:border-blue-200/50"
            }`}
          >
            <div
              className={`p-2 rounded-lg transition-colors ${
                isSaved ? "bg-blue-100" : "bg-gray-100 group-hover:bg-blue-100"
              }`}
            >
              {isSaved ? (
                <FaBookmark className="h-4 w-4" />
              ) : (
                <FaRegBookmark className="h-4 w-4" />
              )}
            </div>
            <span className="text-xs font-semibold">
              {isSaved ? "Saved" : "Save"}
            </span>
          </button>

          <button
            onClick={() => setShowShareModal(true)}
            className="group flex flex-col items-center gap-2 p-4 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-gradient-to-br hover:from-emerald-50 hover:to-teal-50 hover:shadow-md hover:border hover:border-emerald-200/50 transition-all duration-300"
          >
            <div className="p-2 bg-gray-100 group-hover:bg-emerald-100 rounded-lg transition-colors">
              <IoShareSocialOutline className="h-4 w-4" />
            </div>
            <span className="text-xs font-semibold">Share</span>
          </button>

          <button
            onClick={() => setShowReportModal(true)}
            className="group flex flex-col items-center gap-2 p-4 rounded-xl text-slate-600 hover:text-red-700 hover:bg-gradient-to-br hover:from-red-50 hover:to-pink-50 hover:shadow-md hover:border hover:border-red-200/50 transition-all duration-300"
          >
            <div className="p-2 bg-gray-100 group-hover:bg-red-100 rounded-lg transition-colors">
              <IoWarningOutline className="h-4 w-4" />
            </div>
            <span className="text-xs font-semibold">Report</span>
          </button>
        </div>
      </div>

      {/* Trust & Safety Card */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50/50 rounded-2xl p-4 border border-gray-200">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BiShield className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800 text-sm mb-1">
              Safety First
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Always meet in public places and verify property details before
              making any payments.
            </p>
          </div>
        </div>
      </div>

      {/* Chat Modal */}
      {showChat && (
        <div
          className="fixed bottom-6 right-6 z-50 flex items-end"
          style={{ pointerEvents: "none" }}
        >
          <div
            className="rounded-2xl shadow-2xl p-0 max-w-sm w-[600px] relative bg-white"
            style={{ pointerEvents: "auto" }}
          >
            <button
              className="absolute top-4 right-6 text-gray-400 hover:text-gray-600 text-xl z-50 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
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
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onMouseDown={handleOverlayClick}
        >
          <div
            className="bg-white rounded-2xl p-8 shadow-2xl w-full max-w-md relative border"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <FaTimes className="h-4 w-4" />
            </button>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <IoShareSocialOutline className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-gray-800">
                Share this listing
              </h2>
              <p className="text-gray-600">
                Copy the link to share with others
              </p>
            </div>
            <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm hover:border-blue-300 transition-colors">
              <input
                type="text"
                readOnly
                value={currentPostUrl}
                className="flex-grow p-4 text-gray-700 bg-gray-50 outline-none text-sm"
              />
              <button
                onClick={handleCopyLink}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 transition-all duration-300"
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
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onMouseDown={handleOverlayClick}
        >
          <div
            className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-lg max-h-[85vh] relative overflow-y-auto"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowReportModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors z-10"
            >
              <FaTimes className="h-4 w-4" />
            </button>

            <div className="text-center mb-6 pr-8">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <IoWarningOutline className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-gray-800">
                Report this listing
              </h2>
              <p className="text-gray-600">
                Help us keep the platform safe and reliable
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-3">
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full p-4 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    placeholder="Your full name"
                  />
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full p-4 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    placeholder="Your phone number"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-3">
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
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200 transition-all"
                    >
                      <input
                        type="radio"
                        name="reportReason"
                        value={reason}
                        checked={reportReason === reason}
                        onChange={(e) => setReportReason(e.target.value)}
                        className="mt-0.5 w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 font-medium">
                        {reason}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-3">
                  Additional details
                </h3>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  className="w-full p-4 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
                  rows={4}
                  placeholder="Provide more details about the issue..."
                />
              </div>

              <label className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer border border-gray-200">
                <input
                  type="checkbox"
                  checked={isRobot}
                  onChange={(e) => setIsRobot(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 font-medium">
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
