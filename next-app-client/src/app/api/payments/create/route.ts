import { authOptions } from "@/lib/auth";
import { API_URL } from "@/services/Constant";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    console.log("User accessToken:", session.user.accessToken);
    console.log("User ID:", session.user.id);
  try {
    const body = await req.json();

    const res = await fetch(`${API_URL}/payments/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json",
        "Authorization": `Bearer ${session.user.accessToken}`
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data.error || "Failed to create payment" },
        { status: res.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("API /payments/create error:", error);
    return NextResponse.json(
      { error: "Unexpected error", details: (error as Error).message },
      { status: 500 }
    );
  }
}