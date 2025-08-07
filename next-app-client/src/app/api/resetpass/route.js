import { API_URL } from "@/services/Constant";

export async function POST(request) {
  const formData = await request.formData();
const response = await fetch(`${API_URL}/auth/reset-password/${formData.get("email")}`, {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
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
