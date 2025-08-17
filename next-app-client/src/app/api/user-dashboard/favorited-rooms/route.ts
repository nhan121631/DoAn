import { API_URL } from "@/services/Constant";
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/auth';
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") || "0";
  const size = searchParams.get("size") || "10";

  const session = await getServerSession(authOptions);
  const accessToken = session?.user?.accessToken;
if (!accessToken) {
  return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
}

  try {
    const response = await fetch(`${API_URL}/favorites?page=${page}&size=${size}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorJson = await response.json();
      return NextResponse.json(errorJson, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Backend API call failed:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}



// import { NextResponse, NextRequest } from "next/server";
// import { getServerSession } from "next-auth/next";
// import { authOptions } from "@/lib/auth";
// import { API_URL } from "@/services/Constant";

// export async function GET(request: NextRequest) {
//     try {
//         const session = await getServerSession(authOptions);
//         if (!session || !session.user || !session.user.accessToken) {
//             return new Response("Unauthorized", { status: 401 });
//         }
        
//         const { searchParams } = new URL(request.url);
//         const page = searchParams.get('page') || '0';
//         const size = searchParams.get('size') || '10';

//         const params = new URLSearchParams();
//         params.append('page', page);
//         params.append('size', size);

//         const response = await fetch(`${API_URL}/favorites?${params.toString()}`, {
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${session.user.accessToken}`,
//             },
//             cache: 'no-store', // Tắt cache để luôn nhận dữ liệu mới nhất
//         });

//         if (!response.ok) {
//             const errorData = await response.json();
//             return NextResponse.json(errorData, { status: response.status });
//         }

//         const data = await response.json();
//         return NextResponse.json(data);
//     } catch (error) {
//         console.error('API Error:', error);
//         return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
//     }
// }