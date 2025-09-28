/* eslint-disable @typescript-eslint/no-explicit-any */
import { authOptions } from "@/lib/auth";
import { API_URL } from "@/services/Constant";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    try {
        const formData = await req.formData();
        // Forward form-data lên backend endpoint mới
        const response = await fetch(`${API_URL}/requirements/request-room-with-image`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${session.user.accessToken}`,
                // Không set Content-Type, để fetch tự set multipart/form-data
            },
            body: formData, // Forward nguyên form-data
        });

        const data = await response.json();
        if (!response.ok) {
            return NextResponse.json({ error: data?.message || "Failed to create requirement" }, { status: response.status });
        }
return NextResponse.json(data, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}