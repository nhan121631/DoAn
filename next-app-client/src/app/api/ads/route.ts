import { API_URL } from "@/services/Constant";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const position = searchParams.get("position");
    // const page = searchParams.get("page") || "0";
    // const size = searchParams.get("size") || "10";
    // const sortBy = searchParams.get("sortBy") || "createdDate";
    // const sortDir = searchParams.get("sortDir") || "desc";
    // const keyword = searchParams.get("keyword");

    let url = `${API_URL}/ads`;

    // Determine which endpoint to call based on parameters
    if (position) {
      url = `${API_URL}/ads/active/${position}`;
    }
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store", // Ensure fresh data for ads
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "no-cache, no-store, max-age=0, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Error fetching ads:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch ads",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const response = await fetch(`${API_URL}/ads`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Backend API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating ads:", error);
    return NextResponse.json(
      {
        error: "Failed to create ads",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
