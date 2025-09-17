/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  PaginatedResponse,
  Requirement,
  RequirementDetail,
  RequirementRequestRoomDto,
  UpdateRequestRoomDto,
} from "@/types/types";
import { API_URL } from "./Constant";
// import { Update } from "next/dist/build/swc/types";

export async function createRequest(
  data: RequirementRequestRoomDto
): Promise<RequirementRequestRoomDto> {
  const response = await fetch("/api/requirements/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (!response.ok) {
    // Nếu backend trả về error dạng { error: ..., message: ... }
    let errorMsg =
      result?.error || result?.message || "Failed to create request";
    // Nếu message là mảng, lấy phần tử đầu tiên
    if (Array.isArray(errorMsg)) {
      errorMsg = errorMsg[0];
    }
    throw new Error(errorMsg);
  }
  return result;
}

export async function getRequestsByLandlordId(
  page = 0,
  size = 5
): Promise<PaginatedResponse<Requirement>> {
  const response = await fetch(
    `/api/requirements/requirements-landlord?page=${page}&size=${size}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const result = await response.json();
  if (!response.ok) {
    let errorMsg =
      result?.error || result?.message || "Failed to fetch requests";
    if (Array.isArray(errorMsg)) {
      errorMsg = errorMsg[0];
    }
    throw new Error(errorMsg);
  }

  // Normalize backend response to match PaginatedResponse interface
  const normalized: PaginatedResponse<Requirement> = {
    data: result.data || [],
    page: result.pageNumber ?? 0,
    size: result.pageSize ?? size,
    totalElements: result.totalRecords ?? 0,
    totalPages: result.totalPages ?? 1,
    totalRecords: result.totalRecords ?? 0,
  };

  return normalized;
}

export async function updateRequirementStatus(id: string): Promise<void> {
  const response = await fetch(`/api/requirements/update-status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  });

  if (!response.ok) {
    const result = await response.json();
    let errorMsg =
      result?.error || result?.message || "Failed to update requirement status";
    if (Array.isArray(errorMsg)) {
      errorMsg = errorMsg[0];
    }
    throw new Error(errorMsg);
  }
}

export async function rejectRequirement(id: string): Promise<void> {
  const response = await fetch(`/api/requirements/reject`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  });

  if (!response.ok) {
    const result = await response.json();
    let errorMsg =
      result?.error || result?.message || "Failed to update requirement status";
    if (Array.isArray(errorMsg)) {
      errorMsg = errorMsg[0];
    }
    throw new Error(errorMsg);
  }
}

export async function getRequestsByUser(
  session: any,
  page = 0,
  size = 5
): Promise<PaginatedResponse<RequirementDetail>> {
  if (!session) {
    throw new Error("User is not authenticated");
  }

  const response = await fetch(
    `${API_URL}/requirements/user/${session.user.id}/requests?page=${page}&size=${size}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.user.accessToken}`,
      },
    }
  );

  const result = await response.json();
  if (!response.ok) {
    let errorMsg =
      result?.error || result?.message || "Failed to fetch requests";
    if (Array.isArray(errorMsg)) {
      errorMsg = errorMsg[0];
    }
    throw new Error(errorMsg);
  }

  // Normalize backend response to match PaginatedResponse interface
  const normalized: PaginatedResponse<RequirementDetail> = {
    data: result.data || [],
    page: result.pageNumber ?? 0,
    size: result.pageSize ?? size,
    totalElements: result.totalRecords ?? 0,
    totalPages: result.totalPages ?? 1,
    totalRecords: result.totalRecords ?? 0,
  };

  return normalized;
}

export async function updateRequest(
  data: UpdateRequestRoomDto
): Promise<UpdateRequestRoomDto> {
  const response = await fetch("/api/requirements/update", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (!response.ok) {
    // Nếu backend trả về error dạng { error: ..., message: ... }
    let errorMsg =
      result?.error || result?.message || "Failed to create request";
    // Nếu message là mảng, lấy phần tử đầu tiên
    if (Array.isArray(errorMsg)) {
      errorMsg = errorMsg[0];
    }
    throw new Error(errorMsg);
  }
  return result;
}
