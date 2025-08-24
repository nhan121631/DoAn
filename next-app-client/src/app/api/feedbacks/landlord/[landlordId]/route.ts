import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { API_URL } from "@/services/Constant";

export async function GET(request: Request, { params }: { params: Promise<{ landlordId: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return new Response("Unauthorized", { status: 401 });
    }
    const resolvedParams = await params;
    const response = await fetch(`${API_URL}/rooms/landlords/${resolvedParams.landlordId}/feedbacks`, {
        headers: {
            "Authorization": `Bearer ${session.user.accessToken}`,
        },
    });
    const data = await response.json();
    return new Response(JSON.stringify(data), { status: response.status });
}
