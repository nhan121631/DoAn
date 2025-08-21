"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import React, { useRef } from "react";
import { db } from "@/lib/firebase";
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
}

export default function ChatClient({
  senderId,
  recipientId,
  defaultToUserName,
}: ChatClientProps) {
  const [msg, setMsg] = useState<string>("");
  const { data: session } = useSession();
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
  }, []);
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [allMessages]);

  const sendMessage = async () => {
    if (!msg.trim() || !recipientId || !senderId) return;
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
    <div className="w-full h-full flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-100/50 dark:border-gray-800 backdrop-blur-sm">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 px-6 py-4 text-white">
        <div className="flex items-center space-x-4">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md">
            {session?.user?.userProfile?.avatar ? (
              <Image
                src={session.user.userProfile.avatar}
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
        className="overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800"
        style={{ height: "450px" }}
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
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center space-x-2">
        <input
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          disabled={sending}
          className="flex-1 rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-2 focus:outline-none"
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </div>
  );
}
