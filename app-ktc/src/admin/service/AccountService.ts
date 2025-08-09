import apiClient from "../lib/api-client-ad";
import type {
  UserResponseDto,
  RoleUpdateRequestDto,
  UpdateUserStatusRequestDto,
  PaginatedResponse,
} from "../types/type";

export async function fetchAccounts(page = 0, size = 10): Promise<PaginatedResponse<UserResponseDto>> {
  try {
    const response = await apiClient.get(`/admin/accounts?page=${page}&size=${size}`);
    
    console.log("✅ API raw response:", response);
    
    // Kiểm tra xem response có phải là object PaginatedResponse hay không
    const data = response.data !== undefined ? response.data : response;
    
    // Kiểm tra data có đúng định dạng không
    if (!data || !data.content || !Array.isArray(data.content)) {
      console.error("❌ API không trả về đúng định dạng phân trang:", data);
      return {
        content: [],
        page: 0,
        size: size,
        totalElements: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
      };
    }

    return data;
  } catch (error: any) {
    console.error("❌ Lỗi khi fetchAccounts:", error);
    throw error;
  }
}
// Các hàm khác cũng cần sửa để lấy data từ response
export async function updateAccountStatus(id: string, status: number) {
  const body: UpdateUserStatusRequestDto = { status };
  const response = await apiClient.patch(`/admin/accounts/${id}/status`, body);
  return response.data;
}

export async function updateAccountRoles(id: string, roleNames: string[]) {
  const body: RoleUpdateRequestDto = { roleNames };
  const response = await apiClient.patch(`/admin/accounts/${id}/roles`, body);
  return response.data;
}