/* eslint-disable @typescript-eslint/no-explicit-any */
import { authOptions } from "@/lib/auth";
import { API_URL } from "@/services/Constant";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const request = await req.json();
        console.log("Request body:", request);

        const response = await fetch(`${API_URL}/requirements/update`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.user.accessToken}`,
            },
            body: JSON.stringify(request),
        });
        let data;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            data = await response.text();
        }
        if (!response.ok) {
            // Nếu backend trả về lỗi dạng text hoặc json
            return NextResponse.json({ error: (typeof data === 'string' ? data : data?.message) || "Failed to create requirement" }, { status: response.status });
        }
        // Luôn trả về JSON cho client
        return NextResponse.json(
            typeof data === 'string' ? { message: data } : data,
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}