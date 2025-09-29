import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { API_URL } from "@/services/Constant";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ contractId: string }> }
) {
  try {
    console.log("=== Upload Image API Called ===");
    
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log("No session found - unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log("Session found, user:", session.user?.username);

    const { contractId } = await params;
    console.log("Contract ID:", contractId);
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    console.log("File received:", file?.name, file?.size);
    
    const apiUrl = `${API_URL}/contracts/${contractId}/image`;
    console.log("Calling Spring Boot API:", apiUrl);
    console.log("API_URL:", API_URL);
    
    const response = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${session.user.accessToken}`,
      },
      body: formData,
    });

    console.log("Spring Boot response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Spring Boot error:", errorText);
      return NextResponse.json(
        { error: errorText || "Failed to upload contract image" },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log("Upload successful:", result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error uploading contract image:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}