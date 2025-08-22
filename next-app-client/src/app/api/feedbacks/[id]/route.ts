import { authOptions } from "@/lib/auth";
import { API_URL } from "@/services/Constant";
import { getServerSession } from "next-auth";

export async function POST(request: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return new Response("Unauthorized", { status: 401 });
    }
    const body = await request.json();
    const response = await fetch(`${API_URL}/rooms/${params.id}/feedbacks`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.user.accessToken}`,
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorJson = await response.json();
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
export async function GET(request: Request, { params }: { params: { id: string } }) {
    const response = await fetch(`${API_URL}/rooms/${params.id}/feedbacks`);
    const data = await response.json();
    return new Response(JSON.stringify(data), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
    });
}
