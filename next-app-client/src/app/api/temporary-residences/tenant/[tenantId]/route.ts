/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { API_URL } from "@/services/Constant";
import { NextRequest, NextResponse } from 'next/server';

// GET /api/temporary-residences/landlord/[landlordId] - Get all residents for a landlord
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { tenantId } = await params;

    // Call backend API to get residents by tenant
    const res = await fetch(`${API_URL}/temporary-residences/tenant/${tenantId}`, {
      method: 'GET',
      headers: {
        "Authorization": `Bearer ${session.user.accessToken}`,
      },
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: data.message || "Fetch residents failed" }, { status: res.status });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching residents by tenant:', error);
    return NextResponse.json(
      { error: 'Failed to fetch residents by tenant' },
      { status: 500 }
    );
  }
}