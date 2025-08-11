// /* eslint-disable @typescript-eslint/no-explicit-any */
// import apiClient from "../lib/api-client-ad";
// import type {
//   UserResponseDto,
//   RoleUpdateRequestDto,
//   UpdateUserStatusRequestDto,
// } from "../types/type";

// export async function fetchAccounts(): Promise<UserResponseDto[]> {
//   try {
//     const data = await apiClient.get(`/admin/accounts`);

//     // console.log("✅ API raw data:", data);
//     // console.log("🔍 Array.isArray(data):", Array.isArray(data));

//     if (!Array.isArray(data)) {
//       // console.error("❌ API không trả về mảng:", data);
//       return [];
//     }

//     return data;
//   } catch (error: any) {
//     console.error("❌ Lỗi khi fetchAccounts:", error);
//     throw error;
//   }
// }




// export async function updateAccountStatus(id: string, status: number) {
//   const body: UpdateUserStatusRequestDto = { status };
//   return await apiClient.patch(`/admin/accounts/${id}/status`, body);
// }

// export async function updateAccountRoles(id: string, roleNames: string[]) {
//   const body: RoleUpdateRequestDto = { roleNames };
//   return await apiClient.patch(`/admin/accounts/${id}/roles`, body);
// }

/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from "../lib/api-client-ad";
import type {
  UserResponseDto,
  RoleUpdateRequestDto,
  UpdateUserStatusRequestDto,
} from "../types/type";

/**
 * Lấy danh sách toàn bộ tài khoản từ API (không phân trang).
 * @returns Promise<UserResponseDto[]> - Một mảng các tài khoản.
 */
export async function fetchAccounts(): Promise<UserResponseDto[]> {
  try {
    const data: UserResponseDto[] = await apiClient.get(`/admin/accounts`);

    // Kiểm tra xem dữ liệu trả về có phải là một mảng không
    if (!Array.isArray(data)) {
      console.error("❌ API did not return a valid array:", data);
      return [];
    }

    return data;
  } catch (error: any) {
    console.error("❌ Error fetching accounts:", error);
    throw error;
  }
}

export async function updateAccountStatus(id: string, status: number) {
  const body: UpdateUserStatusRequestDto = { status };
  return await apiClient.patch(`/admin/accounts/${id}/status`, body);
}

export async function updateAccountRoles(id: string, roleNames: string[]) {
  const body: RoleUpdateRequestDto = { roleNames };
  return await apiClient.patch(`/admin/accounts/${id}/roles`, body);
}
