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
    <div className="bg-white rounded-xl shadow-lg py-15 px-6 min-h-96 flex flex-col items-center text-center">
      <Image
        src={URL_IMAGE + landlord.avatar || "/images/useravt.png"}
        alt="User Avatar"
        width={100}
        height={100}
        className="rounded-full object-cover border-4 border-blue-400"
        priority
      />
      <h3 className="text-xl font-bold mt-4 text-gray-800">
        {landlord.fullName}
      </h3>
      {onlineUsers.includes(landlord.id) ? (
        <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Active
        </p>
      ) : (
        <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          Offline
        </p>
      )}
      <p className="text-xs text-gray-500 mt-1">
        {landlord.amountPost} Post - Joined since: {landlord.createDate}
      </p>
      <div className="flex flex-col gap-3 mt-6 w-full">
        <Link
          href={`tel:${landlord.phone}` || `mailto:${landlord.email}`}
          className={`${
            landlord.phone ? "bg-green-500 hover:bg-green-600" : "bg-gray-500"
          } text-white font-semibold py-3 rounded-lg shadow-md flex items-center justify-center gap-2 transition duration-300`}
        >
          {landlord.phone ? (
            <MdPhone className="h-5 w-5" />
          ) : (
            <MdEmail className="h-5 w-5" />
          )}
          {landlord.phone || landlord.email}
        </Link>
        {/* <Link
          href={
            `https://zalo.me/${landlord.phone}` || `mailto:${landlord.email}`
          }
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg shadow-md flex items-center justify-center gap-2 transition duration-300"
        >
          <MdMessage className="h-5 w-5" />
          Chat with Zalo
        </Link> */}
        <button
          onClick={() => {
            if (!session?.user?.id) {
              redirect("/auth/login");
            }
            setShowChat(true);
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg shadow-md flex items-center justify-center gap-2 transition duration-300"
        >
          Chat with landlord
        </button>
        {showChat && (
          <div
            className="fixed bottom-6 right-6 z-50 flex items-end"
            style={{ pointerEvents: "none" }}
          >
            <div
              className=" rounded-xl shadow-2xl p-0 max-w-sm w-[600px] relative "
              style={{ pointerEvents: "auto" }}
            >
              <button
                className="absolute top-4 right-6 text-gray-500 hover:text-gray-800 text-4xl z-50"
                onClick={() => setShowChat(false)}
              >
                &times;
              </button>
              <ChatClient
                senderId={session?.user?.id ? String(session.user.id) : ""}
                recipientId={landlord.id ? String(landlord.id) : ""}
                defaultToUserName={landlord.fullName}
                // sendMessage={handleSendMessage}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-around w-full mt-6 text-gray-600 text-sm">
        <button
          onClick={handleSavePost}
          className={`flex flex-col items-center transition w-28 ${
            isSaved ? "text-red-500" : "hover:text-blue-600"
          }`}
        >
          {isSaved ? (
            <FaBookmark className="h-6 w-6" />
          ) : (
            <FaRegBookmark className="h-6 w-6" />
          )}
          {isSaved ? "Tin đã lưu" : "Lưu tin"}
        </button>
        <button
          onClick={() => {
            setShowShareModal(true);
          }}
          className="flex flex-col items-center hover:text-blue-600 transition w-28"
        >
          <IoShareSocialOutline className="h-6 w-6" />
          Chia sẻ
        </button>
        <button
          onClick={() => setShowReportModal(true)}
          className="flex flex-col items-center hover:text-red-600 transition w-28"
        >
          <IoWarningOutline className="h-6 w-6" />
          Báo xấu
        </button>
      </div>

      {showShareModal && (
        <div
          className="fixed inset-0 bg-gray-800/50 flex items-center justify-end z-50"
          onMouseDown={handleOverlayClick}
        >
          <div
            className="bg-white rounded-lg p-6 shadow-xl h-full w-full max-w-sm relative transform transition-transform duration-300 ease-in-out"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              <FaTimes className="h-6 w-6" />
            </button>
            <h2 className="text-xl font-bold mb-4 text-gray-800">Share</h2>
            <p className="mb-4 text-gray-700">Share this post</p>
            <div className="flex items-center border border-gray-300 rounded-md overflow-hidden mb-4">
              <input
                type="text"
                readOnly
                value={currentPostUrl}
                className="flex-grow p-2 text-gray-700 bg-gray-100 outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 transition duration-300"
              >
                Sao chép
              </button>
            </div>
          </div>
        </div>
      )}

      {showReportModal && (
        <div
          className="fixed inset-0 bg-gray-800/50 flex items-center justify-end z-50"
          onMouseDown={handleOverlayClick}
        >
          <div
            className="bg-white rounded-lg p-5 shadow-xl h-full w-full max-w-sm relative transform transition-transform duration-300 ease-in-out overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] "
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowReportModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              <FaTimes className="h-6 w-6" />
            </button>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Report Post
            </h2>
            <p className="mb-3 text-gray-700 text-base font-bold">
              Contact Information
            </p>
            <div className="mb-4">
              <label className="block text-left text-gray-700 text-base mb-2">
                Your Name
              </label>
              <input
                type="text"
                id="contactName"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md text-gray-800 text-base"
                placeholder="Nhập họ tên của bạn"
              />
            </div>
            <div className="mb-6">
              <label className="block text-left text-gray-700 text-base mb-2">
                Your Phone Number
              </label>
              <input
                type="tel"
                id="contactPhone"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md text-gray-800 text-base"
                placeholder="Nhập số điện thoại của bạn"
              />
            </div>
            <p className="mb-2 text-gray-700 text-lg">Reason for Reporting:</p>
            <div className="flex flex-col space-y-3 mb-6">
              <label className="inline-flex items-center text-gray-700 text-base">
                <input
                  type="radio"
                  name="reportReason"
                  value="Thông tin đã hết/không còn hiệu lực"
                  checked={
                    reportReason === "Thông tin đã hết/không còn hiệu lực"
                  }
                  onChange={(e) => setReportReason(e.target.value)}
                  className="form-radio text-blue-600 h-5 w-5"
                />
                <span className="ml-3">Information has expired</span>
              </label>
              <label className="inline-flex items-center text-gray-700 text-base">
                <input
                  type="radio"
                  name="reportReason"
                  value="Duplicate content"
                  checked={reportReason === "Duplicate content"}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="form-radio text-blue-600 h-5 w-5"
                />
                <span className="ml-3">Duplicate content</span>
              </label>
              <label className="inline-flex items-center text-gray-700 text-base">
                <input
                  type="radio"
                  name="reportReason"
                  value="Unable to contact the listing owner"
                  checked={
                    reportReason === "Unable to contact the listing owner"
                  }
                  onChange={(e) => setReportReason(e.target.value)}
                  className="form-radio text-blue-600 h-5 w-5"
                />
                <span className="ml-3">
                  Unable to contact the listing owner
                </span>
              </label>
              <label className="inline-flex items-center text-gray-700 text-base">
                <input
                  type="radio"
                  name="reportReason"
                  value="Information in the listing is inaccurate (price, area, images...)"
                  checked={
                    reportReason ===
                    "Information in the listing is inaccurate (price, area, images...)"
                  }
                  onChange={(e) => setReportReason(e.target.value)}
                  className="form-radio text-blue-600 h-5 w-5"
                />
                <span className="ml-3">
                  Information in the listing is inaccurate (price, area,
                  images...)
                </span>
              </label>
              <label className="inline-flex items-center text-gray-700 text-base">
                <input
                  type="radio"
                  name="reportReason"
                  value="Lý do khác"
                  checked={reportReason === "Lý do khác"}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="form-radio text-blue-600 h-5 w-5"
                />
                <span className="ml-3">Other reasons</span>
              </label>
            </div>

            <p className="mb-3 text-gray-700 text-base">More Description</p>
            <textarea
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md mb-6 text-gray-800 text-base"
              rows={3}
              placeholder="Enter detailed description..."
            ></textarea>

            <label className="inline-flex items-center text-gray-700 text-base mb-6">
              <input
                type="checkbox"
                checked={isRobot}
                onChange={(e) => setIsRobot(e.target.checked)}
                className="form-checkbox text-blue-600 h-5 w-5"
              />
              <span className="ml-3">I am not a robot</span>
            </label>

            <button
              onClick={handleSubmitReport}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg shadow-md transition duration-300 text-lg"
            >
              Send Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
