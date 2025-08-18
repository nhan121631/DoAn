"use client";
import useWebSocket from "./useWebSocket";
import { API_URL } from "@/services/Constant";
import { useState, useRef, useEffect } from "react";

interface NormalizedMessage {
  id: string;
  localId?: string;
  content: string;
  fromUserId: string;
  toUserId: string;
  sentAt?: string;
  fromUserName?: string;
}

interface ChatClientProps {
  userId: string;
  defaultToUserId?: string;
  defaultToUserName?: string;
  landlordId?: string;
  messages?: (NormalizedMessage | string)[];
  sendMessage?: (toUserId: string, message: string) => void;
}

export default function ChatClient({
  userId,
  defaultToUserId,
  defaultToUserName,
  landlordId,
  messages: externalMessages,
  sendMessage: externalSendMessage,
}: ChatClientProps) {
  // Nếu có defaultToUserId thì luôn dùng, không cho chọn
  const [toUserId, setToUserId] = useState<string>(defaultToUserId || "");
  const [msg, setMsg] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [pagedMessages, setPagedMessages] = useState<any[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const safePagedMessages = Array.isArray(pagedMessages) ? pagedMessages : [];
  const isExternalMessages = Array.isArray(externalMessages);
  const ws = useWebSocket(userId || "");
  const sendMessage = externalSendMessage ?? ws.sendMessage;
  const safeWsMessages = Array.isArray(ws.messages) ? ws.messages : [];

  // Ref để biết có đang load thêm tin nhắn cũ không
  const loadingMoreRef = { current: false };

  // Hook lấy danh sách userId online
  function useOnlineUsers(currentUserId: string) {
    const [onlineUsers, setOnlineUsers] = useState<
      { id: string; name?: string }[]
    >([]);
    useEffect(() => {
      async function fetchUsers() {
        try {
          const res = await fetch(`${API_URL}/online-users`);
          const data = await res.json();

          // Nếu API trả về array string thì convert thành object
          const usersData = Array.isArray(data)
            ? data
                .filter((id: string) => id !== currentUserId)
                .map((id: string) => ({ id, name: id }))
            : data.filter((user: any) => user.id !== currentUserId);

          setOnlineUsers(usersData);
        } catch (e) {
          setOnlineUsers([]);
        }
      }
      fetchUsers();
      const interval = setInterval(fetchUsers, 3000); // Cập nhật mỗi 3s
      return () => clearInterval(interval);
    }, [currentUserId]);
    return onlineUsers;
  }

  const onlineUsers = useOnlineUsers(userId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Khi nhận được message có isRead: true, cập nhật lại trạng thái tin nhắn tương ứng trong state
  // Merge pagedMessages and wsMessages in real time, deduplicate, and update isRead status
  const mergedMessages = isExternalMessages
    ? externalMessages
    : (() => {
        // Combine all messages from both sources
        const allMsgs = [...safePagedMessages, ...safeWsMessages];

        // Deduplicate: keep only one message for each unique (id || message+fromUserId+sentAt)
        const uniqueMsgsMap = new Map();
        for (const raw of allMsgs) {
          let obj;
          try {
            obj = typeof raw === "string" ? JSON.parse(raw) : raw;
          } catch {
            obj = raw;
          }
          const key = obj.id
            ? `id:${obj.id}`
            : `msg:${obj.message}|from:${obj.fromUserId}|at:${obj.sentAt}`;
          // If already exists, prefer the one with isRead true
          if (uniqueMsgsMap.has(key)) {
            const existing = uniqueMsgsMap.get(key);
            if (existing.isRead || existing.read || !(obj.isRead || obj.read)) {
              continue;
            }
          }
          uniqueMsgsMap.set(key, obj);
        }
        // Update isRead status for any message that has a matching notify
        const msgsArr = Array.from(uniqueMsgsMap.values());
        const readNotifies = msgsArr.filter(
          (msg) => msg.isRead === true || msg.read === true
        );
        const updatedMsgs = msgsArr.map((msg) => {
          if (msg.isRead === true || msg.read === true) return msg;
          const matched = readNotifies.find(
            (notify) =>
              notify.fromUserId === msg.fromUserId &&
              notify.toUserId === msg.toUserId &&
              notify.message === msg.message &&
              notify.sentAt === msg.sentAt
          );
          if (matched) {
            return { ...msg, isRead: true };
          }
          return msg;
        });
        return updatedMsgs;
      })();

  const filteredMessages = mergedMessages
    .map((raw) => {
      try {
        const obj = typeof raw === "string" ? JSON.parse(raw) : raw;
        return {
          id: obj.id || obj.localId || obj._id || undefined,
          message: obj.message || obj.content,
          fromUserId: obj.fromUserId || obj.fromUser,
          toUserId: obj.toUserId || obj.toUser,
          fromUserName: obj.fromUserName,
          sentAt: obj.sentAt,
          isRead: obj.isRead || obj.read,
        };
      } catch {
        return {
          id: undefined,
          message: raw,
        };
      }
    })
    .filter((obj) => {
      if (!defaultToUserId) return true;
      // Hiển thị tất cả tin nhắn giữa landlord (userId) và user đang chọn (defaultToUserId)
      return (
        (obj.fromUserId === userId && obj.toUserId === defaultToUserId) ||
        (obj.fromUserId === defaultToUserId && obj.toUserId === userId)
      );
    })
    // Loại bỏ duplicate messages dựa trên id hoặc content + timestamp
    .filter((obj, index, arr) => {
      return (
        arr.findIndex((other) => {
          if (obj.id && other.id && obj.id === other.id) return true;
          // Nếu không có id, check duplicate bằng content + fromUserId + timestamp
          if (
            obj.message === other.message &&
            obj.fromUserId === other.fromUserId &&
            obj.sentAt === other.sentAt
          )
            return true;
          return false;
        }) === index
      );
    })
    // Sắp xếp theo thời gian
    .sort((a, b) => {
      const timeA = a.sentAt ? new Date(a.sentAt).getTime() : Date.now();
      const timeB = b.sentAt ? new Date(b.sentAt).getTime() : Date.now();
      return timeA - timeB;
    });

  // Đảm bảo userId luôn là string hợp lệ
  useEffect(() => {
    if (!userId || userId === "") {
      console.warn(
        "[ChatClient] userId truyền vào useWebSocket bị rỗng hoặc undefined!",
        userId
      );
    } else {
      console.log("[ChatClient] Kết nối WebSocket với userId:", userId);
    }
  }, [userId]);

  // Gửi sự kiện đã đọc khi user mở đoạn chat hoặc khi có tin nhắn mới từ đối phương
  const lastReadSentRef = useRef(false);
  useEffect(() => {
    if (!userId || !defaultToUserId) return;
    // Kiểm tra nếu có tin nhắn chưa đọc từ đối phương
    const hasUnread = filteredMessages.some(
      (msg) =>
        msg.fromUserId === defaultToUserId &&
        msg.toUserId === userId &&
        !msg.isRead
    );
    if (hasUnread && !lastReadSentRef.current) {
      ws.sendReadEvent(userId, defaultToUserId);
      lastReadSentRef.current = true;
    } else if (!hasUnread) {
      lastReadSentRef.current = false;
    }
  }, [userId, defaultToUserId, filteredMessages.length]);

  // Luôn cập nhật toUserId khi defaultToUserId thay đổi
  useEffect(() => {
    if (typeof defaultToUserId === "string" && defaultToUserId !== "") {
      setToUserId(defaultToUserId);
    }
  }, [defaultToUserId]);

  // Chỉ fetch phân trang khi không truyền prop messages
  useEffect(() => {
    console.log("Fetching paged messages...");
    console.log("UserId:", userId);
    console.log("DefaultToUserId:", defaultToUserId);
    if (isExternalMessages) return;
    if (!userId || !defaultToUserId) return;
    setLoading(true);
    fetch(
      `${API_URL}/messages?user1=${userId}&user2=${defaultToUserId}&size=20`
    )
      .then((res) => res.json())
      .then((data) => {
        setPagedMessages(data || []);
        setHasMore((data || []).length === 20);
        setLoading(false);
      });
  }, [userId, defaultToUserId, isExternalMessages]);

  // Auto scroll xuống cuối khi lần đầu load hoặc vừa gửi tin nhắn mới
  const justSentRef = useRef(false);
  const firstLoadRef = useRef(true);
  const userScrolledUpRef = useRef(false);

  // Theo dõi user scroll lên
  const handleUserScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (isExternalMessages) return;
    const container = e.currentTarget;
    // Nếu user scroll lên trên 100px thì coi là đã scroll lên
    if (
      container.scrollTop <
      container.scrollHeight - container.clientHeight - 100
    ) {
      userScrolledUpRef.current = true;
    } else {
      userScrolledUpRef.current = false;
    }
    handleScroll(e);
  };

  useEffect(() => {
    if (loadingMoreRef.current) {
      loadingMoreRef.current = false;
      return;
    }
    // Lần đầu load hoặc vừa gửi tin nhắn mới thì scroll xuống cuối, chỉ khi có tin nhắn
    if (
      (firstLoadRef.current || justSentRef.current) &&
      filteredMessages.length > 0
    ) {
      firstLoadRef.current = false;
      justSentRef.current = false;
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    // Nếu user đang ở cuối (không scroll lên), khi nhận tin nhắn mới thì scroll xuống
    if (!userScrolledUpRef.current && filteredMessages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    // Nếu user đã scroll lên thì không tự động scroll xuống nữa
  }, [mergedMessages, filteredMessages.length]);

  // Infinite scroll: khi scroll lên đầu thì load thêm tin nhắn cũ và giữ vị trí scroll
  const handleScroll = async (e: React.UIEvent<HTMLDivElement>) => {
    if (isExternalMessages) return;
    if (loading || !hasMore || !userId || !defaultToUserId) return;
    if (pagedMessages.length === 0) return;
    const container = e.currentTarget;
    if (container.scrollTop === 0) {
      const prevScrollHeight = container.scrollHeight;
      const oldest = pagedMessages[0];
      const before = oldest?.sentAt;
      if (!before) return;
      setLoading(true);
      loadingMoreRef.current = true;
      const res = await fetch(
        `${API_URL}/messages?user1=${userId}&user2=${defaultToUserId}&size=20&before=${before}`
      );
      const data = await res.json();
      if (data && data.length > 0) {
        setPagedMessages((prev) => {
          setTimeout(() => {
            if (messagesContainerRef.current) {
              // Giữ lại vị trí scroll sau khi prepend
              messagesContainerRef.current.scrollTop =
                messagesContainerRef.current.scrollHeight - prevScrollHeight;
            }
          }, 0);
          return [...data, ...prev];
        });
        setHasMore(data.length === 20);
      } else {
        setHasMore(false);
      }
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!msg.trim()) return;
    const targetId = landlordId ? landlordId : toUserId;
    if (!targetId) return;

    setIsSending(true);
    justSentRef.current = true;

    try {
      await sendMessage(targetId, msg.trim());
      setMsg("");
      setIsTyping(false);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setTimeout(() => setIsSending(false), 500); // Delay để animation mượt
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMsg(e.target.value);
    setIsTyping(e.target.value.length > 0);
  };

  const getChatPartnerName = () => {
    const firstMsg = mergedMessages.find((raw) => {
      try {
        const obj = typeof raw === "string" ? JSON.parse(raw) : raw;
        return obj.fromUserId !== userId && obj.fromUserName;
      } catch {
        return false;
      }
    });
    if (firstMsg) {
      try {
        const obj =
          typeof firstMsg === "string" ? JSON.parse(firstMsg) : firstMsg;
        return obj.fromUserName;
      } catch {}
    }
    return null;
  };

  // Function để tạo tên hiển thị từ userId
  const getDisplayName = (userId: string) => {
    if (!userId) return "Người dùng";

    // Nếu có tên trong mergedMessages thì dùng
    const msgWithName = mergedMessages.find((raw) => {
      try {
        const obj = typeof raw === "string" ? JSON.parse(raw) : raw;
        return obj.fromUserId === userId && obj.fromUserName;
      } catch {
        return false;
      }
    });

    if (msgWithName) {
      try {
        const obj =
          typeof msgWithName === "string"
            ? JSON.parse(msgWithName)
            : msgWithName;
        return obj.fromUserName;
      } catch {}
    }

    // Nếu không có tên, tạo tên ngắn từ ID
    if (userId.length > 10) {
      return `User ${userId.slice(0, 4)}...${userId.slice(-4)}`;
    }
    return `User ${userId}`;
  };

  // Luôn ưu tiên tên từ defaultToUserName (tức là user được chọn ở sidebar)
  const chatPartnerName =
    defaultToUserName ||
    (defaultToUserId ? getDisplayName(defaultToUserId) : null);
  const isConnected = onlineUsers.length >= 0; // Giả định connected nếu có dữ liệu

  // Emoji picker data
  const emojis = [
    "😀",
    "😍",
    "🥰",
    "😎",
    "😂",
    "🤣",
    "😊",
    "😉",
    "😋",
    "🤔",
    "👍",
    "❤️",
    "🔥",
    "✨",
    "🎉",
    "👏",
  ];

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-100/50 dark:border-gray-800 backdrop-blur-sm">
      {/* Enhanced Header with Gradient Animation */}
      <div className="relative bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-6 py-4 text-white dark:text-gray-100 overflow-hidden">
        {/* Animated background overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 animate-pulse" />

        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Enhanced Avatar with Animation */}
            <div className="relative">
              <div className="w-12 h-12 bg-white/20 dark:bg-gray-700/60 rounded-full flex items-center justify-center text-lg font-bold backdrop-blur-sm border border-white/30 dark:border-gray-700 transition-all duration-300 hover:scale-110 hover:bg-white/30 dark:hover:bg-gray-700/80">
                {chatPartnerName
                  ? chatPartnerName.charAt(0).toUpperCase()
                  : "💬"}
              </div>
              {/* Online status indicator with pulse */}
              <div
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-700 transition-all duration-500 ${
                  isConnected
                    ? "bg-green-400 animate-pulse dark:bg-green-500"
                    : "bg-gray-400 dark:bg-gray-600"
                }`}
              >
                {isConnected && (
                  <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75" />
                )}
              </div>
            </div>

            <div className="animate-fade-in">
              <h2 className="text-lg font-bold bg-white/90 bg-clip-text text-transparent dark:bg-gray-900/80 dark:text-gray-100">
                {chatPartnerName || "Messages"}
              </h2>
              <div className="flex items-center space-x-2 text-sm text-blue-100 dark:text-gray-400">
                <div
                  className={`w-2 h-2 rounded-full transition-all duration-500 ${
                    isConnected
                      ? "bg-green-300 animate-pulse dark:bg-green-400"
                      : "bg-gray-300 dark:bg-gray-600"
                  }`}
                />
                <span className="font-medium">
                  {isConnected ? "Active now" : "Offline"}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            <button className="w-10 h-10 bg-white/10 dark:bg-gray-700/40 rounded-full flex items-center justify-center hover:bg-white/20 dark:hover:bg-gray-700/60 transition-all duration-300 hover:scale-110 active:scale-95">
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
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced User Selection Dropdown */}
      {(!defaultToUserId || defaultToUserId === "") && (
        <div className="p-4 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 border-b border-gray-100 dark:border-gray-800">
          <div className="relative group">
            <select
              value={toUserId}
              onChange={(e) => setToUserId(e.target.value)}
              className="w-full bg-white/80 dark:bg-gray-800 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent appearance-none transition-all duration-300 group-hover:shadow-lg text-gray-900 dark:text-gray-100"
            >
              <option value="">💬 Choose someone to chat with</option>
              {onlineUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  🟢 {getDisplayName(user.id)}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-400 dark:text-gray-500 transition-transform duration-300 group-hover:rotate-180"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Messages Container */}
      <div
        className="overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50/50 to-white dark:bg-gradient-to-b dark:from-gray-900/70 dark:to-gray-800 dark:text-gray-100 relative scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 dark:hover:scrollbar-thumb-gray-600"
        ref={messagesContainerRef}
        onScroll={handleUserScroll}
        style={{ height: "450px" }}
      >
        {/* Loading indicator at top */}
        {loading && (
          <div className="flex justify-center py-4 animate-fade-in">
            <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-gray-100">
              <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce" />
              <div
                className="w-4 h-4 bg-purple-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              />
              <div
                className="w-4 h-4 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              />
              <span className="text-sm text-gray-600 font-medium ml-2">
                Loading messages...
              </span>
            </div>
          </div>
        )}

        {filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in-up py-16">
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center text-3xl">
                💬
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white text-sm font-bold animate-bounce">
                ✨
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Start the conversation!
            </h3>
            <p className="text-gray-500 mb-4">
              No messages yet. Send your first message below.
            </p>
            <div className="flex space-x-2">
              {["👋", "😊", "🔥"].map((emoji, i) => (
                <div
                  key={i}
                  className="w-10 h-10 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center text-lg hover:scale-110 transition-transform duration-300 animate-bounce cursor-pointer"
                  style={{ animationDelay: `${i * 0.2}s` }}
                  onClick={() => setMsg((prev) => prev + emoji)}
                >
                  {emoji}
                </div>
              ))}
            </div>
          </div>
        ) : (
          filteredMessages.map((obj, i) => (
            <div
              key={obj.id || obj.message + obj.sentAt || i}
              className={`flex animate-slide-in ${
                obj.fromUserId === userId ? "justify-end" : "justify-start"
              }`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div
                className={`group max-w-[85%] px-4 py-3 rounded-2xl transition-all duration-300 hover:scale-105 transform ${
                  obj.fromUserId === userId
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-blue-700"
                    : "bg-white text-gray-800 border border-gray-100 rounded-bl-md shadow-md hover:shadow-lg hover:border-gray-200"
                }`}
              >
                <div className="text-sm leading-relaxed break-words">
                  {obj.message}
                </div>

                {/* Enhanced Timestamp + Read Status */}
                <div
                  className={`text-xs mt-2 flex items-center justify-between transition-all duration-300 ${
                    obj.fromUserId === userId
                      ? "text-blue-100"
                      : "text-gray-400"
                  }`}
                >
                  <span>
                    {obj.sentAt
                      ? new Date(obj.sentAt).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </span>

                  {/* Enhanced Read Status */}
                  {(() => {
                    const mySent = filteredMessages.filter(
                      (m) => m.fromUserId === userId
                    );
                    const lastMyMsg =
                      mySent.length > 0 ? mySent[mySent.length - 1] : null;
                    return (
                      lastMyMsg &&
                      lastMyMsg.id === obj.id &&
                      obj.fromUserId === userId && (
                        <div className="flex items-center space-x-1">
                          {lastMyMsg.isRead ? (
                            <>
                              <svg
                                className="w-4 h-4 text-green-300"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span className="text-green-300 font-medium">
                                Seen
                              </span>
                            </>
                          ) : (
                            <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" />
                          )}
                        </div>
                      )
                    );
                  })()}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced Typing Indicator */}
      {isTyping && (
        <div className="px-6 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border-t border-gray-100 animate-fade-in">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
              <div
                className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              />
              <div
                className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              />
            </div>
            <span className="text-sm text-gray-600">You are typing...</span>
          </div>
        </div>
      )}

      {/* Enhanced Input Area */}
      <div className="p-4 bg-white/80 backdrop-blur-sm border-t border-gray-100">
        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="mb-4 p-3 bg-white rounded-xl shadow-lg border border-gray-100 animate-slide-up">
            <div className="grid grid-cols-8 gap-2">
              {emojis.map((emoji, i) => (
                <button
                  key={i}
                  className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-lg transition-all duration-200 hover:scale-125 active:scale-110"
                  onClick={() => {
                    setMsg((prev) => prev + emoji);
                    setShowEmojiPicker(false);
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex space-x-3 items-end">
          {/* Emoji Toggle Button */}
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95 ${
              showEmojiPicker
                ? "bg-blue-500 text-white shadow-lg"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
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
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>

          {/* Enhanced Input Field */}
          <div className="flex-1 relative group">
            <input
              type="text"
              placeholder="Type your message..."
              value={msg}
              onChange={handleInputChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-16 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm group-hover:shadow-lg placeholder-gray-400"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              maxLength={500}
            />

            {/* Character Counter with Animation */}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
              <span
                className={`text-xs transition-colors duration-300 ${
                  msg.length > 400
                    ? "text-red-500"
                    : msg.length > 300
                    ? "text-yellow-500"
                    : "text-gray-400"
                }`}
              >
                {msg.length}/500
              </span>
              {msg.length > 0 && (
                <button
                  onClick={() => setMsg("")}
                  className="w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-all duration-200 hover:scale-110"
                >
                  <svg
                    className="w-3 h-3 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Enhanced Send Button with Loading State */}
          <button
            onClick={handleSend}
            disabled={!msg.trim() || (!landlordId && !toUserId) || isSending}
            className={`relative px-6 py-3 rounded-xl font-medium transition-all duration-300 overflow-hidden ${
              msg.trim() && (landlordId || toUserId) && !isSending
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 shadow-lg hover:shadow-xl active:scale-100"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {/* Loading Overlay */}
            {isSending && (
              <div className="absolute inset-0 bg-blue-600 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {/* Send Icon */}
            {!isSending && (
              <svg
                className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Enhanced Connection Status */}
        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full transition-all duration-500 ${
                isConnected ? "bg-green-400 animate-pulse" : "bg-red-400"
              }`}
            />
            <span className="font-medium">
              {isConnected ? "Connected" : "Connection lost"}
            </span>
          </div>

          {onlineUsers.length > 0 && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <span>{onlineUsers.length} online</span>
            </div>
          )}
        </div>
      </div>

      {/* Custom CSS Styles */}
      <style jsx>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
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

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-in {
          animation: slide-in 0.4s ease-out forwards;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out forwards;
        }

        /* Custom Scrollbar */
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }

        .scrollbar-track-transparent::-webkit-scrollbar-track {
          background: transparent;
        }

        .scrollbar-thumb-gray-200::-webkit-scrollbar-thumb {
          background-color: rgb(229 231 235);
          border-radius: 3px;
        }

        .scrollbar-thumb-gray-200::-webkit-scrollbar-thumb:hover {
          background-color: rgb(209 213 219);
        }

        /* Message bubble animations */
        .group:hover .animate-bounce {
          animation-duration: 0.5s;
        }

        /* Gradient text animation */
        @keyframes gradient-x {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .bg-gradient-animated {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
      `}</style>
    </div>
  );
}
