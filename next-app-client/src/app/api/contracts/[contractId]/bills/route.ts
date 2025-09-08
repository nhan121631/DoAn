import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { API_URL } from "@/services/Constant";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ contractId: string }> }) {
  const body = await req.json();
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { contractId } = await params;
  // Gọi API backend tạo bill
  const res = await fetch(`${API_URL}/bills`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.user.accessToken}`,
    },
    body: JSON.stringify({
      contractId: contractId,
      ...body,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    return NextResponse.json({ error: data.message || "Create bill failed" }, { status: res.status });
  }
  return NextResponse.json(data);
}
export async function GET(req: NextRequest, { params }: { params: Promise<{ contractId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { contractId } = await params;
  // Gọi API backend lấy danh sách hóa đơn
  const res = await fetch(`${API_URL}/contracts/${contractId}/bills`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${session.user.accessToken}`,
    },
  });
  const data = await res.json();
  if (!res.ok) {
    return NextResponse.json({ error: data.message || "Fetch bills failed" }, { status: res.status });
  }
  return NextResponse.json(data);
}
