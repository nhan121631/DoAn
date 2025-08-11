/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from "../lib/api-client-ad";
import type {
  UserResponseDto,
  RoleUpdateRequestDto,
  UpdateUserStatusRequestDto,
} from "../types/type";


export async function fetchAccounts(): Promise<UserResponseDto[]> {
  try {
    const data: UserResponseDto[] = await apiClient.get(`/admin/accounts`);

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
