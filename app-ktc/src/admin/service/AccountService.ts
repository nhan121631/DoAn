

import apiClient from "../lib/api-client-ad";
import type {
  UserResponseDto,
  UserPageResponseDto,
  RoleUpdateRequestDto,
  UpdateUserStatusRequestDto
} from "../types/type";
import { type AxiosResponse } from "axios";

// Lấy danh sách account
export async function fetchAccounts(page: number, size: number) {
  const res: AxiosResponse<UserPageResponseDto | UserResponseDto[]> = await apiClient.get(
    `/admin/accounts?page=${page}&size=${size}`
  );

  if (Array.isArray(res.data)) {
    // API trả mảng
    return {
      data: res.data as UserResponseDto[],
      pageNumber: 0,
      pageSize: res.data.length,
      totalRecords: res.data.length
    };
  } else {
    // API trả object phân trang
    return res.data as UserPageResponseDto;
  }
}

// Update status
export async function updateAccountStatus(id: string, status: number) {
  const body: UpdateUserStatusRequestDto = { status };
  return await apiClient.patch(`/admin/accounts/${id}/status`, body);
}

// Update roles
export async function updateAccountRoles(id: string, roleNames: string[]) {
  const body: RoleUpdateRequestDto = { roleNames };
  return await apiClient.patch(`/admin/accounts/${id}/roles`, body);
}
