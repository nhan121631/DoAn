// // src/services/FavoriteService.ts

// import { RoomInUser } from "@/types/types";


// export async function getFavoriteRoomIds(): Promise<string[]> {
//   const url = "/api/favorites?page=0&size=1000";

//   try {
//     // Gọi đến API trung gian cục bộ của Next.js
//     const res = await fetch(url);

//     if (!res.ok) {
//       const errorText = await res.text();
//       console.error(`API Error: Failed to fetch favorites. Status: ${res.status} - ${res.statusText}`);
//       console.error("Response body:", errorText);
//       return [];
//     }

//     const data = await res.json();
    
//     if (!data || !Array.isArray(data.content)) {
//         console.error("Data Validation Error: Invalid data structure received from the favorites API.");
//         return [];
//     }

//     const favoriteIds: string[] = data.content
//       .filter((item: RoomInUser | null) => item && typeof item.id === 'string')
//       .map((item: RoomInUser) => item.id);

//     return favoriteIds;

//   } catch (error) {
//     console.error("Network or Runtime Error: An error occurred while fetching favorites.");
//     if (error instanceof Error) {
//       console.error("Error message:", error.message);
//       console.error("Error name:", error.name);
//     }
//     return [];
//   }
// }


///----------ok//..........
import { useFavoriteStore } from "@/app/stores/favoriteStore";
import { RoomInUser } from "@/types/types";
import { getSession } from "next-auth/react";

// Lấy danh sách ID phòng yêu thích
export async function getFavoriteRoomIds(): Promise<string[]> {
  // Kiểm tra session trước khi gọi API
  if (typeof window !== 'undefined') {
    const session = await getSession();
    // Nếu chưa đăng nhập, không gọi API và trả về mảng rỗng
    if (!session?.user) {
      return [];
    }
  }

  try {
    // Gọi đến API trung gian cục bộ của Next.js
    const res = await fetch("/api/user-dashboard/favorited-rooms?page=0&size=1000");

    if (!res.ok) {
      // Nếu lỗi 401, xử lý nhẹ nhàng hơn (không log lỗi)
      if (res.status === 401) {
        return [];
      }
      
      // Các lỗi khác vẫn log ra
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

// import { useFavoriteStore } from "@/app/stores/favoriteStore";
// import { RoomInUser } from "@/types/types";

// // Lấy danh sách ID phòng yêu thích
// export async function getFavoriteRoomIds(): Promise<string[]> {
//   try {
//     // Gọi đến API trung gian cục bộ của Next.js
//     const res = await fetch("/api/user-dashboard/favorited-rooms?page=0&size=1000");

//     if (!res.ok) {
//       const errorText = await res.text();
//       console.error(`API Error: Failed to fetch favorites. Status: ${res.status} - ${res.statusText}`);
//       console.error("Response body:", errorText);
//       return [];
//     }

//     const data = await res.json();
    
//     if (!data || !Array.isArray(data.content)) {
//       console.error("Data Validation Error: Invalid data structure received from the favorites API.");
//       return [];
//     }

//     const favoriteIds: string[] = data.content
//       .filter((item: RoomInUser | null) => item && typeof item.id === 'string')
//       .map((item: RoomInUser) => item.id);

//     return favoriteIds;
//   } catch (error) {
//     console.error("Network or Runtime Error: An error occurred while fetching favorites.");
//     if (error instanceof Error) {
//       console.error("Error message:", error.message);
//       console.error("Error name:", error.name);
//     }
//     return [];
//   }
// }

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
//----------ok//..........

// import { useFavoriteStore } from "@/app/stores/favoriteStore";
// import { RoomInUser } from "@/types/types";
// import { getSession } from "next-auth/react";

// // Lấy danh sách ID phòng yêu thích
// export async function getFavoriteRoomIds(): Promise<string[]> {
//   // QUAN TRỌNG: Không gọi API trong quá trình build
//   if (typeof window === 'undefined') {
//     return [];
//   }

//   try {
//     // Kiểm tra session trước khi gọi API
//     const session = await getSession();
//     // Nếu chưa đăng nhập, không gọi API và trả về mảng rỗng
//     if (!session?.user) {
//       return [];
//     }
    
//     // Gọi đến API trung gian cục bộ của Next.js
//     const res = await fetch("/api/user-dashboard/favorited-rooms?page=0&size=1000");

//     if (!res.ok) {
//       // Nếu lỗi 401, xử lý nhẹ nhàng hơn (không log lỗi)
//       if (res.status === 401) {
//         return [];
//       }
      
//       // Các lỗi khác vẫn log ra
//       const errorText = await res.text();
//       console.error(`API Error: Failed to fetch favorites. Status: ${res.status} - ${res.statusText}`);
//       console.error("Response body:", errorText);
//       return [];
//     }

//     const data = await res.json();
    
//     if (!data || !Array.isArray(data.content)) {
//       console.error("Data Validation Error: Invalid data structure received from the favorites API.");
//       return [];
//     }

//     const favoriteIds: string[] = data.content
//       .filter((item: RoomInUser | null) => item && typeof item.id === 'string')
//       .map((item: RoomInUser) => item.id);

//     return favoriteIds;
//   } catch (error) {
//     console.error("Network or Runtime Error: An error occurred while fetching favorites.");
//     if (error instanceof Error) {
//       console.error("Error message:", error.message);
//       console.error("Error name:", error.name);
//     }
//     return [];
//   }
// }

// // Cập nhật store từ API (sử dụng trong client components)
// export async function fetchAndUpdateFavorites(): Promise<void> {
//   // QUAN TRỌNG: Không chạy trong quá trình build
//   if (typeof window === 'undefined') {
//     return;
//   }
  
//   const { setFavoriteRoomIds, setLoading, isLoading } = useFavoriteStore.getState();
  
//   if (isLoading) return;
  
//   setLoading(true);
//   try {
//     const favoriteIds = await getFavoriteRoomIds();
//     setFavoriteRoomIds(favoriteIds);
//   } catch (error) {
//     console.error("Failed to fetch favorites:", error);
//   } finally {
//     setLoading(false);
//   }
// }

// // Khởi tạo store nếu chưa được khởi tạo
// export async function initializeFavorites(): Promise<void> {
//   // QUAN TRỌNG: Không chạy trong quá trình build
//   if (typeof window === 'undefined') {
//     return;
//   }
  
//   const { isInitialized } = useFavoriteStore.getState();
//   if (!isInitialized) {
//     await fetchAndUpdateFavorites();
//   }
// }