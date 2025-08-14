import { authOptions } from '@/lib/auth';
import { API_URL } from '@/services/Constant';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function GET() {
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
