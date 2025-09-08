import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { API_URL } from "@/services/Constant";

// GET /api/contract/status/[status]
export async function GET(request: Request, { params }: { params: Promise<{ status: string }> }) {
  const { status } = await params;
  if (!status) return new Response("status is missing", { status: 400 });
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });
  const url = `${API_URL}/contracts/status/${status}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${session.user.accessToken}` },
  });
  const data = await response.json();
  return new Response(JSON.stringify(data), { status: response.status });
}
