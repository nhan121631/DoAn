import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { API_URL } from "@/services/Constant";

// GET /api/contract/[contractId]
export async function GET(request: Request, { params }: { params: Promise<{ contractId: string }> }) {
  const { contractId } = await params;
  if (!contractId) return new Response("contractId is missing", { status: 400 });
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });
  const url = `${API_URL}/contracts/${contractId}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${session.user.accessToken}` },
  });
  const data = await response.json();
  return new Response(JSON.stringify(data), { status: response.status });
}

// PUT /api/contracts/[contractId]
export async function PUT(request: Request, { params }: { params: Promise<{ contractId: string }> }) {
  const { contractId } = await params;
  if (!contractId) return new Response("contractId is missing", { status: 400 });
  
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });
  
  try {
    const body = await request.json();
    const url = `${API_URL}/contracts/${contractId}`;
    
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.user.accessToken}`,
      },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    return new Response(JSON.stringify(data), { status: response.status });
  } catch (error) {
    console.error("Error updating contract:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

// DELETE /api/contracts/[contractId]
export async function DELETE(request: Request, { params }: { params: Promise<{ contractId: string }> }) {
  const { contractId } = await params;
  if (!contractId) return new Response("contractId is missing", { status: 400 });
  
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });
  
  try {
    const url = `${API_URL}/contracts/${contractId}`;
    
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
      },
    });
    
    if (response.ok) {
      return new Response(null, { status: 204 });
    } else {
      const errorData = await response.text();
      return new Response(errorData || "Failed to delete contract", { status: response.status });
    }
  } catch (error) {
    console.error("Error deleting contract:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
