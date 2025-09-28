/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import ChatClient from "@/app/components/chat/ChatClient";
import { useSession } from "next-auth/react";
import { URL_IMAGE } from "@/services/Constant";
import Image from "next/image";
import { doc, onSnapshot, query, collection, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Import from the new service file
import {
  listenForConversations,
  markConversationAsRead,
  ChatUser,
} from "@/services/ChatService";

export default function ManageChatPage() {
  const { data: session } = useSession();
  const landlordId = session?.user?.id ?? "";

  const [userList, setUserList] = useState<ChatUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [showSidebar, setShowSidebar] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Use a ref for a value that doesn't trigger re-render
  const lastReadTimestamps = useRef(new Map<string, Date>());
  
  // Track users that have been marked as read recently to prevent overriding optimistic updates
  const recentlyMarkedAsRead = useRef(new Set<string>());

  // Effect 1: Listen for read statuses
  useEffect(() => {
    if (!landlordId) return;

    const readStatusQuery = query(
      collection(db, "readStatuses"),
      where("userId", "==", landlordId)
    );

    const unsubscribe = onSnapshot(readStatusQuery, (snapshot) => {
      const newTimestamps = new Map<string, Date>();
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.lastRead) {
          newTimestamps.set(
            data.conversationId,
            new Date(data.lastRead.seconds * 1000)
          );
        }
      });
      
      // Check if timestamps actually changed
      const oldSize = lastReadTimestamps.current.size;
      const newSize = newTimestamps.size;
      let hasChanged = oldSize !== newSize;
      
      if (!hasChanged) {
        // Compare individual timestamps
        for (const [userId, timestamp] of newTimestamps) {
          const oldTimestamp = lastReadTimestamps.current.get(userId);
          if (!oldTimestamp || oldTimestamp.getTime() !== timestamp.getTime()) {
            hasChanged = true;
            break;
          }
        }
      }
      
      if (hasChanged) {
        lastReadTimestamps.current = newTimestamps;
        console.log("Read timestamps updated:", newTimestamps);
        // Trigger conversation list refresh
        setRefreshTrigger(prev => prev + 1);
      }
    });

    return () => unsubscribe();
  }, [landlordId]);

  // Cleanup protection on unmount
  useEffect(() => {
    return () => {
      recentlyMarkedAsRead.current.clear();
    };
  }, []);

  // Effect 2: Listen for all messages and update chat list
  useEffect(() => {
    const unsubscribe = listenForConversations(
      landlordId,
      lastReadTimestamps,
      (users) => {
        setUserList(prevUserList => {
          // Filter out users that have been recently marked as read to preserve optimistic updates
          const filteredUsers = users.map(user => {
            if (recentlyMarkedAsRead.current.has(user.id)) {
              // Keep the local unreadCount (which should be 0) instead of server data
              const currentUser = prevUserList.find(u => u.id === user.id);
              console.log(`ManageChat: Protecting user ${user.id} from server override. Server: ${user.unreadCount}, Local: ${currentUser?.unreadCount ?? 0}`);
              return {
                ...user,
                unreadCount: currentUser?.unreadCount ?? 0
              };
            }
            return user;
          });
          
          return filteredUsers;
        });
      },
      setIsLoading,
      setError
    );
    return () => unsubscribe();
  }, [landlordId, refreshTrigger]);

  // Handle selecting a user
  const handleUserSelect = useCallback(
    async (user: ChatUser) => {
      setSelectedUserId(user.id);
      
      // Add to recently marked as read to protect from server overrides
      recentlyMarkedAsRead.current.add(user.id);
      
      // Immediately update local state for better UX (optimistic update)
      setUserList(prevUsers => 
        prevUsers.map(u => 
          u.id === user.id ? { ...u, unreadCount: 0 } : u
        )
      );

      try {
        await markConversationAsRead(landlordId, user.id);
        console.log(`ManageChat: Successfully marked conversation with ${user.id} as read`);
        
        // Remove protection after a delay to allow Firebase to propagate
        setTimeout(() => {
          recentlyMarkedAsRead.current.delete(user.id);
        }, 2000); // 2 seconds should be enough for Firebase to sync
        
      } catch (error) {
        console.error("ManageChat: Failed to mark conversation as read:", error);
        // Remove protection and revert the optimistic update if marking as read failed
        recentlyMarkedAsRead.current.delete(user.id);
        setUserList(prevUsers => 
          prevUsers.map(u => 
            u.id === user.id ? { ...u, unreadCount: user.unreadCount } : u
          )
        );
      }
      
      // Ẩn sidebar trên mobile khi chọn user
      if (window.innerWidth < 768) {
        setShowSidebar(false);
      }
    },
    [landlordId]
  );

  // Handle back to sidebar on mobile
  const handleBackToSidebar = useCallback(() => {
    setShowSidebar(true);
    setSelectedUserId("");
    // Clear protection when going back
    recentlyMarkedAsRead.current.clear();
  }, []);

  // Sort user list
  const sortedUserList = useMemo(() => {
    return [...userList].sort((a, b) => {
      const timeA = a.lastMessageTime?.getTime() || 0;
      const timeB = b.lastMessageTime?.getTime() || 0;
      return timeB - timeA;
    });
  }, [userList]);

  // Render logic remains the same
  return (
    <div className="flex h-full bg-gradient-to-br from-slate-50 to-blue-50 dark:bg-gray-900 overflow-hidden">
      {/* Sidebar */}
      <div
        className={`${
          showSidebar ? "w-80" : "w-0"
        } md:w-80 transition-all duration-500 ease-in-out overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-r border-slate-200/50 shadow-xl flex flex-col ${
          showSidebar ? "block" : "hidden md:flex"
        }`}
      >
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Conversations
            </h2>
            <div className="mt-2 h-1 w-12 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full dark:bg-gradient-to-r dark:from-blue-600 dark:to-purple-600" />
          </div>
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 text-sm rounded-xl animate-pulse">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-red-400 dark:bg-red-600 rounded-full mr-2 animate-bounce" />
                {error}
              </div>
            </div>
          )}
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
            <div className="space-y-3 flex-1 overflow-y-auto scrollbar-none">
              {sortedUserList.length === 0 && (
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
              {sortedUserList.map((user, index) => {
                const isSelected = selectedUserId === user.id;
                let timeStr = "";
                if (user.lastMessageTime) {
                  const d = user.lastMessageTime;
                  const now = new Date();
                  if (d.toDateString() === now.toDateString()) {
                    timeStr = d.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    });
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
                      className={`group relative w-full text-left px-5 py-4 rounded-2xl transition-all duration-300 flex items-center gap-4 border-2 ${
                        isSelected
                          ? "border-blue-500 bg-gradient-to-r from-blue-100 to-purple-100 shadow-lg"
                          : "border-transparent bg-white dark:bg-gray-800"
                      } hover:border-blue-400 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900 dark:hover:to-purple-900`}
                      style={{
                        transition:
                          "box-shadow 0.2s, background 0.2s, border 0.2s, transform 0.2s",
                      }}
                      onClick={() => handleUserSelect(user)}
                    >
                      {/* Avatar + Badge */}
                      <div className="relative w-14 h-14">
                        <div
                          className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl shadow-lg ${
                            isSelected
                              ? "bg-gradient-to-br from-blue-400 to-purple-400 text-white"
                              : "bg-gradient-to-br from-blue-300 to-purple-300 text-white"
                          } transition-all duration-300 group-hover:scale-105 overflow-hidden`}
                        >
                          {user.avatar ? (
                            <Image
                              src={`${URL_IMAGE + user.avatar}`}
                              alt="Avatar"
                              width={56}
                              height={56}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            (user.name || user.id).charAt(0).toUpperCase()
                          )}
                        </div>

                        {(user.unreadCount ?? 0) > 0 && (
                          <div className="absolute -top-1 -right-1">
                            <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75 animate-ping" />
                            <span className="relative flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white shadow ring-2 ring-white dark:ring-gray-900">
                              {user.unreadCount}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3
                            className={`font-semibold text-lg truncate transition-colors duration-200 ${
                              isSelected
                                ? "text-blue-700"
                                : "text-slate-800 dark:text-gray-100 group-hover:text-blue-700 dark:group-hover:text-blue-300"
                            }`}
                          >
                            {user.name || user.id}
                          </h3>
                        </div>
                        {user.lastMessageText && (
                          <p
                            className={`text-sm mt-1 truncate transition-colors duration-200 ${
                              isSelected
                                ? "text-blue-600"
                                : user.unreadCount && user.unreadCount > 0
                                ? "font-semibold text-amber-600 dark:text-amber-400"
                                : "text-slate-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-300"
                            }`}
                          >
                            {user.lastMessageText}
                          </p>
                        )}
                        {timeStr && (
                          <p
                            className={`text-xs mt-1 transition-colors duration-200 ${
                              isSelected
                                ? "text-blue-500"
                                : "text-slate-500 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-300"
                            }`}
                          >
                            {timeStr}
                          </p>
                        )}
                      </div>

                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all duration-300 pointer-events-none z-0" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div
        className={`flex-1 flex flex-col bg-white/50 dark:bg-gray-900/60 backdrop-blur-sm ${
          !showSidebar || selectedUserId ? "block" : "hidden md:flex"
        }`}
      >
        {/* Mobile Back Button */}
        {selectedUserId && (
          <div className="md:hidden flex items-center p-3 bg-white border-b border-gray-200 flex-shrink-0 dark:bg-gray-800 dark:border-gray-700">
            <button
              onClick={handleBackToSidebar}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span className="font-medium">Back to Conversations</span>
            </button>
          </div>
        )}

        <div className="flex-1 min-h-0 flex items-center justify-center w-full">
          {selectedUserId ? (
            <div className="w-full h-full animate-fade-in">
              <ChatClient
                recipientId={selectedUserId}
                senderId={landlordId}
                defaultToUserName={
                  userList.find((u) => u.id === selectedUserId)?.name || ""
                }
                fullHeight={true}
                urlAvatar={
                  userList.find((u) => u.id === selectedUserId)?.avatar || ""
                }
              />
            </div>
          ) : isLoading ? (
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
          )}
        </div>
      </div>
      {/* Custom CSS */}
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
