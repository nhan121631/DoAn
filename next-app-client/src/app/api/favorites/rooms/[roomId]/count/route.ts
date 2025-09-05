import { NextResponse } from "next/server";
import { API_URL } from "@/services/Constant";

export async function GET(request: Request, { params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  const response = await fetch(`${API_URL}/favorites/rooms/${roomId}/count`);
  const count = await response.json();
  return NextResponse.json(count);
}