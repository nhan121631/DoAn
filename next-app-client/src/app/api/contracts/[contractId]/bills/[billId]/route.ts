import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { API_URL } from "@/services/Constant";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: { contractId: string; billId: string } }) {
  const body = await req.json();
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Gọi API backend update bill
  const res = await fetch(`${API_URL}/bills/${params.billId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.user.accessToken}`,
    },
    body: JSON.stringify({
      id: params.billId,
      ...body,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    return NextResponse.json({ error: data.message || "Update bill failed" }, { status: res.status });
  }
  return NextResponse.json(data);
}

export async function GET(req: NextRequest, { params }: { params: { contractId: string; billId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Gọi API backend lấy bill theo id
  const res = await fetch(`${API_URL}/bills/${params.billId}`, {
    headers: {
      Authorization: `Bearer ${session.user.accessToken}`,
    },
  });
  const data = await res.json();
  if (!res.ok) {
    return NextResponse.json({ error: data.message || "Get bill failed" }, { status: res.status });
  }
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: { params: { contractId: string; billId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Gọi API backend xoá bill
  const res = await fetch(`${API_URL}/bills/${params.billId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${session.user.accessToken}`,
    },
  });
  if (!res.ok) {
    const data = await res.json();
    return NextResponse.json({ error: data.message || "Delete bill failed" }, { status: res.status });
  }
  return NextResponse.json({ success: true });
}
