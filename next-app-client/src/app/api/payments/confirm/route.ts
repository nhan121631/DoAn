/* eslint-disable @typescript-eslint/no-explicit-any */
import { authOptions } from "@/lib/auth";
import { API_URL } from "@/services/Constant";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const session = await getServerSession(authOptions);
  if(!session){
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
  try {
    const res = await fetch(`${API_URL}/payments/confirm?${searchParams.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.user.accessToken}`
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { success: false, message: data.error || "Failed to confirm payment" },
        { status: res.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}