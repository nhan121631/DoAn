import { authOptions } from "@/lib/auth";
import { API_URL } from "@/services/Constant";
import { getServerSession } from "next-auth";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page")) || 0;
  const size = Number(searchParams.get("size")) || 5;
  const sortField = searchParams.get("sortField");
  const sortOrder = searchParams.get("sortOrder");

  let backendUrl = `${API_URL}/bookings/user/${session.user.id}/paging?page=${page}&size=${size}`;
  if (sortField) {
    backendUrl += `&sortField=${encodeURIComponent(sortField)}`;
  }
  if (sortOrder) {
    backendUrl += `&sortOrder=${encodeURIComponent(sortOrder)}`;
  }

  const response = await fetch(backendUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${session.user.accessToken}`,
    },
  });

  if (!response.ok) {
    const errorJson = await response.json();
    console.error("Backend error:", errorJson);
    return new Response(JSON.stringify(errorJson), {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  const data = await response.json();
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
