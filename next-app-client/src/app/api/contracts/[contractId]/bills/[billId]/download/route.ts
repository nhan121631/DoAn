import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { API_URL} from "@/services/Constant";      
import { NextRequest, NextResponse } from "next/server";

export async function GET (req: NextRequest, {params} : {params: Promise<{contractId: string, billId: string}>}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }
  const { contractId, billId } = await params;
  const res = await fetch(`${API_URL}/bills/${billId}/download`, {
    headers: {
      Authorization: `Bearer ${session.user.accessToken}`,
    },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return NextResponse.json({ error: data.message || "Download bill failed" }, { status: res.status });
  }
   const arrayBuffer = await res.arrayBuffer();
   const buffer = Buffer.from(arrayBuffer);
   return new Response(buffer, {
     status: 200,
     headers: {
       "Content-Type": "application/pdf",
       "Content-Disposition": `attachment; filename="bill-${billId}.pdf"`,
     },
   });
}