import { API_URL } from "@/services/Constant";

export async function POST(request: Request) {
  const formData = await request.formData();
const response = await fetch(`${API_URL}/auth/update-password`, {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: formData.get("email"),
      newPassword: formData.get("newPassword"),
      code: formData.get("code"),
    }),
  });

    if (!response.ok) {
        const errorJson = await response.json();
        console.error("Backend error:", errorJson);
        return new Response(JSON.stringify(errorJson), { status: response.status, headers: { "Content-Type": "application/json" } });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), { status: 200, headers: { "Content-Type": "application/json" } });
}
