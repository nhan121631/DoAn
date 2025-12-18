// services/ChatService.ts
import { db } from "../lib/firebase";
import apiClient from "../lib/api-client-ad";
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
  getDocs,
} from "firebase/firestore";
import { API_URL, URL_IMAGE } from "./Constant";

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
  messageType: "text" | "image";
}

/**
 * Fetch landlord IDs from Firestore collection 'landlords'.
 * Expects each document to either have a `userId` field or use the document id as landlord id.
 * Similar to fetchAdminIdsFromFirestore in next-app-client
 */
export const fetchLandlordIdsFromFirestore = async (): Promise<Set<string>> => {
  try {
    const q = query(collection(db, "landlords"));
    const snap = await getDocs(q);
    const ids = new Set<string>();
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      const landlordId = data?.userId || docSnap.id;
      if (landlordId) ids.add(String(landlordId));
    });
    console.log("✅ Fetched landlord IDs from Firestore:", ids);
    return ids;
  } catch (error) {
    console.error("Failed to fetch landlord IDs from Firestore:", error);
    return new Set<string>();
  }
};

/**
 * Get full name and avatar from backend API
 * Similar to getFullName in next-app-client ProfileService
 */
export const getFullName = async (
  userId: string
): Promise<{ fullName: string; avatar: string }> => {
  try {
    const response = await apiClient.get(`/profile/getname/${userId}`);
    // apiClient returns response.data directly
    const data = response as {
      fullName?: string;
      name?: string;
      avatar?: string;
    };

    return {
      fullName: data.fullName || data.name || `User ${userId}`,
      avatar: data.avatar || "",
    };
  } catch (error) {
    console.error(`Failed to get user info for ${userId}:`, error);
    return { fullName: `User ${userId}`, avatar: "" };
  }
};

/**
 * Listen for conversations for admin user
 */
export const listenForConversations = (
  adminId: string,
  lastReadTimestamps: React.MutableRefObject<Map<string, Date>>,
  setUserList: (users: ChatUser[]) => void,
  setIsLoading: (loading: boolean) => void,
  setError: (error: string) => void
) => {
  if (!adminId) {
    console.warn("⚠️ listenForConversations: adminId is empty");
    setIsLoading(false);
    return () => {}; // Return a no-op function
  }

  console.log("🔔 Setting up message listener for admin:", adminId);

  const q = query(
    collection(db, "messages"),
    or(where("senderId", "==", adminId), where("recipientId", "==", adminId)),
    orderBy("createdAt", "desc")
  );

  const unsubscribe = onSnapshot(
    q,
    async (snapshot) => {
      console.log("📨 Received", snapshot.size, "messages");

      const conversations = new Map<string, ChatUser>();
      const unreadCounts = new Map<string, number>();
      const uniqueUserIds = new Set<string>();

      snapshot.forEach((doc) => {
        const data = doc.data();
        const otherUserId =
          data.senderId === adminId ? data.recipientId : data.senderId;

        if (!otherUserId || otherUserId === adminId) return;
        uniqueUserIds.add(otherUserId);

        // Update last message
        if (!conversations.has(otherUserId)) {
          const lastMessageTime = data.createdAt
            ? new Date(data.createdAt.seconds * 1000)
            : new Date();
          const lastMessageText =
            data.messageType === "image"
              ? "📷 Đã gửi một ảnh"
              : data.text || "";
          conversations.set(otherUserId, {
            id: otherUserId,
            lastMessageTime,
            lastMessageText,
          });
        }

        // Count unread messages
        const lastReadTime = lastReadTimestamps.current.get(otherUserId);
        if (
          data.recipientId === adminId &&
          (!lastReadTime ||
            lastReadTime < new Date(data.createdAt.seconds * 1000))
        ) {
          const currentCount = unreadCounts.get(otherUserId) || 0;
          unreadCounts.set(otherUserId, currentCount + 1);
        }
      });

      console.log("👥 Found conversations with:", Array.from(uniqueUserIds));

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

      console.log(
        "✅ User list updated:",
        updatedUserList.length,
        "conversations"
      );
      setUserList(updatedUserList);
      setIsLoading(false);
    },
    (err) => {
      console.error("❌ Firebase fetch error:", err);
      setError("Không thể tải tin nhắn. Vui lòng thử lại.");
      setIsLoading(false);
    }
  );

  return unsubscribe;
};

