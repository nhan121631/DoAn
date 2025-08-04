import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

// POST: Tạo transaction mới cho user
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return new NextResponse(
      JSON.stringify({ status: "fail", message: "You are not logged in" }),
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const userId = session.user.id;
    const accessToken = session.user.accessToken;

    // Gọi trực tiếp backend
    const backendRes = await fetch(
      `http://localhost:3333/api/transactions/${userId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ userId, ...body }),
      }
    );
    if (!backendRes.ok) {
      throw new Error("Failed to create transaction");
    }
    const result = await backendRes.json();
    return NextResponse.json(result.transaction || result);
  } catch (error) {
    console.error("Error creating transaction:", error);
    return new NextResponse(
      JSON.stringify({
        status: "error",
        message: "Failed to create transaction",
      }),
      { status: 500 }
    );
  }
}
