import { NextRequest, NextResponse } from "next/server";
import { API_URL } from "@/services/Constant";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("[Reports API Route] 📥 Received report data:", {
      reason: body.reason,
      contactName: body.contactName,
      contactPhone: body.contactPhone?.slice(0, 3) + "***", // mask phone for logging
      postUrl: body.postUrl,
      hasDescription: !!body.description,
      description: body.description
        ? body.description.slice(0, 50) + "..."
        : undefined,
    });

    console.log(
      "[Reports API Route] 🔗 Calling Spring Boot at:",
      `${API_URL}/reports/submit`
    );

    const response = await fetch(`${API_URL}/reports/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reason: body.reason,
        description: body.description,
        contactName: body.contactName,
        contactPhone: body.contactPhone,
        postUrl: body.postUrl,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("[Reports API Route] ✅ Backend response successful:", data);
      return NextResponse.json({
        success: true,
        message: "Report submitted successfully",
        data: data,
      });
    } else {
      console.error("[Reports API Route] ❌ Backend error:", data);
      return NextResponse.json(
        {
          success: false,
          message: data.message || "Failed to submit report",
          error: data,
        },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error("[Reports API Route] ❌ Error:", error);
    console.error("[Reports API Route] ❌ Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      type: typeof error,
      name: error instanceof Error ? error.name : undefined,
      cause: error instanceof Error ? error.cause : undefined,
    });
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
