/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from "../lib/api-client-ad";
import type { RoomPageResponseDto } from "../types/type";

export async function fetchAllRoomPaging(
  page: number = 0,
  size: number = 10
): Promise<RoomPageResponseDto> {
  try {
    const response = await apiClient.get(
      `/rooms/by-admin/paging?page=${page}&size=${size}`
    );
    // response.data dạng: RoomPageResponseDto
    console.log("✅ API raw data:", response);
    return response as unknown as RoomPageResponseDto;
  } catch (error: any) {
    console.error("❌ Lỗi khi fetch:", error);
    throw error;
  }
}

export async function updateRoomApproval(
  roomId: string,
  approval: number
): Promise<any> {
  try {
    const response = await apiClient.patch(`/rooms/${roomId}/approval`, {
      approval: approval,
    });
    console.log("✅ API raw data:", response);
    return response.data;
  } catch (error: any) {
    console.error("❌ Lỗi khi cập nhật phê duyệt phòng:", error);
    throw error;
  }
}

export async function sendAdminEmailToLandlord(
  email: string,
  subject: string,
  message: string
): Promise<any> {
  try {
    const formData = new FormData();
    formData.append("subject", subject);
    formData.append("message", message);
    const response = await apiClient.post(
      `/rooms/admin-send-email/${email}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    console.log("✅ Email API response:", response);
    return response.data;
  } catch (error: any) {
    console.error("❌ Lỗi khi gửi email:", error);
    throw error;
  }
}

export async function deleteRoom(
  roomId: string,
  isRemoved: number
): Promise<any> {
  try {
    const response = await apiClient.patch(`/rooms/${roomId}/delete`, {
      isRemoved: isRemoved,
    });
    console.log("✅ Room deletion response:", response);
    return response.data;
  } catch (error: any) {
    console.error("❌ Lỗi khi xóa phòng:", error);
    throw error;
  }
}

export async function sendAdminEmailToLandlordWithFile(
  formData: FormData
): Promise<any> {
  try {
    const response = await apiClient.post(`/rooms/admin-send-email`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error: any) {
    console.error("❌ Lỗi khi gửi email:", error);
    throw error;
  }
}

export async function getRoomById(roomId: string): Promise<any> {
  try {
    const response = await apiClient.get(`/rooms/${roomId}`);
    console.log("✅ Room raw response:", response);
    return response;
  } catch (error: any) {
    console.error("❌ Lỗi khi lấy thông tin phòng:", error);
    throw error;
  }
}
