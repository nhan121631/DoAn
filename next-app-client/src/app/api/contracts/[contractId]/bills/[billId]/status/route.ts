import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { API_URL } from "@/services/Constant";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest, 
  { params }: { params: Promise<{ contractId: string; billId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    const { contractId, billId } = await params;
    // Gọi API backend để update bill status
    const res = await fetch(`${API_URL}/bills/${billId}/status?status=${status}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.user.accessToken}`,
      },
    });

    const data = await res.json();
    
    if (!res.ok) {
      return NextResponse.json(
        { error: data.message || "Update bill status failed" }, 
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating bill status:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}
