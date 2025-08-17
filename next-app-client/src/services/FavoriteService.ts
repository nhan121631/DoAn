import { useFavoriteStore } from "@/stores/favoriteStore";
import { RoomInUser } from "@/types/types";
import { getSession } from "next-auth/react";

export async function getFavoriteRoomIds(page = 0, pageSize = 1000): Promise<string[]> {
  if (typeof window !== 'undefined') {
    const session = await getSession();
    if (!session?.user) {
      return [];
    }
  }

  try {
    // const res = await fetch("/api/user-dashboard/favorited-rooms?page=0&size=1000");
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

// Cập nhật store từ API (sử dụng trong client components)
export async function fetchAndUpdateFavorites(): Promise<void> {
  // Không chạy trong quá trình build
  if (typeof window === 'undefined') {
    return;
  }
  
  const { setFavoriteRoomIds, setLoading, isLoading } = useFavoriteStore.getState();
  
  if (isLoading) return;
  
  setLoading(true);
  try {
    const favoriteIds = await getFavoriteRoomIds();
    setFavoriteRoomIds(favoriteIds);
  } catch (error) {
    console.error("Failed to fetch favorites:", error);
  } finally {
    setLoading(false);
  }
}

// Khởi tạo store nếu chưa được khởi tạo
export async function initializeFavorites(): Promise<void> {
  const { isInitialized } = useFavoriteStore.getState();
  if (!isInitialized) {
    await fetchAndUpdateFavorites();
  }
}
