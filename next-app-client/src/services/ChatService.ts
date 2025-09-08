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
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import { getFullName } from "@/services/ProfileService";
import { API_URL, URL_IMAGE } from "@/services/Constant";

// Interface for chat user data
export interface ChatUser {
  id: string;
  name?: string;
  avatar?: string;
  lastMessageTime?: Date;
  lastMessageText?: string;
  unreadCount?: number;
}

// Interface for message data
export interface Message {
  id: string;
  text?: string;
  imageUrl?: string;
  imageFileName?: string;
  senderId: string;
  recipientId: string;
  createdAt: Date | null;
  messageType: 'text' | 'image';
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
          const lastMessageText = data.messageType === 'image' 
            ? "📷 Đã gửi một ảnh" 
            : (data.text || "");
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

/**
 * Upload ảnh lên backend API
 * @param file File ảnh cần upload
 * @returns Promise<{ imageUrl: string, fileName: string }>
 */
export const uploadImageToBackend = async (
  file: File
): Promise<{ imageUrl: string; fileName: string }> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${API_URL.replace('/api', '')}/api/chat/upload-image`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Upload failed');
  }

  const result = await response.json();
  return {
    imageUrl: `${URL_IMAGE}${result.imageUrl}`,
    fileName: result.fileName || file.name,
  };
};

/**
 * Gửi tin nhắn ảnh
 * @param file File ảnh
 * @param senderId ID người gửi
 * @param recipientId ID người nhận
 * @returns Promise<void>
 */
export const sendImageMessage = async (
  file: File,
  senderId: string,
  recipientId: string
): Promise<void> => {
  const { imageUrl, fileName } = await uploadImageToBackend(file);

  await addDoc(collection(db, "messages"), {
    imageUrl: imageUrl,
    imageFileName: fileName,
    senderId: senderId,
    recipientId: recipientId,
    createdAt: serverTimestamp(),
    messageType: 'image',
  });
};

/**
 * Gửi tin nhắn văn bản
 * @param text Nội dung tin nhắn
 * @param senderId ID người gửi
 * @param recipientId ID người nhận
 * @returns Promise<void>
 */
export const sendTextMessage = async (
  text: string,
  senderId: string,
  recipientId: string
): Promise<void> => {
  await addDoc(collection(db, "messages"), {
    text,
    senderId: senderId,
    recipientId: recipientId,
    createdAt: serverTimestamp(),
    messageType: 'text',
  });
};

/**
 * Xóa tin nhắn
 * @param messageId ID tin nhắn cần xóa
 * @param senderId ID người gửi (để kiểm tra quyền xóa)
 * @returns Promise<void>
 */
export const deleteMessage = async (
  messageId: string,
  senderId: string
): Promise<void> => {
  try {
    await deleteDoc(doc(db, "messages", messageId));
  } catch (error) {
    console.error("Error deleting message:", error);
    throw new Error("Không thể xóa tin nhắn");
  }
};