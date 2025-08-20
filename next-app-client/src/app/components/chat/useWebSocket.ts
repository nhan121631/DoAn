"use client";

import { useEffect, useRef, useState } from "react";

interface MessagePayload {
  toUserId: string;
  message: string;
}

export default function useWebSocket(userId: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const [messages, setMessages] = useState<string[]>([]);

  // Hàm gửi sự kiện đã đọc
  const sendReadEvent = (fromUserId: string, toUserId: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "read",
          fromUserId,
          toUserId,
        })
      );
      console.log("[WebSocket] Sent read event:", { fromUserId, toUserId });
    } else {
      console.error("[WebSocket] Cannot send read event, connection not open");
    }
  };


useEffect(() => {
  if (!userId) return;
  // Đảm bảo chỉ tạo 1 kết nối cho mỗi userId
  if (wsRef.current) {
    wsRef.current.close();
    wsRef.current = null;
  }
  const ws = new WebSocket(`ws://localhost:3333/ws/chat?userId=${userId}`);
  wsRef.current = ws;

  ws.onopen = () => console.log("✅ WebSocket connected", ws.readyState);
  ws.onclose = () => console.log("❌ WebSocket disconnected", ws.readyState);
  // ws.onerror = (err) => {
  //   console.error("⚠ WebSocket error", err);
  // };
  ws.onmessage = (event: MessageEvent) => {
    console.log("📨 Received message:", event.data);
    setMessages((prev) => [...prev, event.data]);
  };

  return () => {
    ws.close();
    wsRef.current = null;
  };
}, [userId]);



  const sendMessage = (toUserId: string, message: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const payload: MessagePayload = { toUserId, message };
      console.log("[WebSocket] Sending:", payload);
      wsRef.current.send(JSON.stringify(payload));
    } else {
      console.error("[WebSocket] Cannot send message, connection not open");
    }
  };

  return { messages, sendMessage, sendReadEvent };
}
