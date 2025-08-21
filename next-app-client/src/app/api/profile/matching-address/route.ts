import { authOptions } from "@/lib/auth";
import { API_URL } from "@/services/Constant";
import { getServerSession } from "next-auth";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const preferences = await request.json();

  const response = await fetch(
    `${API_URL}/profile/${session.user.id}/preferences`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.user.accessToken}`,
      },
      body: JSON.stringify(preferences),
    }
  );

  if (!response.ok) {
    const errorJson = await response.json();
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

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;
  if (!userId) {
    return new Response("Missing userId", { status: 400 });
  }

  try {
    const url = `${API_URL}/profile/${userId}/preferences`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.user.accessToken}`,
      },
    });

    if (!response.ok) {
      const errorJson = await response.json();
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
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}