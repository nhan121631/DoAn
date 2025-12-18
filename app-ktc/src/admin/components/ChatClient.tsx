import { useEffect, useState, useRef } from "react";
import { db } from "../lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import {
  sendTextMessage,
  sendImageMessage,
  deleteMessage,
} from "../service/ChatService";
import type { Message } from "../service/ChatService";
import { URL_IMAGE } from "../service/Constant";

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

  // Listen for messages
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

  // Auto scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      const isNewMessage = allMessages.length > prevMessagesLength.current;

      if (shouldAutoScroll && isNewMessage) {
        messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
      } else if (!shouldAutoScroll && scrollPositionRef.current > 0) {
        messagesEndRef.current.scrollTop = scrollPositionRef.current;
        setShouldAutoScroll(true);
        scrollPositionRef.current = 0;
      }

      prevMessagesLength.current = allMessages.length;
    }
  }, [allMessages, shouldAutoScroll]);

  const handleSend = async () => {
    if (msg.trim() === "" || sending) return;

    const trimmedMsg = msg.trim();
    setMsg("");
    setSending(true);

    try {
      await sendTextMessage(trimmedMsg, senderId, recipientId);
      setShouldAutoScroll(true);
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Không thể gửi tin nhắn");
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validImageTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!validImageTypes.includes(file.type)) {
      alert("Chỉ hỗ trợ các định dạng ảnh: JPEG, PNG, GIF, WEBP");
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert("Kích thước ảnh không được vượt quá 5MB");
      return;
    }

    setUploadingImage(true);

    try {
      await sendImageMessage(file, senderId, recipientId);
      setShouldAutoScroll(true);
    } catch (error) {
      console.error("Failed to upload image:", error);
      alert("Không thể gửi ảnh");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa tin nhắn này?")) return;

    if (messagesEndRef.current) {
      scrollPositionRef.current = messagesEndRef.current.scrollTop;
    }
    setShouldAutoScroll(false);

    try {
      await deleteMessage(messageId);
    } catch (error) {
      console.error("Failed to delete message:", error);
      alert("Không thể xóa tin nhắn");
    } finally {
      setContextMenu(null);
    }
  };

  const handleContextMenu = (
    e: React.MouseEvent,
    messageId: string,
    isSender: boolean
  ) => {
    if (!isSender) return;
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, messageId });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div
      className={`relative w-full flex flex-col bg-white/50 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-gray-100/50 dark:border-gray-800 ${
        fullHeight ? "h-full min-h-0" : "h-[590px]"
      }`}
    >
      {/* Header */}
      <div className="relative bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 px-6 py-4 text-white">
        <div className="flex items-center space-x-4">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md">
            {urlAvatar ? (
              <img
                src={`${URL_IMAGE}${urlAvatar}`}
                alt={defaultToUserName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-white/30 text-lg font-bold">
                {defaultToUserName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* User info */}
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold">{defaultToUserName}</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-sm">Hoạt động</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesEndRef}
        className="flex-1 min-h-0 overflow-y-auto p-2 sm:p-4 space-y-4 bg-gray-50 dark:bg-gray-800"
      >
        {allMessages.map((message) => {
          const isSender = message.senderId === senderId;
          return (
            <div
              key={message.id}
              className={`flex ${isSender ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-3 sm:px-4 py-2 sm:py-3 rounded-2xl max-w-[85%] sm:max-w-[75%] ${
                  isSender
                    ? "bg-blue-600 text-white rounded-br-md cursor-context-menu select-none"
                    : "bg-white text-gray-800 border border-gray-200 rounded-bl-md"
                } ${isSender ? "hover:bg-blue-700 transition-colors" : ""}`}
                onContextMenu={(e) =>
                  handleContextMenu(e, message.id, isSender)
                }
                style={{ userSelect: isSender ? "none" : "auto" }}
              >
                {/* Nội dung tin nhắn */}
                {message.messageType === "image" && message.imageUrl ? (
                  <div className="relative">
                    <img
                      src={message.imageUrl}
                      alt={message.imageFileName || "Image"}
                      className="rounded-lg object-cover w-full max-w-[250px] sm:max-w-[200px] md:max-w-[250px] h-auto cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() =>
                        setSelectedImage({
                          url: message.imageUrl || "",
                          fileName: message.imageFileName,
                        })
                      }
                    />
                  </div>
                ) : (
                  <div className="text-sm break-words">{message.text}</div>
                )}

                {/* Thời gian + trạng thái */}
                <div className="text-xs mt-2 flex items-center justify-end">
                  <span>
                    {message.createdAt
                      ? new Date(message.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })
                      : ""}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

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
          ref={inputRef}
          type="text"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          disabled={sending || uploadingImage}
          className="flex-1 rounded-full border border-gray-300 dark:border-gray-600 px-3 sm:px-5 py-2 sm:py-3 text-sm sm:text-base bg-white/70 dark:bg-gray-800/70 shadow focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 outline-none"
        />

        {/* Send text message button */}
        <button
          onClick={handleSend}
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
        <div
          className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={selectedImage.url}
              alt={selectedImage.fileName || "Image"}
              className="max-w-full max-h-[90vh] rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            {selectedImage.fileName && (
              <div className="absolute bottom-4 left-4 right-4 bg-black/50 text-white px-4 py-2 rounded-lg text-sm">
                {selectedImage.fileName}
              </div>
            )}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-1 z-50 min-w-[150px]"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => handleDeleteMessage(contextMenu.messageId)}
            className="w-full px-4 py-2 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Xóa tin nhắn
          </button>
        </div>
      )}
    </div>
  );
}
