/* eslint-disable @typescript-eslint/no-explicit-any */
import { API_URL } from "./Constant";
import { UserSearchPreferences } from "../types/types";

export async function getFullName(id: string) {
  const response = await fetch(`/api/profile/getname/${id}`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch full name");
  }


  const data = await response.json();
  return data;
}

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

export async function getBanks() {
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

  const response = await fetch(
    `${API_URL}/profile/${session?.user?.userProfile?.id}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.user.accessToken}`,
      },
      // Nếu dùng server actions, có thể cần thêm: cache: "no-store"
    }
  );

  if (response.status === 400 || response.status === 404) {
    // Profile not found for user
    return null;
  }
  if (!response.ok) {
    let errorMsg = "Failed to fetch user profile";
    try {
      const error = await response.json();
      errorMsg = Array.isArray(error.message)
        ? error.message[0]
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

export async function updatePreferences(
  userId: string,
  preferences: any,
  session: any
) {
  if (!session || !session.user) {
    throw new Error("User is not authenticated");
  }

  const response = await fetch(`/api/profile/matching-address`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId, ...preferences }),
  });

  if (!response.ok) {
    let errorMsg = "Failed to update preferences";
    try {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const error = await response.json();
        errorMsg = Array.isArray(error.message)
          ? error.message[0]
          : error.message || error.error || errorMsg;
        console.error("API error (json):", error);
      } else {
        const text = await response.text();
        errorMsg = text || errorMsg;
        console.error("API error (text):", text);
      }
    } catch (e) {
      console.error("Error parsing response:", e);
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export async function getUserPreferences() {
  const url = `/api/profile/matching-address`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    let errorMsg = "Failed to fetch user preferences";
    try {
      const error = await response.json();
      errorMsg = Array.isArray(error.message)
        ? error.message[0]
        : error.message || error.error || errorMsg;
      console.error("API error:", error);
    } catch (e) {
      console.error("Error parsing response:", e);
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export async function updateUserSearchPreferences(
  userId: string,
  preferences: UserSearchPreferences,
  session: any
) {
  if (!session || !session.user) {
    throw new Error("User is not authenticated");
  }

  const response = await fetch(`${API_URL}/profile/${userId}/preferences`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.user.accessToken}`,
    },
    body: JSON.stringify(preferences),
  });

  if (!response.ok) {
    let errorMsg = "Failed to update search preferences";
    try {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const error = await response.json();
        errorMsg = Array.isArray(error.message)
          ? error.message[0]
          : error.message || error.error || errorMsg;
        console.error("API error (json):", error);
      } else {
        const text = await response.text();
        errorMsg = text || errorMsg;
        console.error("API error (text):", text);
      }
    } catch (e) {
      console.error("Error parsing response:", e);
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

//------is have a bank ------//

export async function isHaveBankAccount() {
  const response = await fetch(`/api/profile/ishavebank`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    let errorMsg = "Failed to check bank account existence";
    try {
      const error = await response.json();
      errorMsg = Array.isArray(error.message)
        ? error.message[0]
        : error.message || error.error || errorMsg;
      console.error("API error:", error);
    } catch (e) {
      console.error("Error parsing response:", e);
    }
    throw new Error(errorMsg);
  }
  return response.json();
}

export async function setEmailNotifications(enabled: boolean) {
  const response = await fetch(`/api/profile/email-notifications`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ enabled }),
  });
  if (!response.ok) {
    let errorMsg = "Failed to update email notifications";
    try {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const error = await response.json();
        errorMsg = Array.isArray(error.message)
          ? error.message[0]
          : error.message || error.error || errorMsg;
        console.error("API error (json):", error);
      } else {
        const text = await response.text();
        errorMsg = text || errorMsg;
        console.error("API error (text):", text);
      }
    } catch (e) {
      console.error("Error parsing response:", e);
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export async function getEmailNotifications(userId: string) {
  const response = await fetch(
    `/api/profile/email-notifications?userId=${userId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  if (!response.ok) {
    let errorMsg = "Failed to fetch email notifications";
    try {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const error = await response.json();
        errorMsg = Array.isArray(error.message)
          ? error.message[0]
          : error.message || error.error || errorMsg;
        console.error("API error (json):", error);
      } else {
        const text = await response.text();
        errorMsg = text || errorMsg;
        console.error("API error (text):", text);
      }
    } catch (e) {
      console.error("Error parsing response:", e);
    }
    throw new Error(errorMsg);
  }

  // Backend returns JSON object with emailNotifications field
  const data = await response.json();
  console.log("getEmailNotifications - Raw response data:", data);
  const raw = data?.emailNotifications;
  console.log("getEmailNotifications - emailNotifications value:", raw);
  console.log(
    "getEmailNotifications - type of emailNotifications:",
    typeof raw
  );

  // Normalize various backend representations: boolean, number (1/0), string
  let emailNotifications = false;
  if (typeof raw === "boolean") {
    emailNotifications = raw;
  } else if (typeof raw === "number") {
    emailNotifications = raw === 1;
  } else if (typeof raw === "string") {
    const normalized = raw.trim().toLowerCase();
    emailNotifications =
      normalized === "1" ||
      normalized === "true" ||
      normalized === "yes" ||
      normalized === "on";
  } else if (raw == null) {
    emailNotifications = false;
  } else {
    // Fallback: convert truthy values to boolean but be careful with strings like "0"
    emailNotifications = Boolean(raw);
  }

  console.log(
    "getEmailNotifications - Converted to boolean:",
    emailNotifications
  );

  return { emailNotifications };
}
