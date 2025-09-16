import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { API_URL } from "@/services/Constant";

// GET /api/landlord-tasks/[taskId]
export async function GET(request: Request, { params }: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await params;
  if (!taskId) return new Response("taskId is missing", { status: 400 });
  
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });
  
  const url = `${API_URL}/landlord-tasks/${taskId}`;
  
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${session.user.accessToken}` },
  });
  
  const data = await response.json();
  return new Response(JSON.stringify(data), { status: response.status });
}

// PUT /api/landlord-tasks/[taskId]
export async function PUT(request: Request, { params }: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await params;
  if (!taskId) return new Response("taskId is missing", { status: 400 });
  
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });
  
  try {
    const body = await request.json();
    const url = `${API_URL}/landlord-tasks/${taskId}`;
    
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
    console.error("Error updating landlord task:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

// DELETE /api/landlord-tasks/[taskId]
export async function DELETE(request: Request, { params }: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await params;
  if (!taskId) return new Response("taskId is missing", { status: 400 });
  
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });
  
  try {
    const url = `${API_URL}/landlord-tasks/${taskId}`;
    
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
      },
    });
    
    if (response.ok) {
      return new Response(null, { status: 204 });
    } else {
      const data = await response.json();
      return new Response(JSON.stringify(data), { status: response.status });
    }
  } catch (error) {
    console.error("Error deleting landlord task:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}