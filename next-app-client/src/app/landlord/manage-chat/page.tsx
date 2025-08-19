// Fixed version - giải quyết vấn đề realtime khi click sidebar
"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import ChatClient from "@/app/components/chat/ChatClient";
import LandlordChatAutoOpen from "./LandlordChatAutoOpen";
import { useSession } from "next-auth/react";
import useWebSocket from "@/app/components/chat/useWebSocket";
import { API_URL } from "@/services/Constant";

interface ChatUser {
  id: string;
  name?: string;
  lastMessageTime?: Date;
  unreadCount?: number;
}

interface ParsedMessage {
  fromUserId?: string;
  toUserId?: string;
  fromUserName?: string;
  isRead?: boolean;
  timestamp?: string;
}

export default function LandlordManageChatPage() {
  const { data: session } = useSession();
  const landlordId = (session?.user?.id ?? "") + "";
  const [readUserIds, setReadUserIds] = useState<string[]>([]);

  const [userList, setUserList] = useState<ChatUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Đánh dấu landlord đã chọn user thủ công
  const landlordSelectedRef = useRef(false);
  const { messages, sendMessage: wsSendMessage } = useWebSocket(landlordId);

  // Sử dụng useRef để tránh re-render khi click sidebar
  const processedMessagesRef = useRef(new Set<string>());

  // Helper function to parse messages safely - memoized
  const parseMessage = useCallback((raw: any): ParsedMessage | null => {
    try {
      const obj = typeof raw === "string" ? JSON.parse(raw) : raw;
      return obj;
    } catch {
      return null;
    }
  }, []);

  // Helper function to update user list - optimized
  const updateUserList = useCallback(
    (
      userId: string,
      userName?: string,
      lastMessageTime?: Date,
      unreadCount?: number
    ) => {
      if (!userId || userId === landlordId) return;

      setUserList((prev) => {
        const existingUserIndex = prev.findIndex((u) => u.id === userId);

        if (existingUserIndex >= 0) {
          const existing = prev[existingUserIndex];
          const newName = userName || existing.name || userId;
          const newTime = lastMessageTime || existing.lastMessageTime;
          const newUnread =
            typeof unreadCount === "number"
              ? unreadCount
              : existing.unreadCount;

          // Chỉ update nếu có thay đổi thực sự
          const existingTime = existing.lastMessageTime
            ? +existing.lastMessageTime
            : 0;
          const compareTime = newTime ? +newTime : 0;

          if (
            existing.name === newName &&
            existingTime === compareTime &&
            existing.unreadCount === newUnread
          ) {
            return prev; // Không thay đổi state -> không trigger re-render
          }

          const updatedList = [...prev];
          updatedList[existingUserIndex] = {
            ...existing,
            name: newName,
            lastMessageTime: newTime,
            unreadCount: newUnread,
          };
          return updatedList;
        } else {
          // Add new user
          return [
            ...prev,
            {
              id: userId,
              name: userName || userId,
              lastMessageTime: lastMessageTime || new Date(),
              unreadCount: typeof unreadCount === "number" ? unreadCount : 0,
            },
          ];
        }
      });
    },
    [landlordId]
  );

  // FIX: Tách riêng việc xử lý messages để tránh conflict với click events
  const processWebSocketMessages = useCallback(() => {
    if (!Array.isArray(messages) || messages.length === 0) return;

    // Batch process messages để giảm số lần re-render
    const messagesToProcess = messages.filter((raw) => {
      const messageId = typeof raw === "string" ? raw : JSON.stringify(raw);
      return !processedMessagesRef.current.has(messageId);
    });

    if (messagesToProcess.length === 0) return;

    setUserList((prev) => {
      const lastTimes = new Map<string, Date>();
      prev.forEach((u) => {
        if (u.lastMessageTime) lastTimes.set(u.id, u.lastMessageTime);
      });

      let next = [...prev];
      let changed = false;

      messagesToProcess.forEach((raw) => {
        const messageId = typeof raw === "string" ? raw : JSON.stringify(raw);
        processedMessagesRef.current.add(messageId);

        const parsedMessage = parseMessage(raw);
        if (
          !parsedMessage?.fromUserId ||
          parsedMessage.fromUserId === landlordId
        )
          return;

        const userId = parsedMessage.fromUserId;
        const userName = parsedMessage.fromUserName;
        const messageTime = parsedMessage.timestamp
          ? new Date(parsedMessage.timestamp)
          : new Date();

        const lastTime = lastTimes.get(userId);
        const idx = next.findIndex((u) => u.id === userId);

        if (idx === -1) {
          next.push({
            id: userId,
            name: userName || userId,
            lastMessageTime: messageTime,
          });
          lastTimes.set(userId, messageTime);
          changed = true;
        } else if (!lastTime || messageTime > lastTime) {
          next[idx] = {
            ...next[idx],
            name: userName || next[idx].name || userId,
            lastMessageTime: messageTime,
          };
          lastTimes.set(userId, messageTime);
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  }, [messages, parseMessage, landlordId]);

  // FIX: Sử dụng setTimeout để delay xử lý messages, tránh conflict với UI events
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      processWebSocketMessages();
    }, 100); // Delay ngắn để UI events hoàn thành trước

    return () => clearTimeout(timeoutId);
  }, [processWebSocketMessages]);

  // Load initial user list
  useEffect(() => {
    if (!landlordId) return;

    setIsLoading(true);
    setError("");

    fetch(`${API_URL}/messages/users?userId=${landlordId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then((users) => {
        if (Array.isArray(users)) {
          setUserList(
            users.map((user) => ({
              ...user,
              lastMessageTime: user.lastMessageTime
                ? new Date(user.lastMessageTime)
                : new Date(),
              unreadCount: user.unreadCount || 0,
            }))
          );
        } else {
          setUserList([]);
        }
      })
      .catch((err) => {
        console.error("Failed to load users:", err);
        setError("Không thể tải danh sách người dùng");
        setUserList([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [landlordId]);

  // Memoize unread calculation để tránh re-calculate không cần thiết
  const currentUnreadUserIds = useMemo(() => {
    if (!Array.isArray(messages)) return [];

    const landlordIdStr = String(landlordId).trim();
    const unreadIds = new Set<string>();

    messages.forEach((raw) => {
      const parsedMessage = parseMessage(raw);
      if (!parsedMessage) return;

      const toId = String(parsedMessage.toUserId || "").trim();
      const fromId = String(parsedMessage.fromUserId || "").trim();

      if (
        toId === landlordIdStr &&
        fromId &&
        fromId !== landlordIdStr &&
        parsedMessage.isRead !== true &&
        !readUserIds.includes(fromId)
      ) {
        unreadIds.add(fromId);
      }
    });

    return Array.from(unreadIds);
  }, [messages, landlordId, parseMessage, readUserIds]);

  // FIX: Optimize user selection handler
  const handleUserSelect = useCallback(
    (user: ChatUser) => {
      setSelectedUserId(user.id);
      setReadUserIds((prev) => {
        if (prev.includes(user.id)) return prev;
        return [...prev, user.id];
      });

      landlordSelectedRef.current = true;

      // Khi click vào user, set unreadCount về 0 để mất highlight ngay trên frontend
      updateUserList(user.id, user.name, undefined, 0);
    },
    [updateUserList]
  );

  // Reset landlordSelectedRef nếu không còn user nào được chọn
  useEffect(() => {
    if (!selectedUserId) {
      landlordSelectedRef.current = false;
    }
  }, [selectedUserId]);

  // Memoize sorted user list để tránh re-sort không cần thiết
  const sortedUserList = useMemo(() => {
    return [...userList].sort((a, b) => {
      const timeA = a.lastMessageTime?.getTime() || 0;
      const timeB = b.lastMessageTime?.getTime() || 0;
      return timeB - timeA;
    });
  }, [userList]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-blue-50 dark:bg-gray-900">
      {/* Animated Sidebar Toggle Button */}
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="fixed top-4 left-4 z-30 lg:hidden p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 active:scale-95"
      >
        <div className="w-5 h-5 flex flex-col justify-center space-y-1">
          <div
            className={`w-full h-0.5 bg-slate-600 dark:bg-gray-500 transition-all duration-300 ${
              sidebarCollapsed ? "rotate-45 translate-y-1.5" : ""
            }`}
          />
          <div
            className={`w-full h-0.5 bg-slate-600 transition-all duration-300 ${
              sidebarCollapsed ? "opacity-0" : ""
            }`}
          />
          <div
            className={`w-full h-0.5 bg-slate-600 transition-all duration-300 ${
              sidebarCollapsed ? "-rotate-45 -translate-y-1.5" : ""
            }`}
          />
        </div>
      </button>

      {/* Enhanced Sidebar */}
      <div
        className={`
        ${sidebarCollapsed ? "w-0 lg:w-0" : "w-80 lg:w-80"} 
        transition-all duration-500 ease-in-out overflow-hidden
           bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-r border-slate-200/50 shadow-xl
      `}
      >
        <div className="p-6">
          {/* Header with gradient */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Conversations
            </h2>
            <div className="mt-2 h-1 w-12 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full dark:bg-gradient-to-r dark:from-blue-600 dark:to-purple-600" />
          </div>

          {/* Enhanced Error Display */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 text-sm rounded-xl animate-pulse">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-red-400 dark:bg-red-600 rounded-full mr-2 animate-bounce" />
                {error}
              </div>
            </div>
          )}

          {/* Enhanced Loading State */}
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center space-x-3 p-4 rounded-xl bg-slate-100 dark:bg-gray-800">
                    <div className="w-12 h-12 bg-slate-200 dark:bg-gray-700 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 dark:bg-gray-700 rounded w-3/4" />
                      <div className="h-3 bg-slate-200 dark:bg-gray-700 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-none">
              {sortedUserList.map((user, index) => {
                const isUnread =
                  (typeof user.unreadCount === "number"
                    ? user.unreadCount > 0
                    : false) || currentUnreadUserIds.includes(user.id);
                const isSelected = selectedUserId === user.id;

                return (
                  <div
                    key={user.id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <button
                      className={`
                        group relative w-full text-left p-4 rounded-xl transition-all duration-300
                        transform hover:scale-105 hover:shadow-lg active:scale-100
                        ${
                          isSelected
                            ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                            : isUnread
                            ? "bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 hover:from-amber-100 hover:to-orange-100"
                            : "bg-slate-50 dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-700 hover:shadow-md"
                        }
                      `}
                      onClick={() => handleUserSelect(user)}
                    >
                      <div className="flex items-center space-x-3">
                        {/* Avatar with animation */}
                        <div
                          className={`
                          relative w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg
                          ${
                            isSelected
                              ? "bg-white/20 dark:bg-white/30 text-white"
                              : "bg-gradient-to-br from-blue-400 to-purple-400 text-white"
                          }
                          transition-all duration-300 group-hover:scale-110
                        `}
                        >
                          {(user.name || user.id).charAt(0).toUpperCase()}

                          {/* Unread indicator with pulse animation */}
                          {isUnread && (
                            <div className="absolute -top-1 -right-1">
                              <div className="w-4 h-4 bg-amber-400 rounded-full animate-pulse" />
                              <div className="absolute inset-0 w-4 h-4 bg-amber-400 rounded-full animate-ping opacity-75" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3
                              className={`
                              font-semibold truncate transition-colors duration-300
                              ${
                                isSelected
                                  ? "text-white"
                                  : "text-slate-800 group-hover:text-slate-900 dark:text-gray-100 dark:group-hover:text-white"
                              }
                            `}
                            >
                              {user.name || user.id}
                            </h3>
                          </div>

                          {user.lastMessageTime && (
                            <p
                              className={`
                              text-sm mt-1 transition-colors duration-300
                              ${
                                isSelected
                                  ? "text-white/80"
                                  : "text-slate-500 group-hover:text-slate-600"
                              }
                            `}
                            >
                              {/* Uncomment nếu cần hiển thị thời gian
                              {user.lastMessageTime.toLocaleString("vi-VN", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })} 
                              */}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Hover effect overlay */}
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300" />
                    </button>
                  </div>
                );
              })}

              {sortedUserList.length === 0 && !isLoading && (
                <div className="text-center py-12 animate-fade-in">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-slate-400 dark:text-gray-500"
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
                  </div>
                  <p className="text-slate-500 dark:text-gray-300 font-medium">
                    No conversations yet
                  </p>
                  <p className="text-slate-400 dark:text-gray-500 text-sm mt-1">
                    Start chatting to see messages here
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Chat Area */}
      <div className="flex-1 flex flex-col bg-white/50 dark:bg-gray-900/60 backdrop-blur-sm">
        <div className="flex-1 flex items-center justify-center">
          {selectedUserId ? (
            <div className="w-full max-w-4xl mx-auto h-full animate-fade-in">
              <ChatClient
                key={selectedUserId}
                userId={landlordId}
                defaultToUserId={selectedUserId}
                defaultToUserName={
                  userList.find((u) => u.id === selectedUserId)?.name || ""
                }
                // messages={messages}
                // sendMessage={wsSendMessage}
              />
            </div>
          ) : (
            <div className="text-center animate-fade-in">
              {isLoading ? (
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
                  <p className="text-slate-600 font-medium">
                    Loading conversations...
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-6 p-8">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-12 h-12 text-blue-500"
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
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-bounce" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-slate-700 mb-2">
                      Welcome to Chat Management
                    </h3>
                    <p className="text-slate-500">
                      Select a conversation from the sidebar to start chatting
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Auto-open chat component - FIX: Thêm key để tránh stale closures */}
        <LandlordChatAutoOpen
          key={`${selectedUserId}-${messages.length}`}
          messages={messages}
          landlordId={landlordId}
          onUserMessage={(userId, userName) => {
            if (!userId) return;
            // Chỉ update userList, không auto-switch chat
            updateUserList(userId, userName, new Date());
          }}
        />
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }

        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }

        .scrollbar-track-transparent::-webkit-scrollbar-track {
          background: transparent;
        }

        .scrollbar-thumb-slate-200::-webkit-scrollbar-thumb {
          background-color: rgb(226 232 240);
          border-radius: 3px;
        }

        .scrollbar-thumb-slate-200::-webkit-scrollbar-thumb:hover {
          background-color: rgb(203 213 225);
        }
      `}</style>
    </div>
  );
}
