import { authOptions } from "@/lib/auth";
import { API_URL } from "@/services/Constant";
import { getServerSession } from "next-auth";

export async function PATCH(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return new Response("Unauthorized", { status: 401 });
    }
  const formData = await request.formData();
const response = await fetch(`${API_URL}/profile/update`, {
    method: "PATCH",
    body: formData,
    headers: {
        "Authorization": `Bearer ${session.user.accessToken}`,
    },
});

    if (!response.ok) {
        const errorJson = await response.json();
        console.error("Backend error:", errorJson);
        return new Response(JSON.stringify(errorJson), { status: response.status, headers: { "Content-Type": "application/json" } });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), { status: 200, headers: { "Content-Type": "application/json" } });
}
