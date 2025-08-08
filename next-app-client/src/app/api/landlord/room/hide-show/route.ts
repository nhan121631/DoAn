import { authOptions } from "@/lib/auth";
import { API_URL } from "@/services/Constant";
import { getServerSession } from "next-auth";

export async function PATCH(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return new Response("Unauthorized", { status: 401 });
    }

    const { roomId, isHidden } = await request.json();

    try {
        const response = await fetch(`${API_URL}/rooms/${roomId}/hidden`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.user.accessToken}`,
            },
            body: JSON.stringify({ isHidden }), 
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
    } catch (error) {
        console.error("Error updating room visibility:", error);
        return new Response("Failed to update room visibility", { status: 500 });
    }
}