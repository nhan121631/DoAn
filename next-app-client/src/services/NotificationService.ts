import { db } from "@/lib/firebase"; // file config firebase
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getLandlordByRoomId } from "./RoomService";

// Hàm tạo notification cho landlord
export const createBookingNotification = async (
  roomId: number | string | undefined,
  tenantId: number | string | undefined,
) => {
    const landlordId = await getLandlordByRoomId(roomId as string);
  try {
    await addDoc(collection(db, "notifications"), {
      receiverId: landlordId,     // landlord sẽ nhận
      senderId: tenantId,         // user tạo booking
      type: "booking_success",
      message: "You have a new booking from a tenant!",
      isRead: false,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Lỗi khi tạo notification:", error);
  }
};

export const createRequestNotification = async (
  landlordId: number | string | undefined,
  tenantId: number | string | undefined,
) => {
  try {
    await addDoc(collection(db, "notifications"), {
      receiverId: landlordId,     // landlord sẽ nhận
      senderId: tenantId,         // user tạo booking
      type: "request_success",
      message: "You have a new request from a tenant!",
      isRead: false,
      createdAt: serverTimestamp()
    });
     console.error("Request notification created successfully");
  } catch (error) {
    console.error("Lỗi khi tạo notification:", error);
  }
};
