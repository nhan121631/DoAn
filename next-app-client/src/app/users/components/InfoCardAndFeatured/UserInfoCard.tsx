"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { MdPhone, MdEmail } from "react-icons/md";
import { FaRegBookmark, FaBookmark, FaTimes } from "react-icons/fa";
import { IoShareSocialOutline, IoWarningOutline } from "react-icons/io5";
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
  const { data: session } = useSession();

  const currentPostUrl = `http://localhost:3000/detail/${id}`;

  // const { messages, sendMessage: wsSendMessage } = useWebSocket(
  //   session?.user?.id || ""
  // );

  // // Gửi tin nhắn: chỉ gửi qua WebSocket, không thêm local vào state (chỉ render khi nhận từ server)
  // const handleSendMessage = (toUserId: string, message: string) => {
  //   wsSendMessage(toUserId, message);
  // };
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
    const interval = setInterval(fetchUsers, 3000); // Cập nhật mỗi 3s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function fetchData() {
      const data = await getLandlordByRoomId(id);
      setLandlord(data as LandlordDetailByRoom);
    }
    fetchData();
  }, [id]);

  if (!landlord) {
    return <div>Landlord not found</div>;
  }

  const handleSavePost = () => {
    setIsSaved(!isSaved); // Đảo ngược
    if (!isSaved) {
      console.log("Tin đã lưu thành công!"); // Thông báo lưu thành công
    } else {
      console.log("Tin đã được hủy lưu!");
    }
  };

  // Sao chép URL
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

  // Hàm xử lý đóng modal khi click ra ngoài lớp phủ
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      // Chỉ đóng khi click trực tiếp vào lớp phủ
      setShowShareModal(false);
      setShowReportModal(false);
    }
  };
  console.log("landlord_id: ", landlord.id);
  console.log("onlineUsers: ", onlineUsers);

  return (
    <div className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/40 rounded-2xl shadow-lg border border-blue-100/50 p-6 min-h-96 flex flex-col items-center text-center hover:shadow-xl hover:border-blue-200/60 transition-all duration-300">
      <div className="relative">
        <div className="p-1 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full shadow-md">
          <Image
            src={URL_IMAGE + landlord.avatar || "/images/useravt.png"}
            alt="User Avatar"
            width={100}
            height={100}
            className="rounded-full object-cover border-2 border-white shadow-sm"
            priority
          />
        </div>
        {onlineUsers.includes(landlord.id) ? (
          <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1.5 shadow-lg">
            <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            </div>
          </div>
        ) : (
          <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1.5 shadow-lg">
            <div className="w-4 h-4 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
        )}
      </div>

      <h3 className="text-xl font-semibold mt-4 bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent">
        {landlord.fullName}
      </h3>

      {onlineUsers.includes(landlord.id) ? (
        <div className="flex items-center gap-2 mt-1 bg-green-50 px-3 py-1 rounded-full">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <p className="text-sm text-green-700 font-medium">Online now</p>
        </div>
      ) : (
        <div className="flex items-center gap-2 mt-1 bg-gray-50 px-3 py-1 rounded-full">
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          <p className="text-sm text-gray-600">Offline</p>
        </div>
      )}

      <p className="text-sm text-slate-600 mt-2 bg-gradient-to-r from-slate-50 to-blue-50 px-4 py-2 rounded-full border border-slate-200/50">
        {landlord.amountPost} listings • Member since {landlord.createDate}
      </p>

      <div className="flex flex-col gap-3 mt-6 w-full">
        <Link
          href={`tel:${landlord.phone}` || `mailto:${landlord.email}`}
          className={`${
            landlord.phone
              ? "bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl"
              : "bg-gray-500 hover:bg-gray-600 text-white shadow-md hover:shadow-lg"
          } font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-[1.02]`}
        >
          {landlord.phone ? (
            <MdPhone className="h-5 w-5" />
          ) : (
            <MdEmail className="h-5 w-5" />
          )}
          <span className="font-medium">
            {landlord.phone || landlord.email}
          </span>
        </Link>

        <button
          onClick={() => {
            if (!session?.user?.id) {
              redirect("/auth/login");
            }
            setShowChat(true);
          }}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium py-3 px-4 rounded-xl shadow-lg hover:shadow-xl flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-[1.02]"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          Start conversation
        </button>

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
      </div>

      <div className="flex justify-between w-full mt-8 pt-4 border-t border-gray-200">
        <button
          onClick={handleSavePost}
          className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all duration-300 ${
            isSaved
              ? "text-blue-700 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md border border-blue-200/50"
              : "text-slate-600 hover:text-blue-700 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 hover:shadow-md hover:border hover:border-blue-200/50"
          }`}
        >
          {isSaved ? (
            <FaBookmark className="h-4 w-4" />
          ) : (
            <FaRegBookmark className="h-4 w-4" />
          )}
          <span className="text-xs font-medium">
            {isSaved ? "Saved" : "Save"}
          </span>
        </button>

        <button
          onClick={() => setShowShareModal(true)}
          className="flex flex-col items-center gap-1 py-2 px-3 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-gradient-to-br hover:from-emerald-50 hover:to-teal-50 hover:shadow-md hover:border hover:border-emerald-200/50 transition-all duration-300"
        >
          <IoShareSocialOutline className="h-4 w-4" />
          <span className="text-xs font-medium">Share</span>
        </button>

        <button
          onClick={() => setShowReportModal(true)}
          className="flex flex-col items-center gap-1 py-2 px-3 rounded-xl text-slate-600 hover:text-red-700 hover:bg-gradient-to-br hover:from-red-50 hover:to-pink-50 hover:shadow-md hover:border hover:border-red-200/50 transition-all duration-300"
        >
          <IoWarningOutline className="h-4 w-4" />
          <span className="text-xs font-medium">Report</span>
        </button>
      </div>

      {showShareModal && (
        <div
          className="fixed inset-0 bg-gradient-to-br from-black/10 via-blue-900/20 to-indigo-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onMouseDown={handleOverlayClick}
        >
          <div
            className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-md relative border border-blue-100/50"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <FaTimes className="h-4 w-4" />
            </button>
            <h2 className="text-2xl font-semibold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Share this listing
            </h2>
            <p className="mb-6 text-slate-600">
              Copy the link to share with others
            </p>
            <div className="flex items-center border border-blue-200/60 rounded-xl overflow-hidden shadow-sm">
              <input
                type="text"
                readOnly
                value={currentPostUrl}
                className="flex-grow p-3 text-slate-700 bg-gradient-to-r from-blue-50/30 to-indigo-50/30 outline-none text-sm"
              />
              <button
                onClick={handleCopyLink}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-4 transition-all duration-300"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      )}

      {showReportModal && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onMouseDown={handleOverlayClick}
        >
          <div
            className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-md max-h-[80vh] relative overflow-y-auto"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowReportModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors z-10"
            >
              <FaTimes className="h-4 w-4" />
            </button>
            <h2 className="text-2xl font-semibold mb-6 text-gray-900 pr-8">
              Report this listing
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <input
                      type="text"
                      id="contactName"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      id="contactPhone"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                      placeholder="Your phone number"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
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
                      className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="reportReason"
                        value={reason}
                        checked={reportReason === reason}
                        onChange={(e) => setReportReason(e.target.value)}
                        className="mt-0.5 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{reason}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Additional details
                </h3>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
                  rows={3}
                  placeholder="Provide more details about the issue..."
                />
              </div>

              <label className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRobot}
                  onChange={(e) => setIsRobot(e.target.checked)}
                  className="mt-0.5 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  I confirm that I am not a robot
                </span>
              </label>

              <button
                onClick={handleSubmitReport}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 rounded-xl transition-colors duration-200"
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
