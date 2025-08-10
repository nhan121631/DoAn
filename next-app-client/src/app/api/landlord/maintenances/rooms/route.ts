import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'; 
import { API_URL } from '@/services/Constant'; 

// Xử lý yêu cầu GET để lấy danh sách phòng
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return new Response("Unauthorized", { status: 401 });
        }

        const response = await fetch(`${API_URL}/landlord/maintenances/rooms`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${session.user.accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            // Xử lý lỗi từ backend một cách an toàn và trả về JSON
            const errorData = await response.json();
            return NextResponse.json(errorData, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        // Ghi lại lỗi để dễ dàng debug và trả về lỗi 500
        console.error('API Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
