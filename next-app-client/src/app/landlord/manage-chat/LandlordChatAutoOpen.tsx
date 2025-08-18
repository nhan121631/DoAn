// LandlordChatAutoOpen.tsx

import { useEffect } from "react";

interface LandlordChatAutoOpenProps {
  messages: any[];
  landlordId: string;
  selectedUserId?: string; // Thêm prop này
  onUserMessage: (userId: string, userName?: string) => void;
}

export default function LandlordChatAutoOpen({
  messages,
  landlordId,
  onUserMessage,
}: LandlordChatAutoOpenProps) {
  useEffect(() => {
    if (!Array.isArray(messages)) return;

    const landlordIdStr = String(landlordId).trim();

    messages.forEach((raw) => {
      let parsedMessage;
      try {
        parsedMessage = typeof raw === "string" ? JSON.parse(raw) : raw;
      } catch {
        return;
      }

      const fromUserId = String(parsedMessage.fromUserId || "").trim();
      const toUserId = String(parsedMessage.toUserId || "").trim();

      // Chỉ xử lý tin nhắn gửi đến landlord từ user khác
      if (
        toUserId === landlordIdStr &&
        fromUserId &&
        fromUserId !== landlordIdStr
      ) {
        // Chỉ trigger onUserMessage, không tự động switch chat
        // Việc switch sẽ do parent component quyết định
        onUserMessage(fromUserId, parsedMessage.fromUserName);
      }
    });
  }, [messages, landlordId, onUserMessage]);

  // Component này không render gì
  return null;
}
