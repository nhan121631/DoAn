import { authOptions } from "@/lib/auth";
import { API_URL } from "@/services/Constant";
import { getServerSession } from "next-auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ contractId: string; billId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { billId } = await params;

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
      `${API_URL}/bills/${billId}/upload-image-proof`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.user.accessToken}`,
        },
        body: backendFormData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend error:", errorText);

      // Try to parse as JSON, fallback to plain text
      let errorResponse;
      try {
        errorResponse = JSON.parse(errorText);
      } catch {
        errorResponse = { error: errorText || "Upload failed" };
      }

      return new Response(JSON.stringify(errorResponse), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Handle both JSON and plain text responses from backend
    const contentType = response.headers.get("content-type");
    let data;

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      // Backend returns plain string (image URL)
      const imageUrl = await response.text();
      data = { message: "Upload successful", imageUrl };
    }
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error uploading bill image proof:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to upload bill image proof",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
