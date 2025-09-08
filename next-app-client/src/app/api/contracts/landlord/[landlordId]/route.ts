import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { API_URL } from "@/services/Constant";

// GET /api/contract/landlord/[landlordId]
export async function GET(request: Request, { params }: { params: Promise<{ landlordId: string }> }) {
  const { landlordId } = await params;
  if (!landlordId) return new Response("landlordId is missing", { status: 400 });
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") ?? "0";
  const size = searchParams.get("size") ?? "10";
  const url = `${API_URL}/contracts/landlord/${landlordId}?page=${page}&size=${size}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${session.user.accessToken}` },
  });
  const data = await response.json();
  return new Response(JSON.stringify(data), { status: response.status });
}
