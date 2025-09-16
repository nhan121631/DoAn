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

  const response = await fetch(
    `${API_URL}/bookings/landlord/${session.user.id}/paging?page=${page}&size=${size}`,
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
  const { searchParams } = new URL(request.url);
  const bookingId = searchParams.get("bookingId");
  if (!bookingId) {
    return new Response("Missing bookingId", { status: 400 });
  }
  const userId = session.user.id;
  if (!userId) {
    return new Response("Missing userId", { status: 400 });
  }

  // Log incoming values for debugging (temporary)
  console.log(
    "[api/booking/landlord] delete request for bookingId:",
    bookingId,
    "userId:",
    userId
  );

  const response = await fetch(
    `${API_URL}/bookings/${encodeURIComponent(
      bookingId
    )}/delete?userId=${encodeURIComponent(String(userId))}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text().catch(() => "<no response body>");
    console.error(
      "[api/booking/landlord] backend error",
      response.status,
      errorText
    );
    // Return backend message to client for easier debugging
    return new Response(errorText, { status: response.status });
  }

  const data = await response.text();
  return new Response(data, { status: 200 });
}
