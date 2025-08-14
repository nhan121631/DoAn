import { authOptions } from "@/lib/auth";
import { API_URL } from "@/services/Constant";
import { getServerSession } from "next-auth";

//create a new booking
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const body = await request.json();
    console.log("Booking request body:", body);
    console.log("User ID:", session.user.id);
    console.log("API URL:", `${API_URL}/bookings/user/${session.user.id}`);

    const response = await fetch(
      `${API_URL}/bookings/user/${session.user.id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.user.accessToken}`,
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend error:", errorText);
      console.error("Response status:", response.status);

      try {
        const errorJson = JSON.parse(errorText);
        return new Response(
          JSON.stringify({
            message: errorJson.message || "Failed to create booking",
            details: errorText,
          }),
          {
            status: response.status,
            headers: { "Content-Type": "application/json" },
          }
        );
      } catch {
        return new Response(
          JSON.stringify({
            message: "Failed to create booking",
            details: errorText,
          }),
          {
            status: response.status,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    const booking = await response.json();
    return new Response(JSON.stringify(booking), { status: 201 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({
        message: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const bookingId = searchParams.get("bookingId");

  const body = await request.json();

  const requestBody = {
    ...body,
    actorId: session.user.id,
    actorRole: session.user.roles[0],
  };

  const response = await fetch(`${API_URL}/bookings/${bookingId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.user.accessToken}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    return new Response("Failed to update booking", { status: 500 });
  }

  const booking = await response.json();
  return new Response(JSON.stringify(booking), { status: 200 });
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const bookingId = searchParams.get("bookingId");
  const action = searchParams.get("action");

  // Nếu action là "landlord-payment-info"
  if (action === "landlord-payment-info" && bookingId) {
    const response = await fetch(
      `${API_URL}/bookings/${bookingId}/landlord-payment-info`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.user.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      return new Response("Failed to get landlord payment info", {
        status: 500,
      });
    }

    const paymentInfo = await response.json();
    return new Response(JSON.stringify(paymentInfo), { status: 200 });
  }

  return new Response("Invalid request parameters", { status: 400 });
}
