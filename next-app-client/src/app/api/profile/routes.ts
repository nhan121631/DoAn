import { authOptions } from "@/lib/auth";
import { API_URL } from "@/services/Constant";
import { getServerSession } from "next-auth";

export async function PATCH(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return new Response("Unauthorized", { status: 401 });
    }
    const formData = await request.formData();
    const avatar = formData.get("avatar") as File | null;
    const profile = formData.get("profile") as string;

    const response = await fetch(`${API_URL}/api/profile/update`, {
        method: "PATCH",
        body: JSON.stringify({ avatar, profile }),
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.user.accessToken}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to update profile");
    }

    return response.json();
}
