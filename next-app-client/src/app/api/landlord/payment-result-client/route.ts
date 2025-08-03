import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { createTransactionByUserId } from "@/services/PaymentServive";

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

    // Gọi service để tạo transaction
    const result = await createTransactionByUserId(userId, body, accessToken);

    return NextResponse.json(result);
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
