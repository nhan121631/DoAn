// // Sử dụng Server-side code để bảo mật token
// import { API_URL } from "@/services/Constant";
// import { getServerSession } from "next-auth/next";
// import {  authOptions } from "@/app/api/auth/[...nextauth]/route";
// import { NextResponse } from "next/server";

// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const page = searchParams.get("page") || "0";
//   const size = searchParams.get("size") || "10";

//   // Lấy token từ session
//   const session = await getServerSession(authOptions);

//   if (!session || !session.accessToken) {
//     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//   }

//   try {
//     const response = await fetch(`${API_URL}/favorites?page=${page}&size=${size}`, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         // Gửi Authorization header với token
//         "Authorization": `Bearer ${session.accessToken}`,
//       },
//       // Sử dụng cache: 'no-store' để đảm bảo dữ liệu luôn mới
//       cache: 'no-store',
//     });

//     if (!response.ok) {
//       const errorJson = await response.json();
//       return NextResponse.json(errorJson, { status: response.status });
//     }

//     const data = await response.json();
//     return NextResponse.json(data, { status: 200 });
//   } catch (error) {
//     console.error("Backend API call failed:", error);
//     return NextResponse.json({ message: "Internal server error" }, { status: 500 });
//   }
// }