// // import { NextResponse } from "next/server";
// import { NextResponse, NextRequest } from "next/server";
// import { getServerSession } from "next-auth/next";
// import { authOptions } from "@/lib/auth";
// import { API_URL } from "@/services/Constant";


// // export async function POST(request: Request, { params }: { params: { roomId: string } }) {
// //   const session = await getServerSession(authOptions);
// //   const accessToken = session?.user?.accessToken;
// //   if (!accessToken) {
// //     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
// //   }

// //   try {
// //     const response = await fetch(`${API_URL}/favorites/rooms/${params.roomId}`, {
// //       method: "POST",
// //       headers: {
// //         "Content-Type": "application/json",
// //         "Authorization": `Bearer ${accessToken}`,
// //       },
// //     });
// //     // const data = await response.json();
// //     return NextResponse.json({}, { status: response.status });
// //   } catch (error) {
// //     console.error(error);
// //     return NextResponse.json({ message: "Internal server error" }, { status: 500 });
// //   }
// // }

// // export async function DELETE(request: Request, { params }: { params: { roomId: string } }) {
// //   const session = await getServerSession(authOptions);
// //   const accessToken = session?.user?.accessToken;
// //   if (!accessToken) {
// //     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
// //   }

// //   try {
// //     const response = await fetch(`${API_URL}/favorites/rooms/${params.roomId}`, {
// //       method: "DELETE",
// //       headers: {
// //         "Content-Type": "application/json",
// //         "Authorization": `Bearer ${accessToken}`,
// //       },
// //     });
// //     // const data = await response.json();
// //     return NextResponse.json({}, { status: response.status });
// //   } catch (error) {
// //     console.error(error);
// //     return NextResponse.json({ message: "Internal server error" }, { status: 500 });
// //   }
// // }

// // export async function POST(request: Request, context: { params: { roomId: string } }) {
// export async function POST(request: NextRequest, context: { params: { roomId: string } }) {

//   const session = await getServerSession(authOptions);
//   const accessToken = session?.user?.accessToken;
//   if (!accessToken) {
//     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//   }

//   try {
//     const response = await fetch(`${API_URL}/favorites/rooms/${context.params.roomId}`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${accessToken}`,
//       },
//     });
//     return NextResponse.json({}, { status: response.status });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json({ message: "Internal server error" }, { status: 500 });
//   }
// }

// // export async function DELETE(request: Request, context: { params: { roomId: string } }) {
// export async function DELETE(request: NextRequest, context: { params: { roomId: string } }) {

//   const session = await getServerSession(authOptions);
//   const accessToken = session?.user?.accessToken;
//   if (!accessToken) {
//     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//   }

//   try {
//     const response = await fetch(`${API_URL}/favorites/rooms/${context.params.roomId}`, {
//       method: "DELETE",
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${accessToken}`,
//       },
//     });
//     return NextResponse.json({}, { status: response.status });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json({ message: "Internal server error" }, { status: 500 });
//   }
// }



// import { NextResponse, NextRequest } from "next/server";
// import { getServerSession } from "next-auth/next";
// import { authOptions } from "@/lib/auth";
// import { API_URL } from "@/services/Constant";

// // Route để thêm một phòng yêu thích (POST)
// export async function POST(request: NextRequest) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session || !session.user || !session.user.accessToken) {
//       return new Response("Unauthorized", { status: 401 });
//     }

//     const { searchParams } = new URL(request.url);
//     const roomId = searchParams.get("roomId");

//     if (!roomId) {
//       return NextResponse.json(
//         { message: "Missing roomId parameter" },
//         { status: 400 }
//       );
//     }

//     const response = await fetch(`${API_URL}/favorites/rooms/${roomId}`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${session.user.accessToken}`,
//       },
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       return NextResponse.json(errorData, { status: response.status });
//     }

//     return NextResponse.json(
//       { message: "Favorite room added successfully" },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("API Error:", error);
//     return NextResponse.json(
//       { message: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }

// // Route để xóa một phòng yêu thích (DELETE)
// export async function DELETE(request: NextRequest) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session || !session.user || !session.user.accessToken) {
//       return new Response("Unauthorized", { status: 401 });
//     }

//     const { searchParams } = new URL(request.url);
//     const roomId = searchParams.get("roomId");

//     if (!roomId) {
//       return NextResponse.json(
//         { message: "Missing roomId parameter" },
//         { status: 400 }
//       );
//     }

//     const response = await fetch(`${API_URL}/favorites/rooms/${roomId}`, {
//       method: "DELETE",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${session.user.accessToken}`,
//       },
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       return NextResponse.json(errorData, { status: response.status });
//     }

//     return NextResponse.json(
//       { message: "Favorite room deleted successfully" },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("API Error:", error);
//     return NextResponse.json(
//       { message: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }



import { NextResponse, type NextRequest } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { API_URL } from "@/services/Constant"

// Route để thêm một phòng yêu thích (POST)
export async function POST(request: NextRequest, { params }: { params: Promise<{ roomId: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user || !session.user.accessToken) {
      return new Response("Unauthorized", { status: 401 })
    }

    const { roomId } = await params

    if (!roomId) {
      return NextResponse.json({ message: "Missing roomId parameter" }, { status: 400 })
    }

    const response = await fetch(`${API_URL}/favorites/rooms/${roomId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.user.accessToken}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(errorData, { status: response.status })
    }

    return NextResponse.json({ message: "Favorite room added successfully" }, { status: 200 })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
  }
}

// Route để xóa một phòng yêu thích (DELETE)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ roomId: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user || !session.user.accessToken) {
      return new Response("Unauthorized", { status: 401 })
    }

    const { roomId } = await params

    if (!roomId) {
      return NextResponse.json({ message: "Missing roomId parameter" }, { status: 400 })
    }

    const response = await fetch(`${API_URL}/favorites/rooms/${roomId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.user.accessToken}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(errorData, { status: response.status })
    }

    return NextResponse.json({ message: "Favorite room deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
  }
}
