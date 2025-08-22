import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { API_URL } from "@/services/Constant";

export async function POST(request: Request, { params }: { params: { feedbackId: string } }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return new Response("Unauthorized", { status: 401 });
    }
    const body = await request.json();
    const url = new URL(`${API_URL}/rooms/feedbacks/${params.feedbackId}/reply`);
    url.searchParams.append("landlordId", body.landlordId);

    const response = await fetch(url.toString(), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.user.accessToken}`,
        },
        body: JSON.stringify({ reply: body.reply }),
    });
    const data = await response.json();
    return new Response(JSON.stringify(data), { status: response.status });
}
