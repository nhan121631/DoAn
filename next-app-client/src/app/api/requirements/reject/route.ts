import { authOptions } from "@/lib/auth";
import { API_URL } from "@/services/Constant";
import { getServerSession } from "next-auth";

export async function PATCH(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return new Response("Unauthorized", { status: 401 });
    }
  const req = await request.json();
  const id = req.id;

const response = await fetch(`${API_URL}/requirements/${id}/reject`, {
    method: "PATCH",
    headers: {
        "Authorization": `Bearer ${session.user.accessToken}`,
    },
});

    if (!response.ok) {
        const errorJson = await response.json();
        console.error("Backend error:", errorJson);
        return new Response(JSON.stringify(errorJson), { status: response.status, headers: { "Content-Type": "application/json" } });
    }

    const text = await response.text();
return new Response(JSON.stringify({ message: text }), { status: 200, headers: { "Content-Type": "application/json" } });
}
