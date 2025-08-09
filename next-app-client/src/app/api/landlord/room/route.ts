import { authOptions } from "@/lib/auth";
import { API_URL } from "@/services/Constant";
import { getServerSession } from "next-auth";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const formData = await request.formData();

  //use current user ID from session
  const roomRaw = formData.get("room");
  if (typeof roomRaw !== "string") {
    return new Response("Invalid room data", { status: 400 });
  }
  const room = JSON.parse(roomRaw);
  room.userId = session.user.id;
  formData.set("room", JSON.stringify(room));

  // call backend API to create room
  const response = await fetch(`${API_URL}/rooms`, {
    method: "POST",
    body: formData,
    headers: {
      "Authorization": `Bearer ${session.user.accessToken}`,
    },
  });

  if (!response.ok) {
    const errorJson = await response.json();
    console.error("Backend error:", errorJson);
    return new Response(JSON.stringify(errorJson), { status: response.status, headers: { "Content-Type": "application/json" } });
  }

  const data = await response.json();
  return new Response(JSON.stringify(data), { status: 200, headers: { "Content-Type": "application/json" } });
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page")) || 0;
  const size = Number(searchParams.get("size")) || 5;

  const response = await fetch(`${API_URL}/rooms/by-landlord/${session.user.id}/paging?page=${page}&size=${size}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${session.user.accessToken}`,
    },
  });

  if (!response.ok) {
    const errorJson = await response.json();
    console.error("Backend error:", errorJson);
    return new Response(JSON.stringify(errorJson), { status: response.status, headers: { "Content-Type": "application/json" } });
  }

  const data = await response.json();
  return new Response(JSON.stringify(data), { status: 200, headers: { "Content-Type": "application/json" } });
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await request.json();

  const response = await fetch(`${API_URL}/rooms/update-post-extend`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${session.user.accessToken}`,
      "Content-Type": "application/json",
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
