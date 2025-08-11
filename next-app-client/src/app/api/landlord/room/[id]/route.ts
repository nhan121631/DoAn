import { authOptions } from "@/lib/auth";
import { API_URL } from "@/services/Constant";
import { getServerSession } from "next-auth";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const formData = await request.formData();
  // Lấy room object từ form
  const roomRaw = formData.get("room");
  if (typeof roomRaw !== "string") {
    return new Response("Invalid room data", { status: 400 });
  }

  // Đảm bảo dữ liệu update hình ảnh giống create
  // Nếu không có file mới và không thay đổi existingImages, giữ nguyên
  // Nếu có file mới hoặc existingImages thay đổi, backend sẽ xử lý như create

  // Gọi API backend
  const response = await fetch(`${API_URL}/rooms/${params.id}`, {
    method: "PATCH",
    body: formData,
    headers: {
      "Authorization": `Bearer ${session.user.accessToken}`,
    },
  });

  if (!response.ok) {
    const errorJson = await response.json();
    console.error("Backend error:", errorJson);
    return new Response(JSON.stringify(errorJson), {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  const data = await response.json();
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
