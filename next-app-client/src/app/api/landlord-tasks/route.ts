import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { API_URL } from "@/services/Constant";

// POST /api/landlord-tasks
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  try {
    const body = await request.json();
    const url = `${API_URL}/landlord-tasks`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.user.accessToken}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return new Response(JSON.stringify(data), { status: response.status });
  } catch (error) {
    console.error("Error creating landlord task:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}