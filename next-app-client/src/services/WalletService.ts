/* eslint-disable @typescript-eslint/no-explicit-any */
import { API_URL } from "./Constant";

export async function getUserWallet(session: any) {
  if (!session || !session.user) {
    throw new Error("User is not authenticated");
  }

  const response = await fetch(`${API_URL}/wallets/${session.user.id}`, {
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

  if (response.status === 403) {
    return { forbidden: true };
  }
if (!response.ok) {
  let errorMsg = "Failed to fetch user wallet";
  try {
    const error = await response.json();
    errorMsg = Array.isArray(error.message) ? error.message[0]
      : error.message || error.error || errorMsg;
    if (errorMsg === "password cannot be null") {
      // Xử lý riêng, ví dụ: return { passwordNull: true }
      return { passwordNull: true };
    }
  } catch (e) {
    // Nếu không parse được JSON, giữ nguyên errorMsg mặc định
    console.error("Error parsing response:", e);
  }
  throw new Error(errorMsg);
}

  const wallet = await response.json();
  // Nếu backend trả về null (không có ví), cũng trả về null
  if (!wallet) return null;
  return wallet;
}

  