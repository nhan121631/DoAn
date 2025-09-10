"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import React, { useRef } from "react";
import { db } from "@/lib/firebase";
import { URL_IMAGE } from "@/services/Constant";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import {
  sendTextMessage,
  sendImageMessage,
  deleteMessage,
  Message,
} from "@/services/ChatService";
import ImageModal from "./ImageModal";
import ContextMenu from "./ContextMenu";

interface ChatClientProps {
  senderId: string;
  recipientId: string;
  defaultToUserName: string;
  fullHeight?: boolean;
  urlAvatar?: string;
}

export default function ChatClient({
  senderId,
  recipientId,
  defaultToUserName,
  fullHeight = false,
  urlAvatar,
}: ChatClientProps) {
  const [msg, setMsg] = useState<string>("");
  const { data: session } = useSession();
  const [sending, setSending] = useState<boolean>(false);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    fileName?: string;
  } | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    messageId: string;
  } | null>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState<boolean>(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollPositionRef = useRef<number>(0);
  const prevMessagesLength = useRef<number>(0);

  // Lắng nghe tin nhắn
  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          text: doc.data().text,
          imageUrl: doc.data().imageUrl,
          imageFileName: doc.data().imageFileName,
          senderId: doc.data().senderId,
          recipientId: doc.data().recipientId,
          createdAt: doc.data().createdAt
            ? new Date(doc.data().createdAt.seconds * 1000)
            : null,
          messageType: doc.data().messageType || "text",
        }))
        .filter(
          (msg) =>
            (msg.senderId === senderId && msg.recipientId === recipientId) ||
            (msg.senderId === recipientId && msg.recipientId === senderId)
        );
      setAllMessages(msgs);
    });
    return () => unsubscribe();
  }, [recipientId, senderId]);

  // Cuộn xuống cuối tin nhắn
  useEffect(() => {
    if (messagesEndRef.current) {
      // Chỉ auto scroll khi:
      // 1. shouldAutoScroll = true (tin nhắn mới được thêm)
      // 2. Hoặc khi số lượng tin nhắn tăng (có tin nhắn mới)
      const isNewMessage = allMessages.length > prevMessagesLength.current;

      if (shouldAutoScroll && isNewMessage) {
        messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
      } else if (!shouldAutoScroll && scrollPositionRef.current > 0) {
        // Khôi phục vị trí scroll khi xóa tin nhắn
        messagesEndRef.current.scrollTop = scrollPositionRef.current;
        setShouldAutoScroll(true); // Reset lại auto scroll
        scrollPositionRef.current = 0;
      }

      prevMessagesLength.current = allMessages.length;
    }
  }, [allMessages, shouldAutoScroll]);

  // Focus vào input khi component mount hoặc khi có tin nhắn mới
  useEffect(() => {
    const focusInput = () => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };

    // Focus ngay lập tức khi component mount
    focusInput();

    // Focus sau khi có tin nhắn mới
    if (allMessages.length > 0) {
      setTimeout(focusInput, 100);
    }
  }, [allMessages]);

  // Close context menu on click outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu) {
        setContextMenu(null);
      }
    };

    if (contextMenu) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [contextMenu]);

  const sendMessage = async () => {
    if (!msg.trim() || !recipientId || !senderId || sending) return;

    const text = msg.trim();
    setMsg("");
    setSending(true);

    try {
      await sendTextMessage(text, senderId, recipientId);
      // Focus lại input sau khi gửi thành công
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    } catch (err) {
      console.error("Send message error:", err);
      // Nếu gửi lỗi, giữ lại nội dung để người dùng có thể gửi lại
      setMsg(text);
    } finally {
      setSending(false);
    }
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !recipientId || !senderId || uploadingImage) return;

    // Kiểm tra định dạng file
    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn file ảnh hợp lệ");
      return;
    }

    // Kiểm tra kích thước file (tối đa 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Kích thước file không được vượt quá 5MB");
      return;
    }

    setUploadingImage(true);

    try {
      await sendImageMessage(file, senderId, recipientId);
      // Focus lại input sau khi gửi ảnh thành công
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    } catch (err) {
      console.error("Upload image error:", err);
      alert("Gửi ảnh thất bại. Vui lòng thử lại.");
    } finally {
      setUploadingImage(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleContextMenu = (
    event: React.MouseEvent,
    messageId: string,
    messageSenderId: string
  ) => {
    // Chỉ cho phép xóa tin nhắn của chính mình
    if (messageSenderId !== senderId) return;

    event.preventDefault();
    event.stopPropagation();

    console.log("Context menu triggered", {
      messageId,
      messageSenderId,
      senderId,
    });

    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      messageId,
    });
  };

  const handleDeleteMessage = async () => {
    if (!contextMenu) return;

    // Lưu vị trí scroll hiện tại trước khi xóa
    if (messagesEndRef.current) {
      scrollPositionRef.current = messagesEndRef.current.scrollTop;
    }

    // Tắt auto scroll để không bị cuộn xuống cuối
    setShouldAutoScroll(false);

    try {
      console.log("Deleting message:", contextMenu.messageId);
      await deleteMessage(contextMenu.messageId, senderId);
      setContextMenu(null);
      console.log("Message deleted successfully");

      // Optional: Show success feedback
      // You can replace this with a toast notification
      // alert("Tin nhắn đã được xóa thành công");
    } catch (error) {
      console.error("Error deleting message:", error);
      alert("Không thể xóa tin nhắn. Vui lòng thử lại.");
      setShouldAutoScroll(true); // Reset lại auto scroll nếu lỗi
    }
  };

  function formatTime(date: Date | null): string {
    if (!date) return "";
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  const isConnected = true;

  return (
    <div
      className={`relative w-full flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-100/50 dark:border-gray-800 backdrop-blur-sm ${
        fullHeight ? "h-full min-h-0" : "h-[590px]"
      }`}
    >
      {/* Header */}
      <div className="relative bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 px-6 py-4 text-white">
        <div className="flex items-center space-x-4">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md">
            {urlAvatar ? (
              <Image
                src={`${URL_IMAGE + urlAvatar}`}
                alt="Avatar"
                width={48}
                height={48}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-white/30 text-lg font-bold">
                {session?.user?.userProfile?.fullName
                  ? session.user.userProfile.fullName.charAt(0).toUpperCase()
                  : "U"}
              </div>
            )}
          </div>

          {/* User info */}
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold">{defaultToUserName}</h2>
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? "bg-green-400" : "bg-gray-400"
                }`}
              />
              <span className="text-sm">
                {isConnected ? "Active now" : "Offline"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 min-h-0 overflow-y-auto p-2 sm:p-4 space-y-4 bg-gray-50 dark:bg-gray-800"
        ref={messagesEndRef}
      >
        {allMessages.map((m) => (
          <div
            key={m.id}
            className={`flex ${
              m.senderId === senderId ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-3 sm:px-4 py-2 sm:py-3 rounded-2xl max-w-[85%] sm:max-w-[75%] ${
                m.senderId === senderId
                  ? "bg-blue-600 text-white rounded-br-md cursor-context-menu select-none"
                  : "bg-white text-gray-800 border border-gray-200 rounded-bl-md"
              } ${
                m.senderId === senderId
                  ? "hover:bg-blue-700 transition-colors"
                  : ""
              }`}
              onContextMenu={(e) => handleContextMenu(e, m.id, m.senderId)}
              style={{ userSelect: m.senderId === senderId ? "none" : "auto" }}
            >
              {/* Nội dung tin nhắn */}
              {m.messageType === "image" && m.imageUrl ? (
                <div className="relative">
                  <Image
                    src={m.imageUrl}
                    alt={m.imageFileName || "Image"}
                    width={250}
                    height={250}
                    className="rounded-lg object-cover w-full max-w-[250px] sm:max-w-[200px] md:max-w-[250px] h-auto cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() =>
                      setSelectedImage({
                        url: m.imageUrl!,
                        fileName: m.imageFileName,
                      })
                    }
                  />
                </div>
              ) : (
                <div className="text-sm break-words">{m.text}</div>
              )}

              {/* Thời gian + trạng thái */}
              <div className="text-xs mt-2 flex items-center justify-end">
                <span>{formatTime(m.createdAt)}</span>
                {m.senderId === senderId && (
                  <span className="ml-2 opacity-80">
                    {/* {m.isRead ? "✓✓ Seen" : "• Sending..."} */}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Loading indicator for uploading image */}
        {uploadingImage && (
          <div className="flex justify-end">
            <div className="bg-blue-600 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-2xl rounded-br-md max-w-[85%] sm:max-w-[75%]">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">Đang gửi ảnh...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex-shrink-0 bottom-0 left-0 w-full px-2 sm:px-4 py-2 sm:py-3 border-t border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur flex items-center gap-2 sm:gap-3 shadow-lg">
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
        />

        {/* Image upload button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingImage || sending}
          className="flex items-center justify-center p-2 sm:p-3 rounded-full bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ minWidth: 40, minHeight: 40 }}
          title="Gửi ảnh"
        >
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </button>

        {/* Text input */}
        <input
          value={msg}
          ref={inputRef}
          disabled={sending || uploadingImage}
          onChange={(e) => setMsg(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              sendMessage();
            }
          }}
          className="flex-1 rounded-full border border-gray-300 dark:border-gray-600 px-3 sm:px-5 py-2 sm:py-3 text-sm sm:text-base bg-white/70 dark:bg-gray-800/70 shadow focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 outline-none"
        />

        {/* Send text message button */}
        <button
          onClick={sendMessage}
          disabled={sending || !msg.trim() || uploadingImage}
          className="flex items-center justify-center p-2 sm:p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ minWidth: 40, minHeight: 40 }}
        >
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.2}
            viewBox="0 0 24 24"
          >
            <path
              d="M5 12l14-7-7 14-2-5-5-2z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          imageUrl={selectedImage.url}
          imageFileName={selectedImage.fileName}
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          isVisible={!!contextMenu}
          onDelete={handleDeleteMessage}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}
