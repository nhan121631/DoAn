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
