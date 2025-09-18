/* eslint-disable @typescript-eslint/no-explicit-any */
import { authOptions } from "@/lib/auth";
import { API_URL } from "@/services/Constant";
import { getServerSession } from "next-auth";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const page = url.searchParams.get("page") || "0";
    const size = url.searchParams.get("size") || "5";

    const backendUrl = `${API_URL}/requirements/landlord/${session.user.id}/requests?page=${page}&size=${size}`;

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
      },
    });

    if (!response.ok) {
      const errorJson = await response
        .json()
        .catch(() => ({ message: "Unknown error" }));
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
  } catch (err: any) {
    return new Response(
      JSON.stringify({ message: err?.message || "Server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
