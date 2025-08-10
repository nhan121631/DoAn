import {
  PaginatedResponse,
  Maintenance,
  CreateMaintenanceFormValues,
  UpdateMaintenanceFormValues,
  Room,
  RequestStatus,
} from '@/types/types';

// Hàm lấy danh sách các yêu cầu bảo trì có phân trang
export async function getMaintenances(
  page: number,
  size: number,
  status: RequestStatus | null,
): Promise<PaginatedResponse<Maintenance>> {
  try {
    const statusParam = status !== null ? `&status=${status}` : '';
    const response = await fetch(`/api/landlord/maintenances?page=${page}&size=${size}${statusParam}`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to fetch maintenances');
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching maintenances:", error);
    throw error;
  }
}

// Hàm lấy danh sách các phòng có sẵn 
export async function getAvailableRooms(): Promise<Room[]> {
  try {
    const response = await fetch(`/api/landlord/maintenances/rooms`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to fetch rooms');
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching rooms:", error);
    throw error;
  }
}

// Hàm tạo một yêu cầu bảo trì mới
export async function createMaintenance(
  newMaintenance: CreateMaintenanceFormValues,
): Promise<Maintenance> {
  const response = await fetch(`/api/landlord/maintenances`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newMaintenance),
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || 'Failed to create maintenance');
  }
  return response.json();
}

// Hàm cập nhật một yêu cầu bảo trì hiện có 
export async function updateMaintenance(
  id: string,
  updatedData: UpdateMaintenanceFormValues,
): Promise<Maintenance> {
  const response = await fetch(`/api/landlord/maintenances`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id, ...updatedData }),
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || 'Failed to update maintenance');
  }
  return response.json();
}



// Hàm xóa một yêu cầu bảo trì 
export async function deleteMaintenance(id: string): Promise<void> {
  const response = await fetch(`/api/landlord/maintenances?id=${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete maintenance');
  }
}
