import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { API_URL } from "@/services/Constant";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
    const resolvedParams = await params;
    if (!resolvedParams?.roomId) {
        return new Response("roomId is missing", { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session) {
        return new Response("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") ?? "";

    const url = new URL(`${API_URL}/rooms/${resolvedParams.roomId}/feedback-access`);
    url.searchParams.append("userId", userId);

    const response = await fetch(url.toString(), {
        headers: { "Authorization": `Bearer ${session.user.accessToken}` },
    });

    const data = await response.json();
    return new Response(JSON.stringify(data), { status: response.status });
}
