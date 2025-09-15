import { db } from "@/lib/firebase"; // file config firebase
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// Hàm tạo notification cho landlord
export const createBookingNotification = async (
  landlordId: number | string | undefined,
  tenantId: number | string | undefined,
) => {
  try {
    await addDoc(collection(db, "notifications"), {
      receiverId: landlordId,     // landlord sẽ nhận
      senderId: tenantId,         // user tạo booking
      type: "booking_success",
      message: "Bạn có một booking mới từ người thuê!",
      isRead: false,
      createdAt: serverTimestamp()
    });
    console.log("Notification sent to landlord thành công!");
  } catch (error) {
    console.error("Lỗi khi tạo notification:", error);
  }
};
