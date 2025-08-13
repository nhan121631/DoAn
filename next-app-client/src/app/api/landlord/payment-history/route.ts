/* eslint-disable @typescript-eslint/no-unused-vars */
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { API_URL } from "@/services/Constant";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return new NextResponse(
      JSON.stringify({ status: "fail", message: "You are not logged in" }),
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page")) || 0;
  const size = Number(searchParams.get("size")) || 5;

  try {
    const backendRes = await fetch(
      `${API_URL}/transactions/by-user/${session.user.id}/paging?page=${page}&size=${size}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.user.accessToken}`,
        },
      }
    );
    const result = await backendRes.json();
    return NextResponse.json(result);
  } catch (error) {
    return new NextResponse(
      JSON.stringify({
        status: "error",
        message: "Failed to fetch payment history",
      }),
      { status: 500 }
    );
  }
}

// export async function GET() {
//   const session = await getServerSession(authOptions);

//   if (!session || !session.user) {
//     return new NextResponse(
//       JSON.stringify({ status: "fail", message: "You are not logged in" }),
//       { status: 401 }
//     );
//   }

//   try {
//     // Gọi service, truyền userId và accessToken
//     const payments = await getAllTransactionsByUserId(
//       session.user.id,
//       session.user.accessToken
//     );
//     return NextResponse.json(payments);
//   } catch (error) {
//     console.error("Error fetching payment history:", error);
//     return new NextResponse(
//       JSON.stringify({
//         status: "error",
//         message: "Failed to fetch payment history",
//       }),
//       { status: 500 }
//     );
//   }
// }
