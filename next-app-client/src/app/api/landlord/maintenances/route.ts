import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'; 
import { API_URL } from '@/services/Constant'; 

// Đây là URL của backend Spring Boot của bạn
const SPRING_BOOT_API_URL = `${API_URL}/landlord/maintenances`;

// Hàm xử lý yêu cầu GET: Lấy danh sách yêu cầu bảo trì
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return new Response("Unauthorized", { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const page = searchParams.get('page') || '0';
        const size = searchParams.get('size') || '10';
        const status = searchParams.get('status');

        const params = new URLSearchParams();
        params.append('page', page);
        params.append('size', size);
        if (status) {
            params.append('status', status);
        }

        const response = await fetch(`${SPRING_BOOT_API_URL}?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.user.accessToken}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json(errorData, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

// Hàm xử lý yêu cầu POST: Tạo một yêu cầu bảo trì mới
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return new Response("Unauthorized", { status: 401 });
        }

        const body = await request.json();

        const response = await fetch(SPRING_BOOT_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.user.accessToken}`,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json(errorData, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

// Hàm xử lý yêu cầu PATCH: Cập nhật một yêu cầu bảo trì
export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return new Response("Unauthorized", { status: 401 });
        }
        
        const body = await request.json();

        // Đường dẫn PATCH của bạn có ID nằm trong URL
        const response = await fetch(`${SPRING_BOOT_API_URL}/${body.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.user.accessToken}`,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json(errorData, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

// Hàm xử lý yêu cầu DELETE: Xóa một yêu cầu bảo trì
export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return new Response("Unauthorized", { status: 401 });
        }
        
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ message: 'Missing maintenance ID' }, { status: 400 });
        }

        const response = await fetch(`${SPRING_BOOT_API_URL}/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${session.user.accessToken}`,
            },
        });

        if (!response.ok) {
            return NextResponse.json({ message: 'Failed to delete maintenance' }, { status: response.status });
        }

        return NextResponse.json({ message: 'Maintenance deleted successfully' });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
