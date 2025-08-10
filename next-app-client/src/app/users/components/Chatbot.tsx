/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { URL_PPYTHON } from "@/services/Constant";
import Image from "next/image";
import React, { useState, useRef, useEffect } from "react";
import { IoMdChatboxes } from "react-icons/io";
import { MdDeleteForever } from "react-icons/md";

const API_URL = `${URL_PPYTHON}/ai_chatbot`;

function useSessionChatHistory(initialHistory: any) {
  const [history, setHistory] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("chatbot-history");
      return saved ? JSON.parse(saved) : initialHistory;
    }
    return initialHistory;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("chatbot-history", JSON.stringify(history));
    }
  }, [history]);

  return [history, setHistory];
}

// Function để parse markdown links
function parseMarkdownLinks(text: string) {
  // Pattern để tìm markdown links: [text](url)
  const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;

  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = linkPattern.exec(text)) !== null) {
    // Thêm text trước link
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        content: text.slice(lastIndex, match.index),
      });
    }

    // Thêm link
    parts.push({
      type: "link",
      content: match[1], // link text
      url: match[2], // link URL
    });

    lastIndex = match.index + match[0].length;
  }

  // Thêm phần text còn lại
  if (lastIndex < text.length) {
    parts.push({
      type: "text",
      content: text.slice(lastIndex),
    });
  }

  return parts.length > 0 ? parts : [{ type: "text", content: text }];
}

// Component để render message với markdown support
function MessageContent({ text }: { text: string }) {
  const parts = parseMarkdownLinks(text);

  return (
    <div className="whitespace-pre-line">
      {parts.map((part, index) => {
        if (part.type === "link") {
          return (
            <a
              key={index}
              href={part.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline font-medium"
            >
              {part.content}
            </a>
          );
        }
        return <span key={index}>{part.content}</span>;
      })}
    </div>
  );
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [anim, setAnim] = useState(false);
  const [history, setHistory] = useSessionChatHistory([
    {
      role: "assistant",
      text: "Hello! I'm Ants AI Assistant. I can help you find suitable rental rooms. What kind of room are you looking for?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, open, showTyping]);

  // Animation open/close modal
  useEffect(() => {
    if (open) {
      setAnim(true);
    } else {
      setTimeout(() => setAnim(false), 300);
    }
  }, [open]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newHistory = [...history, { role: "user", text: input }];
    setHistory(newHistory);
    setInput("");
    setLoading(true);
    setShowTyping(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: newHistory }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setHistory([...newHistory, { role: "assistant", text: data.reply }]);
    } catch (err) {
      console.error("Chat error:", err);
      setHistory([
        ...newHistory,
        {
          role: "assistant",
          text: "Xin lỗi, có lỗi kết nối server. Vui lòng thử lại sau.",
        },
      ]);
    }
    setLoading(false);
    setShowTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading) {
      sendMessage();
    }
  };

  const clearHistory = () => {
    const initialHistory = [
      {
        role: "assistant",
        text: "Hello! I'm Ants AI Assistant. I can help you find suitable rental rooms. What kind of room are you looking for?",
      },
    ];
    setHistory(initialHistory);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(true)}
        className={`fixed bottom-8 right-6 z-50 rounded-full w-16 h-16 bg-gradient-to-br bg-white shadow-xl flex items-center justify-center hover:scale-105 hover:shadow-2xl transition-transform duration-300 border-4 border-white/60 ${
          open
            ? "scale-0 opacity-0 pointer-events-none"
            : "scale-100 opacity-100"
        }`}
        aria-label="Open Ants AI Assistant"
      >
        <Image
          src="/images/chatbot.png"
          alt="Chatbot"
          width={56}
          height={56}
          className="drop-shadow-lg"
        />
      </button>

      {/* Chat Modal */}
      {anim && (
        <div
          className={`fixed bottom-28 right-8 z-50 bg-white border border-gray-200 rounded-xl shadow-2xl max-w-sm w-full h-[520px] flex flex-col transition-all duration-300 ${
            open
              ? "scale-100 opacity-100"
              : "scale-90 opacity-0 pointer-events-none"
          }`}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 bg-blue-600 text-white rounded-t-xl flex justify-between items-center">
            <span className="font-semibold flex gap-2 items-center  ">
              <IoMdChatboxes />
              Ants AI Assistant
            </span>
            <div className="flex gap-2">
              <button
                onClick={clearHistory}
                className="text-white/80 hover:text-white text-xl px-2 py-1 rounded hover:bg-white/10 transition"
                title="Clear chat"
              >
                <MdDeleteForever />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="text-white text-2xl font-bold hover:text-gray-200 w-8 h-8 flex items-center justify-center"
              >
                ×
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
            {history.map((msg: any, idx: number) => (
              <div
                key={idx}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {/* Assistant Avatar */}
                {msg.role === "assistant" && (
                  <div className="flex items-end mr-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Image
                        src="/images/chatbot.png"
                        alt="Bot"
                        width={20}
                        height={20}
                        className="rounded-full"
                      />
                    </div>
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`inline-block rounded-2xl px-4 py-3 max-w-[85%] shadow-sm ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-md"
                      : "bg-white text-gray-800 border border-gray-200 rounded-bl-md"
                  } text-sm leading-relaxed`}
                >
                  {msg.role === "assistant" ? (
                    <MessageContent text={msg.text} />
                  ) : (
                    <div className="whitespace-pre-line">{msg.text}</div>
                  )}
                </div>

                {/* User spacing */}
                {msg.role === "user" && <div className="w-2" />}
              </div>
            ))}

            {/* Typing Indicator */}
            {showTyping && (
              <div className="flex justify-start">
                <div className="flex items-end mr-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Image
                      src="/images/chatbot.png"
                      alt="Bot"
                      width={20}
                      height={20}
                      className="rounded-full"
                    />
                  </div>
                </div>
                <div className="inline-block rounded-2xl rounded-bl-md px-4 py-3 bg-white border border-gray-200 shadow-sm">
                  <div className="flex space-x-1">
                    <div
                      className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-3 bg-white rounded-b-xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter your message..."
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "..." : "Send"}
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-2 text-center">
              <p>
                💡 Questions about rental rooms, prices, locations, or
                amenities?
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
