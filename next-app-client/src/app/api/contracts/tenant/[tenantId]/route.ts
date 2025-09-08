import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { API_URL } from "@/services/Constant";

// GET /api/contract/tenant/[tenantId]
export async function GET(request: Request, { params }: { params: Promise<{ tenantId: string }> }) {
  const { tenantId } = await params;
  if (!tenantId) return new Response("tenantId is missing", { status: 400 });
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });
  const url = `${API_URL}/contracts/tenant/${tenantId}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${session.user.accessToken}` },
  });
  const data = await response.json();
  return new Response(JSON.stringify(data), { status: response.status });
}
