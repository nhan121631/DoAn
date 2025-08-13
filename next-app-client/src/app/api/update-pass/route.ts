import { authOptions } from "@/lib/auth";
import { API_URL } from "@/services/Constant";
import { getServerSession } from "next-auth";

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
  }
  // Lấy dữ liệu JSON từ request body
  const body = await request.json();

  const response = await fetch(`${API_URL}/auth/change-password`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.user.accessToken}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorJson = await response.json();
    console.error("Backend error:", errorJson);
    return new Response(JSON.stringify(errorJson), { status: response.status, headers: { "Content-Type": "application/json" } });
  }

  const data = await response.json();
  return new Response(JSON.stringify(data), { status: 200, headers: { "Content-Type": "application/json" } });
}