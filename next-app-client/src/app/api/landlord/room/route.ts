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

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page")) || 0;
  const size = Number(searchParams.get("size")) || 5;

  const response = await fetch(
    `${API_URL}/rooms/by-landlord/${session.user.id}/paging?page=${page}&size=${size}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
      },
    }
  );

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

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Lấy roomId từ URL parameter
  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get("roomId");

  if (!roomId) {
    return new Response(JSON.stringify({ message: "Room ID is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  console.log("[API PATCH] roomId từ URL parameter:", roomId);

  const formData = await request.formData();

  // Gọi API backend PATCH
  const response = await fetch(`${API_URL}/rooms/${roomId}`, {
    method: "PATCH",
    body: formData,
    headers: {
      Authorization: `Bearer ${session.user.accessToken}`,
    },
  });

  if (!response.ok) {
    let errorJson;
    try {
      errorJson = await response.json();
    } catch {
      errorJson = { message: "Unknown error or empty response from backend" };
    }
    console.error("Backend error:", errorJson);
    return new Response(JSON.stringify(errorJson), {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  let data;
  try {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = { message: "No JSON content returned from backend" };
    }
  } catch {
    data = { message: "No content returned from backend" };
  }
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
