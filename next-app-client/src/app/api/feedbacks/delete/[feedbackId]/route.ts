import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { API_URL } from "@/services/Constant";

export async function DELETE(request: Request, { params }: { params: { feedbackId: string } }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return new Response("Unauthorized", { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const url = new URL(`${API_URL}/rooms/feedbacks/${params.feedbackId}`);
    url.searchParams.append("userId", userId || "");

    const response = await fetch(url.toString(), {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${session.user.accessToken}`,
        },
    });
    const data = await response.json();
    return new Response(JSON.stringify(data), { status: response.status });
}
