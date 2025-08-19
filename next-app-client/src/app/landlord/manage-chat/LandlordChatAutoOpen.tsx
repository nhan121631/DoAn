// Fixed LandlordChatAutoOpen.tsx
"use client";

import { useEffect, useRef } from "react";

interface LandlordChatAutoOpenProps {
  messages: any[];
  landlordId: string;
  onUserMessage: (userId: string, userName?: string) => void;
}

export default function LandlordChatAutoOpen({
  messages,
  landlordId,
  onUserMessage,
}: LandlordChatAutoOpenProps) {
  const processedMessagesRef = useRef(new Set<string>());

  useEffect(() => {
    if (!Array.isArray(messages) || !landlordId) return;

    const landlordIdStr = String(landlordId).trim();

    // Lọc messages chưa được xử lý
    const newMessages = messages.filter((raw) => {
      const messageId = typeof raw === "string" ? raw : JSON.stringify(raw);
      return !processedMessagesRef.current.has(messageId);
    });

    if (newMessages.length === 0) return;

    console.log(
      "LandlordChatAutoOpen processing new messages:",
      newMessages.length
    ); // Debug log

    newMessages.forEach((raw) => {
      const messageId = typeof raw === "string" ? raw : JSON.stringify(raw);
      processedMessagesRef.current.add(messageId);

      let parsedMessage;
      try {
        parsedMessage = typeof raw === "string" ? JSON.parse(raw) : raw;
      } catch {
        console.error("Failed to parse message:", raw);
        return;
      }

      const fromUserId = String(parsedMessage.fromUserId || "").trim();
      const toUserId = String(parsedMessage.toUserId || "").trim();

      console.log("Processing message:", {
        fromUserId,
        toUserId,
        landlordIdStr,
      }); // Debug log

      // XỬ LÝ TIN NHẮN GỬI ĐẾN LANDLORD
      if (
        toUserId === landlordIdStr &&
        fromUserId &&
        fromUserId !== landlordIdStr
      ) {
        console.log(
          "Incoming message from user:",
          fromUserId,
          parsedMessage.fromUserName
        ); // Debug log
        onUserMessage(fromUserId, parsedMessage.fromUserName);
      }

      // XỬ LÝ TIN NHẮN GỬI ĐI TỪ LANDLORD (để đảm bảo user được thêm vào list)
      else if (
        fromUserId === landlordIdStr &&
        toUserId &&
        toUserId !== landlordIdStr
      ) {
        console.log(
          "Outgoing message to user:",
          toUserId,
          parsedMessage.toUserName
        ); // Debug log
        onUserMessage(toUserId, parsedMessage.toUserName);
      }
    });
  }, [messages, landlordId, onUserMessage]);

  // Component này không render gì
  return null;
}
