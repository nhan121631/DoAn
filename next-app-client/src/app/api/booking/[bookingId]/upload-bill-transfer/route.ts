import { authOptions } from "@/lib/auth";
import { API_URL } from "@/services/Constant";
import { getServerSession } from "next-auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { bookingId } = await params;

    // Get the form data from the request
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Create FormData for the backend request
    const backendFormData = new FormData();
    backendFormData.append("file", file);

    const response = await fetch(
      `${API_URL}/bookings/${bookingId}/upload-bill-transfer`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.user.accessToken}`,
        },
        body: backendFormData,
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
  } catch (error) {
    console.error("Error uploading bill transfer image:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to upload bill transfer image",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