/**
 * Mark conversation as read
 */
export const markConversationAsRead = async (
  adminId: string,
  otherUserId: string
) => {
  try {
    const readStatusDocRef = doc(
      db,
      "readStatuses",
      `${adminId}-${otherUserId}`
    );
    await setDoc(
      readStatusDocRef,
      {
        userId: adminId,
        conversationId: otherUserId,
        lastRead: serverTimestamp(),
      },
      { merge: true }
    );
    console.log(
      `Marked conversation with ${otherUserId} as read for ${adminId}`
    );
  } catch (error) {
    console.error("Error marking conversation as read:", error);
    throw error;
  }
};

/**
 * Upload image to backend API
 * Uses the same endpoint as next-app-client
 */
export const uploadImageToBackend = async (
  file: File
): Promise<{ imageUrl: string; fileName: string }> => {
  const formData = new FormData();
  formData.append("image", file);

  try {
    // Use the same API as next-app-client
    const response = await fetch(`${API_URL}/chat/upload-image`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Upload failed");
    }

    const result = await response.json();
    return {
      imageUrl: `${URL_IMAGE}${result.imageUrl}`,
      fileName: result.fileName || file.name,
    };
  } catch (error) {
    console.error("Upload image error:", error);
    throw new Error("Upload failed. Backend API not available.");
  }
};

/**
 * Send image message
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
    messageType: "image",
  });
};

/**
 * Send text message
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
    messageType: "text",
  });
};

/**
 * Listen for total unread count for admin dashboard
 */
export const listenForUnreadCount = (
  adminId: string,
  setUnreadCount: (count: number) => void
): (() => void) => {
  if (!adminId) {
    return () => {};
  }

  let currentReadTimestamps = new Map<string, Date>();

  // Listen for read statuses first
  const readStatusQuery = query(
    collection(db, "readStatuses"),
    where("userId", "==", adminId)
  );

  const unsubscribeReadStatus = onSnapshot(readStatusQuery, (snapshot) => {
    const newTimestamps = new Map<string, Date>();
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.lastRead) {
        newTimestamps.set(
          data.conversationId,
          new Date(data.lastRead.seconds * 1000)
        );
      }
    });
    currentReadTimestamps = newTimestamps;
    console.log(
      "Unread count listener: Read timestamps updated:",
      newTimestamps
    );
  });

  // Listen for messages and calculate unread count
  const messagesQuery = query(
    collection(db, "messages"),
    where("recipientId", "==", adminId),
    orderBy("createdAt", "desc")
  );

  const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
    const unreadCounts = new Map<string, number>();

    snapshot.forEach((doc) => {
      const data = doc.data();
      const senderId = data.senderId;

      if (!senderId || senderId === adminId) return;

      const lastReadTime = currentReadTimestamps.get(senderId);
      const messageTime = data.createdAt
        ? new Date(data.createdAt.seconds * 1000)
        : new Date();

      if (!lastReadTime || lastReadTime < messageTime) {
        const currentCount = unreadCounts.get(senderId) || 0;
        unreadCounts.set(senderId, currentCount + 1);
      }
    });

    const totalUnread = Array.from(unreadCounts.values()).reduce(
      (sum, count) => sum + count,
      0
    );
    console.log("Unread count listener: Total unread messages:", totalUnread);
    setUnreadCount(totalUnread);
  });

  return () => {
    unsubscribeReadStatus();
    unsubscribeMessages();
  };
};

/**
 * Delete message
 */
export const deleteMessage = async (messageId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, "messages", messageId));
  } catch (error) {
    console.error("Error deleting message:", error);
    throw new Error("Không thể xóa tin nhắn");
  }
};
