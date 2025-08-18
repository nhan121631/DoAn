"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
const ChatClient = dynamic(() => import("../components/chat/ChatClient"), {
  ssr: false,
});

export default function Page() {
  const [showChat, setShowChat] = useState(false);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <button
        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg shadow-md flex items-center justify-center gap-2 transition duration-300"
        onClick={() => setShowChat(true)}
      >
        Chat with landlord
      </button>
      {showChat && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowChat(false);
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl p-0 max-w-lg w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl"
              onClick={() => setShowChat(false)}
            >
              &times;
            </button>
            <ChatClient userId="1" defaultToUserId="2" />
          </div>
        </div>
      )}
    </div>
  );
}
