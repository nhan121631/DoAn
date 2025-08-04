/* eslint-disable @typescript-eslint/no-explicit-any */
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
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
  // Có thể trả về null hoặc throw với message chi tiết từ API
  const error = await response.json();
  throw new Error(error.message?.[0] || error.error || "Failed to fetch user wallet");
}

  const wallet = await response.json();
  return wallet;
}

  