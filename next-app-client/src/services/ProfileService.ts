/* eslint-disable @typescript-eslint/no-explicit-any */
import { API_URL } from "./Constant";

export async function updateProfile(avatar: File | null, profile: string) {
    const formData = new FormData();
    if (avatar) {
        formData.append("avatar", avatar);
    }
    formData.append("profile", profile);

    const response = await fetch("/api/profile", {
        method: "PATCH",
        body: formData,
    });

    if (!response.ok) {
        throw new Error("Failed to update profile");
    }

    return response.json();
}

export async function getBanks(){
    const response = await fetch("https://api.vietqr.io/v2/banks", {
        method: "GET",
    });

    if (!response.ok) {
        throw new Error("Failed to fetch banks");
    }

    const result = await response.json();
    // API trả về { data: [...] } nên cần lấy ra mảng banks
    return Array.isArray(result.data) ? result.data : [];
}

export async function getUserProfile(session: any) {
  if (!session || !session.user) {
    throw new Error("User is not authenticated");
  }

  const response = await fetch(`${API_URL}/profile/${session?.user?.userProfile?.id}`, {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.user.accessToken}`,
    },
    // Nếu dùng server actions, có thể cần thêm: cache: "no-store"
  });

  if (response.status === 400 || response.status === 404) {
    // Profile not found for user
    return null;
  }
  if (!response.ok) {
    let errorMsg = "Failed to fetch user profile";
    try {
      const error = await response.json();
      errorMsg = Array.isArray(error.message) ? error.message[0]
        : error.message || error.error || errorMsg;
    } catch (e) {
      // Nếu không parse được JSON, giữ nguyên errorMsg mặc định
      console.error("Error parsing response:", e);
    }
    throw new Error(errorMsg);
  }

  const profile = await response.json();
  return profile;
}
  