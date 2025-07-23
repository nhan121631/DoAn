"use client";

import React, { useState } from 'react'; 
import Image from 'next/image';
import Link from 'next/link';
import { MdPhone, MdMessage } from 'react-icons/md';
import { FaRegBookmark, FaBookmark, FaTimes } from 'react-icons/fa'; 
import { IoShareSocialOutline, IoWarningOutline } from 'react-icons/io5';

export default function UserInfoCard() {
  const [isSaved, setIsSaved] = useState(false); // Trạng thái của nút Lưu tin
  const [showShareModal, setShowShareModal] = useState(false); // Trạng thái hiển thị modal Chia sẻ
  const [showReportModal, setShowReportModal] = useState(false); // Trạng thái hiển thị modal Báo xấu
  const [reportReason, setReportReason] = useState(''); // Trạng thái lý do báo xấu
  const [reportDescription, setReportDescription] = useState(''); // Trạng thái mô tả báo xấu
  const [isRobot, setIsRobot] = useState(false); // Trạng thái checkbox "Tôi không phải là người máy"
  const [contactName, setContactName] = useState(''); 
  const [contactPhone, setContactPhone] = useState(''); 

  const currentPostUrl = "http://localhost:3000/users";

  const handleSavePost = () => {
    setIsSaved(!isSaved); // Đảo ngược 
    if (!isSaved) {
      console.log("Tin đã được lưu!");
    } else {
      console.log("Tin đã được hủy lưu!");
    }
  };

  // Sao chép URL
  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentPostUrl)
      .then(() => {
        console.log("Đã sao chép URL vào clipboard!");
      })
      .catch(err => {
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
    setReportReason(''); 
    setReportDescription('');
    setContactName(''); 
    setContactPhone('');
    setIsRobot(false);
  };

  // Hàm xử lý đóng modal khi click ra ngoài lớp phủ
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) { // Chỉ đóng khi click trực tiếp vào lớp phủ
      setShowShareModal(false);
      setShowReportModal(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg py-15 px-6 min-h-96 flex flex-col items-center text-center">
      <Image
        src="/images/useravt.png"
        alt="User Avatar"
        width={100}
        height={100}
        className="rounded-full object-cover border-4 border-blue-400"
        priority
      />
      <h3 className="text-xl font-bold mt-4 text-gray-800">Park Eun Bin (*)</h3>
      <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
        Đang hoạt động
      </p>
      <p className="text-xs text-gray-500 mt-1">
        2 tin đăng - Tham gia từ: 28/07/2025
      </p>
      <div className="flex flex-col gap-3 mt-6 w-full">
        <Link
          href="tel:0918180057"
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg shadow-md flex items-center justify-center gap-2 transition duration-300"
        >
          <MdPhone className="h-5 w-5" />
          0347002025
        </Link>
        <Link
          href="https://zalo.me/0347002025"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg shadow-md flex items-center justify-center gap-2 transition duration-300"
        >
          <MdMessage className="h-5 w-5" />
          Nhắn Zalo
        </Link>
      </div>

      <div className="flex justify-around w-full mt-6 text-gray-600 text-sm">
        <button
          onClick={handleSavePost}
          className={`flex flex-col items-center transition w-28 ${isSaved ? 'text-red-500' : 'hover:text-blue-600'}`} 
        >
          {isSaved ? <FaBookmark className="h-6 w-6" /> : <FaRegBookmark className="h-6 w-6" />} 
          {isSaved ? 'Tin đã lưu' : 'Lưu tin'} 
        </button>
        <button
          onClick={() => setShowShareModal(true)} 
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
        <div className="fixed inset-0 bg-gray-800/50 flex items-center justify-end z-50" onMouseDown={handleOverlayClick}>
          <div className="bg-white rounded-lg p-6 shadow-xl h-full w-full max-w-sm relative transform transition-transform duration-300 ease-in-out" onMouseDown={(e) => e.stopPropagation()}> 
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              <FaTimes className="h-6 w-6" />
            </button>
            <h2 className="text-xl font-bold mb-4 text-gray-800">Chia sẻ</h2>
            <p className="mb-4 text-gray-700">Chia sẻ tin đăng này</p>
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
        <div className="fixed inset-0 bg-gray-800/50 flex items-center justify-end z-50" onMouseDown={handleOverlayClick}>
          <div className="bg-white rounded-lg p-5 shadow-xl h-full w-full max-w-sm relative transform transition-transform duration-300 ease-in-out overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] "
           onMouseDown={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowReportModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              <FaTimes className="h-6 w-6" />
            </button>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Phản ánh tin đăng</h2>
            <p className="mb-3 text-gray-700 text-base font-bold">Thông tin liên hệ</p>
            <div className="mb-4">
              <label className="block text-left text-gray-700 text-base mb-2">Họ tên của bạn</label>
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
              <label className="block text-left text-gray-700 text-base mb-2">Số điện thoại của bạn</label>
              <input
                type="tel"
                id="contactPhone"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md text-gray-800 text-base"
                placeholder="Nhập số điện thoại của bạn"
              />
            </div>
            <p className="mb-2 text-gray-700 text-lg">Lý do phản ánh:</p> 
            <div className="flex flex-col space-y-3 mb-6"> 
              <label className="inline-flex items-center text-gray-700 text-base"> 
                <input
                  type="radio"
                  name="reportReason"
                  value="Thông tin đã hết/không còn hiệu lực"
                  checked={reportReason === "Thông tin đã hết/không còn hiệu lực"}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="form-radio text-blue-600 h-5 w-5"
                />
                <span className="ml-3">Thông tin đã hết/không còn hiệu lực</span> 
              </label>
              <label className="inline-flex items-center text-gray-700 text-base">
                <input
                  type="radio"
                  name="reportReason"
                  value="Tin trùng lặp nội dung"
                  checked={reportReason === "Tin trùng lặp nội dung"}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="form-radio text-blue-600 h-5 w-5"
                />
                <span className="ml-3">Tin trùng lặp nội dung</span>
              </label>
              <label className="inline-flex items-center text-gray-700 text-base">
                <input
                  type="radio"
                  name="reportReason"
                  value="Không liên hệ được chủ tin đăng"
                  checked={reportReason === "Không liên hệ được chủ tin đăng"}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="form-radio text-blue-600 h-5 w-5"
                />
                <span className="ml-3">Không liên hệ được chủ tin đăng</span>
              </label>
              <label className="inline-flex items-center text-gray-700 text-base">
                <input
                  type="radio"
                  name="reportReason"
                  value="Thông tin tin đăng không đúng thực tế (giá, diện tích, hình ảnh...)"
                  checked={reportReason === "Thông tin tin đăng không đúng thực tế (giá, diện tích, hình ảnh...)"}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="form-radio text-blue-600 h-5 w-5"
                />
                <span className="ml-3">Thông tin tin đăng không đúng thực tế (giá, diện tích, hình ảnh...)</span>
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
                <span className="ml-3">Lý do khác</span>
              </label>
            </div>

            <p className="mb-3 text-gray-700 text-base">Mô tả thêm</p>
            <textarea
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md mb-6 text-gray-800 text-base"
              rows={3}
              placeholder="Nhập mô tả chi tiết..."
            ></textarea>

            <label className="inline-flex items-center text-gray-700 text-base mb-6"> 
              <input
                type="checkbox"
                checked={isRobot}
                onChange={(e) => setIsRobot(e.target.checked)}
                className="form-checkbox text-blue-600 h-5 w-5"
              />
              <span className="ml-3">Tôi không phải là người máy</span> 
            </label>

            <button
              onClick={handleSubmitReport}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg shadow-md transition duration-300 text-lg" 
            >
              Gửi phản ánh
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
