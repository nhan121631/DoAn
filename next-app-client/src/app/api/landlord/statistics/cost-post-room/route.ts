import { authOptions } from "@/lib/auth";
import { API_URL } from "@/services/Constant";
import { getServerSession } from "next-auth";

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return new Response("Unauthorized", { status: 401 });
    }
    
    // Lấy query parameters từ URL
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Tạo query string cho backend
    let queryString = '';
    if (startDate && endDate) {
        queryString = `?startDate=${startDate}&endDate=${endDate}`;
    }
    
    const response = await fetch(
        `${API_URL}/landlord/statistics/fee-post-room-statistics/${session.user.id}${queryString}`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${session.user.accessToken}`,
            },
        }
    );
    
    if (!response.ok) {
        const errorJson = await response.json();
        console.error("Backend error:", errorJson);
        return new Response(JSON.stringify(errorJson), {
            status: response.status,
            headers: { "Content-Type": "application/json" },
        });
    }
    const data = await response.json();
    return new Response(JSON.stringify(data), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
}