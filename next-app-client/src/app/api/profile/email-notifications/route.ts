import { authOptions } from "@/lib/auth";
import { API_URL } from "@/services/Constant";
import { getServerSession } from "next-auth";

export async function PATCH(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return new Response("Unauthorized", { status: 401 });
    }
    const formData = await request.formData();
    const response = await fetch(`${API_URL}/profile/${session.user.id}/email-notifications`, {
        method: "PATCH",
        body: formData,
        headers: {
            "Authorization": `Bearer ${session.user.accessToken}`,
        },
    });
    if (!response.ok) {
        return new Response("Failed to update email notifications", { status: 500 });
    }
    return new Response("Email notifications updated successfully", { status: 200 });
}

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return new Response("Unauthorized", { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) {
        return new Response("Missing userId parameter", { status: 400 });
    }
    const response = await fetch(`${API_URL}/profile/email-notifications?userId=${userId}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${session.user.accessToken}`,
        },
    });
    if (!response.ok) {
        return new Response("Failed to fetch email notifications", { status: 500 });
    }
    const data = await response.json();
    return new Response(JSON.stringify(data), { status: 200 });
}
