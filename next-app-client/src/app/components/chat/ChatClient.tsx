"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import React, { useRef } from "react";
import { db } from "@/lib/firebase";
import { URL_IMAGE } from "@/services/Constant";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

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
  urlAvatar
}: ChatClientProps) {
  const [msg, setMsg] = useState<string>("");
  const { data: session } = useSession();
  console.log("User avatar URL:", urlAvatar);
  const [sending, setSending] = useState<boolean>(false);
  const [messages, setMessages] = useState<
    { id: string; text: string; senderId: string; recipientId: string }[]
  >([]);
  const [allMessages, setAllMessages] = useState<
    {
      id: string;
      text: string;
      senderId: string;
      recipientId: string;
      createdAt: Date | null;
    }[]
  >([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        text: doc.data().text,
        senderId: doc.data().senderId,
        recipientId: doc.data().recipientId,
        createdAt: doc.data().createdAt
          ? new Date(doc.data().createdAt.seconds * 1000)
          : null,
      })).filter(msg =>
          (msg.senderId === senderId && msg.recipientId === recipientId) ||
          (msg.senderId === recipientId && msg.recipientId === senderId)
        );
      setAllMessages(msgs);
    });
    return () => unsubscribe();
  }, [recipientId]);
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [allMessages]);

  const sendMessage = async () => {
    if (!msg.trim() || !recipientId || !senderId) return;
    if(session){
  console.log("Sending message:", session.user.userProfile.avatar);

    }
    const text = msg.trim();
    setMsg("");
    setSending(true);
    try {
      await addDoc(collection(db, "messages"), {
        text,
        senderId: senderId,
        recipientId: recipientId,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Send message error:", err);
      setMsg(text);
    } finally {
      inputRef.current?.focus();
      setSending(false);
      // KHÔNG cập nhật chatHistory khi gửi tin nhắn
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
    <div className={`relative w-full flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-100/50 dark:border-gray-800 backdrop-blur-sm ${
        fullHeight ? "h-full" : "h-[590px]"
      }`}>
      {/* Header */}
      <div className="relative bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 px-6 py-4 text-white">
        <div className="flex items-center space-x-4">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md">
            {urlAvatar ? (
              <Image
                src={`${urlAvatar}`}
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
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800"
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
              className={`px-4 py-3 rounded-2xl max-w-[75%] ${
                m.senderId === senderId
                  ? "bg-blue-600 text-white rounded-br-md"
                  : "bg-white text-gray-800 border border-gray-200 rounded-bl-md"
              }`}
            >
              {/* Nội dung tin nhắn */}
              <div className="text-sm break-words">{m.text}</div>

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
      </div>

      {/* Input */}
      <div className=" bottom-0 left-0 w-full px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur flex items-center gap-3 shadow-lg">
        <input
  value={msg}
  ref={inputRef}
  onChange={(e) => setMsg(e.target.value)}
  placeholder="Type a message..."
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  }}
  disabled={sending}
  className="flex-1 rounded-full border border-gray-300 dark:border-gray-600 px-5 py-3 text-base bg-white/70 dark:bg-gray-800/70 shadow focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 outline-none"
/>
        <button
          onClick={sendMessage}
          disabled={sending || !msg.trim()}
          className="flex items-center justify-center p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ minWidth: 48, minHeight: 48 }}
        >
          <svg
            className="w-6 h-6"
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
    </div>
  );
}
