import { useFavoriteStore } from "@/stores/FavoriteStore";
import { RoomInUser } from "@/types/types";
import { getSession } from "next-auth/react";
// import { useFavoriteStore } from "@/stores/FavoriteStore";

const isServer = typeof window === 'undefined';

export async function getFavoriteRoomIds(page = 0, pageSize = 6): Promise<string[]> {
  if (isServer) {
    return [];
  }

  const session = await getSession();
  if (!session?.user) {
    return [];
  }

  try {
    const res = await fetch(`/api/user-dashboard/favorited-rooms?page=${page}&size=${pageSize}`);

    if (!res.ok) {
      if (res.status === 401) {
        return [];
      }
      
      const errorText = await res.text();
      console.error(`API Error: Failed to fetch favorites. Status: ${res.status} - ${res.statusText}`);
      console.error("Response body:", errorText);
      return [];
    }

    const data = await res.json();
    
    if (!data || !Array.isArray(data.content)) {
      console.error("Data Validation Error: Invalid data structure received from the favorites API.");
      return [];
    }

    const favoriteIds: string[] = data.content
      .filter((item: RoomInUser | null) => item && typeof item.id === 'string')
      .map((item: RoomInUser) => item.id);

    return favoriteIds;
  } catch (error) {
    console.error("Network or Runtime Error: An error occurred while fetching favorites.");
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error name:", error.name);
    }
    return [];
  }
}

export async function getAllFavoriteIds(): Promise<string[]> {
  if (isServer) {
    return [];
  }
  
  const session = await getSession();
  if (!session?.user) {
    return [];
  }

  try {
    // Lấy trang đầu tiên để biết tổng số trang
    const firstPageRes = await fetch(`/api/user-dashboard/favorited-rooms?page=0&size=100`);
    if (!firstPageRes.ok) {
      if (firstPageRes.status === 401) return [];
      
      // const errorText = await firstPageRes.text();
      console.error(`API Error: Failed to fetch favorites. Status: ${firstPageRes.status} - ${firstPageRes.statusText}`);
      return [];
    }
    
    const firstPageData = await firstPageRes.json();
    if (!firstPageData || !Array.isArray(firstPageData.content)) {
      console.error("Data Validation Error: Invalid data structure received from the favorites API.");
      return [];
    }
    
    // Lấy tổng số trang từ response
    const totalPages = firstPageData.totalPages || 1;
    
    // Khởi tạo mảng với IDs từ trang đầu tiên
    let allFavoriteIds = firstPageData.content
      .filter((item: RoomInUser | null) => item && typeof item.id === 'string')
      .map((item: RoomInUser) => item.id);
    
    // Lặp qua các trang còn lại nếu có
    for (let page = 1; page < totalPages; page++) {
      const res = await fetch(`/api/user-dashboard/favorited-rooms?page=${page}&size=100`);
      if (!res.ok) continue;
      
      const data = await res.json();
      if (!data || !Array.isArray(data.content)) continue;
      
      // Thêm IDs từ trang hiện tại vào mảng kết quả
      const pageIds = data.content
        .filter((item: RoomInUser | null) => item && typeof item.id === 'string')
        .map((item: RoomInUser) => item.id);
      
      allFavoriteIds = [...allFavoriteIds, ...pageIds];
    }
    
    return allFavoriteIds;
  } catch (error) {
    console.error("Failed to fetch all favorite IDs:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error name:", error.name);
    }
    return [];
  }
}

// Cập nhật store từ API (sử dụng trong client components)
export async function fetchAndUpdateFavorites(): Promise<void> {
  // Không chạy trong quá trình build hoặc server-side
  if (isServer) {
    return;
  }
  
  const { setFavoriteRoomIds, setLoading, isLoading } = useFavoriteStore.getState();
  
  if (isLoading) return;
  
  setLoading(true);
  try {
    // Sử dụng hàm mới để lấy tất cả IDs không giới hạn số lượng
    const allFavoriteIds = await getAllFavoriteIds();
    setFavoriteRoomIds(allFavoriteIds);
  } catch (error) {
    console.error("Failed to fetch favorites:", error);
  } finally {
    setLoading(false);
  }
}

// Khởi tạo store nếu chưa được khởi tạo
export async function initializeFavorites(): Promise<void> {
  // Không chạy trong quá trình build
  if (isServer) {
    return;
  }
  
  const { isInitialized } = useFavoriteStore.getState();
  if (!isInitialized) {
    await fetchAndUpdateFavorites();
  }
}

// Thêm phòng vào danh sách yêu thích
export async function addFavorite(roomId: string): Promise<boolean> {
  if (isServer) return false;
  
  const { addFavorite } = useFavoriteStore.getState();
  
  try {
    const res = await fetch(`/api/favorites/rooms/${roomId}`, { method: "POST" });
    if (!res.ok) return false;
    
    addFavorite(roomId);
    return true;
  } catch (error) {
    console.error("Failed to add favorite:", error);
    return false;
  }
}

// Xóa phòng khỏi danh sách yêu thích
export async function removeFavorite(roomId: string): Promise<boolean> {
  if (isServer) return false;
  
  const { removeFavorite } = useFavoriteStore.getState();
  
  try {
    const res = await fetch(`/api/favorites/rooms/${roomId}`, { method: "DELETE" });
    if (!res.ok) return false;
    
    removeFavorite(roomId);
    return true;
  } catch (error) {
    console.error("Failed to remove favorite:", error);
    return false;
  }
}

export async function getFavoriteCount(roomId: string): Promise<number> {
  try {
    const res = await fetch(`/api/favorites/rooms/${roomId}/count`);
    if (!res.ok) return 0;
    const count = await res.json();
    return typeof count === "number" ? count : 0;
  } catch (error) {
    console.error("Failed to fetch favorite count:", error);
    return 0;
  }
}