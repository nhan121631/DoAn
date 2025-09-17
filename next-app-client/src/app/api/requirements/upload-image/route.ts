import { NextRequest, NextResponse } from 'next/server';
import { API_URL } from '@/services/Constant';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user.accessToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const idRequirement = formData.get('idRequirement') as string;
        const image = formData.get('image') as File;

        if (!idRequirement || !image) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Validate file type
        if (!image.type.startsWith('image/')) {
            return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
        }

        // Validate file size (10MB max)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (image.size > maxSize) {
            return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 });
        }

        // Tạo FormData để gửi đến backend
        const backendFormData = new FormData();
        backendFormData.append('image', image);

        const response = await fetch(`${API_URL}/requirements/${idRequirement}/upload-image`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${session.user.accessToken}`,
            },
            body: backendFormData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json({ error: errorText }, { status: response.status });
        }

        const result = await response.text();
        return NextResponse.json({ message: result });

    } catch (error) {
        console.error('Upload image error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}