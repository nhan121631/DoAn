import { authOptions } from "@/lib/auth";
import { getTransactionsByUserIdPaginated } from "@/services/PaymentServive";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return new NextResponse(
      JSON.stringify({ status: "fail", message: "You are not logged in" }),
      { status: 401 }
    );
  }

  // Lấy page và size từ query string
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page")) || 0;
  const size = Number(searchParams.get("size")) || 5;

  try {
    const result = await getTransactionsByUserIdPaginated(
      session.user.id,
      session.user.accessToken,
      page,
      size
    );
    return NextResponse.json(result);
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
