/* eslint-disable @typescript-eslint/no-unused-vars */
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getAllTransactionsByUserId } from "@/services/PaymentServive";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return new NextResponse(
      JSON.stringify({ status: "fail", message: "You are not logged in" }),
      { status: 401 }
    );
  }

  try {
    // Gọi service, truyền userId và accessToken
    const payments = await getAllTransactionsByUserId(
      session.user.id,
      session.user.accessToken
    );
    return NextResponse.json(payments);
  } catch (error) {
    console.error("Error fetching payment history:", error);
    return new NextResponse(
      JSON.stringify({
        status: "error",
        message: "Failed to fetch payment history",
      }),
      { status: 500 }
    );
  }
}
