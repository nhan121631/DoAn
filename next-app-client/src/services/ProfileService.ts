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

  if (response.status === 400) {
    // Wallet not found for user
    return null;
  }
if (!response.ok) {
  // Có thể trả về null hoặc throw với message chi tiết từ API
  const error = await response.json();
  throw new Error(error.message?.[0] || error.error || "Failed to fetch user profile");
}

  const profile = await response.json();
  return profile;
}

  