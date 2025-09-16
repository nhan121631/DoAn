import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { API_URL } from "@/services/Constant";

// GET /api/landlord-tasks/landlord/[landlordId]
export async function GET(request: Request, { params }: { params: Promise<{ landlordId: string }> }) {
  const { landlordId } = await params;
  if (!landlordId) return new Response("landlordId is missing", { status: 400 });
  
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });
  
  const url = `${API_URL}/landlord-tasks/landlord/${landlordId}`;
  
const response = await fetch(url, {
  headers: { Authorization: `Bearer ${session.user.accessToken}` },
});
if (!response.ok) {
  const errorText = await response.text();
  return new Response(errorText, { status: response.status });
}
const data = await response.json();
return new Response(JSON.stringify(data), { status: response.status });
}