// services/ChatService.ts
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  where,
  or,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getFullName } from "@/services/ProfileService";

// Interface for chat user data
export interface ChatUser {
  id: string;
  name?: string;
  avatar?: string;
  lastMessageTime?: Date;
  lastMessageText?: string;
  unreadCount?: number;
}

/**
 * Lắng nghe các cuộc trò chuyện của một người dùng và cập nhật danh sách
 * @param userId ID của người dùng (chủ nhà hoặc người thuê)
 * @param setChatUsers Hàm setter của React State để cập nhật danh sách người dùng
 * @param setUnreadStatus Hàm setter của React State để cập nhật trạng thái tin nhắn chưa đọc
 * @param setIsLoading Hàm setter của React State để cập nhật trạng thái tải dữ liệu
 * @param setError Hàm setter của React State để cập nhật lỗi
 * @returns Hàm unsubscribe để dọn dẹp listener
 */
export const listenForConversations = (
  landlordId: string,
  lastReadTimestamps: React.MutableRefObject<Map<string, Date>>,
  setUserList: (users: ChatUser[]) => void,
  setIsLoading: (loading: boolean) => void,
  setError: (error: string) => void
) => {
  if (!landlordId) {
    setIsLoading(false);
    return () => {}; // Return a no-op function
  }

  const q = query(
    collection(db, "messages"),
    or(
      where("senderId", "==", landlordId),
      where("recipientId", "==", landlordId)
    ),
    orderBy("createdAt", "desc")
  );

  const unsubscribe = onSnapshot(
    q,
    async (snapshot) => {
      const conversations = new Map<string, ChatUser>();
      const unreadCounts = new Map<string, number>();
      const uniqueUserIds = new Set<string>();

      snapshot.forEach((doc) => {
        const data = doc.data();
        const otherUserId =
          data.senderId === landlordId ? data.recipientId : data.senderId;

        if (!otherUserId || otherUserId === landlordId) return;
        uniqueUserIds.add(otherUserId);

        // Update last message
        if (!conversations.has(otherUserId)) {
          const lastMessageTime = data.createdAt
            ? new Date(data.createdAt.seconds * 1000)
            : new Date();
          const lastMessageText = data.text || "";
          conversations.set(otherUserId, {
            id: otherUserId,
            lastMessageTime,
            lastMessageText,
          });
        }

        // Count unread messages
        const lastReadTime = lastReadTimestamps.current.get(otherUserId);
        if (
          data.recipientId === landlordId &&
          (!lastReadTime ||
            lastReadTime < new Date(data.createdAt.seconds * 1000))
        ) {
          const currentCount = unreadCounts.get(otherUserId) || 0;
          unreadCounts.set(otherUserId, currentCount + 1);
        }
      });

      // Fetch user details and merge
      const userIds = Array.from(uniqueUserIds);
      const namePromises = userIds.map(async (id) => {
        try {
          const data = await getFullName(id);
          return { id, name: data.fullName, avatar: data.avatar };
        } catch (error) {
          console.error(`Failed to get name for user ${id}:`, error);
          return { id, name: id, avatar: "" };
        }
      });
      const names = await Promise.all(namePromises);
      const updatedUserList: ChatUser[] = names.map(({ id, name, avatar }) => {
        const chatData = conversations.get(id);
        const unreadCount = unreadCounts.get(id) || 0;
        return {
          ...chatData!,
          name: name,
          avatar: avatar,
          unreadCount: unreadCount,
        };
      });

      setUserList(updatedUserList);
      setIsLoading(false);
    },
    (err) => {
      console.error("Firebase fetch error:", err);
      setError("Không thể tải tin nhắn. Vui lòng thử lại.");
      setIsLoading(false);
    }
  );

  return unsubscribe;
};

/**
 * Cập nhật trạng thái đã đọc của một cuộc trò chuyện
 * @param landlordId ID của chủ nhà
 * @param otherUserId ID của người dùng còn lại
 */
export const markConversationAsRead = async (
  landlordId: string,
  otherUserId: string
) => {
  const readStatusDocRef = doc(
    db,
    "readStatuses",
    `${landlordId}-${otherUserId}`
  );
  await setDoc(
    readStatusDocRef,
    {
      userId: landlordId,
      conversationId: otherUserId,
      lastRead: serverTimestamp(),
    },
    { merge: true }
  );
};