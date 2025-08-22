// Fixed version - giải quyết vấn đề realtime khi click sidebar
"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import ChatClient from "@/app/components/chat/ChatClient";
import { useSession } from "next-auth/react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { getFullName } from "@/services/ProfileService";

interface ChatUser {
  id: string;
  name?: string;
  lastMessageTime?: Date;
  unreadCount?: number;
  lastMessageText?: string;
}

// ...existing code...

export default function LandlordManageChatPage() {
  const { data: session } = useSession();
  const landlordId = (session?.user?.id ?? "") + "";

  const [userList, setUserList] = useState<ChatUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Đánh dấu landlord đã chọn user thủ công
  const landlordSelectedRef = useRef(false);

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

  // Lắng nghe sự thay đổi trên Firebase để cập nhật danh sách người dùng
  useEffect(() => {
    if (!landlordId) return;

    setIsLoading(true);
    const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      setIsLoading(false);
      
      const fetchedMessages = snapshot.docs.map((doc) => ({
          id: doc.id,
          text: doc.data().text,
          senderId: doc.data().senderId,
          recipientId: doc.data().recipientId,
          createdAt: doc.data().createdAt
              ? new Date(doc.data().createdAt.seconds * 1000)
              : null,
      }))
      .filter(
          (msg) =>
              msg.senderId === landlordId || msg.recipientId === landlordId
      );

      // Lấy ra danh sách unique userId khác landlord và tin nhắn mới nhất
      const usersMap: Record<string, ChatUser & { lastMessageText?: string }> = {};
      fetchedMessages.forEach((msg) => {
        const otherId = msg.senderId === landlordId ? msg.recipientId : msg.senderId;
        if (!otherId || (usersMap[otherId]?.lastMessageTime && usersMap[otherId].lastMessageTime! > msg.createdAt!)) return;

        usersMap[otherId] = {
          id: otherId,
          name: otherId, // Sẽ được cập nhật sau
          lastMessageTime: msg.createdAt || new Date(),
          unreadCount: 0,
          lastMessageText: msg.text || "",
        };
      });

      // Lấy danh sách ID để fetch tên
      const userIdsToFetch = Object.keys(usersMap);

    // Fetch tất cả các tên cùng lúc
    const namePromises = userIdsToFetch.map(async (id) => {
      try {
        const fullName = await getFullName(id);
        console.log(`API fullName for ${id}:`, fullName);
        return { id, fullName };
      } catch (error) {
        console.error(`Failed to get name for user ${id}:`, error);
        return { id, fullName: id }; // Trả về ID nếu fetch thất bại
      }
    });

    const fetchedNames = await Promise.all(namePromises);
    console.log('Fetched names:', fetchedNames);
    const nameMap = new Map(fetchedNames.map(item => [item.id, item.fullName]));

    // Cập nhật userList với tên mới
    const updatedUserList = Object.values(usersMap).map(user => ({
      ...user,
      name: nameMap.get(user.id) || user.id,
      lastMessageText: user.lastMessageText || ""
    }));
    console.log('Updated userList:', updatedUserList);
    setUserList(updatedUserList);

    }, (err) => {
        console.error("Firebase fetch error:", err);
        setError("Không thể tải danh sách người dùng");
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [landlordId]);

  // Handle user selection
  const handleUserSelect = useCallback(
    (user: ChatUser) => {
      setSelectedUserId(user.id);
      landlordSelectedRef.current = true;
      // Cập nhật lại unreadCount về 0 khi chọn
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

  // Sắp xếp danh sách người dùng theo thời gian tin nhắn cuối cùng
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
        ${sidebarCollapsed ? "w-0 lg:w-80" : "w-80 lg:w-80"} 
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
            <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-none">
              {sortedUserList.map((user, index) => {
                const isSelected = selectedUserId === user.id;
                const isUnread = user.unreadCount && user.unreadCount > 0;
                // Format time
                let timeStr = "";
                if (user.lastMessageTime) {
                  const d = user.lastMessageTime;
                  const now = new Date();
                  if (d.toDateString() === now.toDateString()) {
                    timeStr = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                  } else {
                    timeStr = d.toLocaleDateString();
                  }
                }
                return (
                  <div
                    key={user.id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <button
  className={`group relative w-full text-left px-5 py-4 rounded-2xl transition-all duration-300 flex items-center gap-4
    border-2
    ${isSelected
      ? "border-blue-500 bg-gradient-to-r from-blue-100 to-purple-100 shadow-lg"
      : "border-transparent bg-white dark:bg-gray-800"}
    hover:ring-2 hover:ring-blue-400 hover:border-blue-400
    hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900 dark:hover:to-purple-900
    
    `}
  style={{ transition: "box-shadow 0.2s, background 0.2s, border 0.2s, transform 0.2s" }}
  onClick={() => handleUserSelect(user)}
>
  {/* Avatar gradient */}
  <div className={`relative w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl shadow-lg
    ${isSelected ? "bg-gradient-to-br from-blue-400 to-purple-400 text-white" : "bg-gradient-to-br from-blue-300 to-purple-300 text-white"}
    transition-all duration-300 group-hover:scale-105`}
  >
    {(user.name || user.id).charAt(0).toUpperCase()}
    {/* Badge số tin nhắn chưa đọc */}
    {isUnread && (
      <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow animate-pulse">
        {user.unreadCount}
      </span>
    )}
  </div>
  {/* Info */}
  <div className="flex-1 min-w-0">
    <div className="flex items-center gap-2">
      <h3 className={`font-semibold text-lg truncate transition-colors duration-200
        ${isSelected ? "text-blue-700" : "text-slate-800 dark:text-gray-100 group-hover:text-blue-700 dark:group-hover:text-blue-300"}`}>{user.name || user.id}</h3>
    </div>
    {user.lastMessageText && (
      <p className={`text-sm mt-1 truncate transition-colors duration-200
        ${isSelected ? "text-blue-600" : "text-slate-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-300"}`}>{user.lastMessageText}</p>
    )}
    {timeStr && (
      <p className={`text-xs mt-1 transition-colors duration-200
        ${isSelected ? "text-blue-500" : "text-slate-500 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-300"}`}>{timeStr}</p>
    )}
  </div>
  {/* Hover effect overlay */}
  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all duration-300 pointer-events-none z-0" />
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
  <div className="flex-1 flex items-center justify-center w-full h-full">
    {selectedUserId ? (
      <div className="flex-1 h-full animate-fade-in flex flex-col">
        <ChatClient
          recipientId={selectedUserId}
          senderId={landlordId}
          defaultToUserName={
            userList.find((u) => u.id === selectedUserId)?.name || ""
          }
          fullHeight={true}
        />
      </div>
    ) : (
      isLoading ? (
        <div className="flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-slate-600 font-medium mt-4">
            Loading conversations...
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center animate-fade-in">
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
          <div className="text-center mt-6">
            <h3 className="text-xl font-semibold text-slate-700 mb-2">
              Welcome to Chat Management
            </h3>
            <p className="text-slate-500">
              Select a conversation from the sidebar to start chatting
            </p>
          </div>
        </div>
      )
    )}
  </div>
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