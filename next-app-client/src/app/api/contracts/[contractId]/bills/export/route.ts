import { API_URL } from "@/services/Constant";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: Request,
  context: { params: Promise<{ contractId: string }> }
) {
  const { contractId } = await context.params; 
  const { searchParams } = new URL(req.url);
  const fromMonth = searchParams.get("fromMonth");
  const toMonth = searchParams.get("toMonth");

  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  // gọi backend export
  const res = await fetch(
    `${API_URL}/contracts/${contractId}/bills/export?fromMonth=${fromMonth}&toMonth=${toMonth}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
      },
    }
  );

  if (!res.ok) {
    return new Response(JSON.stringify({ error: "Export failed" }), {
      status: res.status,
    });
  }
// nhận về byte[] Excel
  const data = await res.arrayBuffer(); 

  return new Response(data, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="bills_${fromMonth}_${toMonth}.xlsx"`,
    },
  });
}
