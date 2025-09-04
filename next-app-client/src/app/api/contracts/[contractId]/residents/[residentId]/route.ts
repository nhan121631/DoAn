import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { API_URL } from "@/services/Constant";
import { NextRequest, NextResponse } from 'next/server';

// PUT /api/contracts/[contractId]/residents/[residentId] - Update resident
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ contractId: string; residentId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { contractId, residentId } = await params;
    const formData = await request.formData();
    
    // Lấy data - có thể là File (từ blob) hoặc string
    const dataInput = formData.get("data");
    if (!dataInput) {
      return NextResponse.json(
        { error: "Missing resident data" },
        { status: 400 }
      );
    }

    // Xử lý data tùy theo kiểu
    let residentData;
    if (dataInput instanceof File) {
      // Nếu là File (blob từ ResidentService)
      const text = await dataInput.text();
      residentData = JSON.parse(text);
    } else {
      // Nếu là string
      residentData = JSON.parse(dataInput as string);
    }
    
    residentData.contractId = contractId; // thêm contractId cho chắc

    // Chuẩn bị form gửi sang Spring Boot giống như POST
    const backendFormData = new FormData();

    // Gửi data dưới dạng Blob JSON để Spring Boot parse được
    const residentBlob = new Blob([JSON.stringify(residentData)], {
      type: "application/json",
    });
    backendFormData.append("data", residentBlob, "data.json");

    // Gửi ảnh nếu có
    const frontImage = formData.get("frontImage") as File | null;
    const backImage = formData.get("backImage") as File | null;

    if (frontImage) backendFormData.append("frontImage", frontImage);
    if (backImage) backendFormData.append("backImage", backImage);

    // Gọi API backend cập nhật resident với Authentication
    const res = await fetch(`${API_URL}/temporary-residences/${residentId}`, {
      method: 'PUT',
      headers: {
        "Authorization": `Bearer ${session.user.accessToken}`,
      },
      body: backendFormData,
    });

    const updatedResident = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: updatedResident.message || "Update resident failed" }, { status: res.status });
    }
    
    return NextResponse.json(updatedResident);
  } catch (error) {
    console.error('Error updating resident:', error);
    return NextResponse.json(
      { error: 'Failed to update resident' },
      { status: 500 }
    );
  }
}

// DELETE /api/contracts/[contractId]/residents/[residentId] - Delete resident
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ contractId: string; residentId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { residentId } = await params;

    // Gọi API backend xóa resident
    const res = await fetch(`${API_URL}/temporary-residences/${residentId}`, {
      method: 'DELETE',
      headers: {
        "Authorization": `Bearer ${session.user.accessToken}`,
      },
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return NextResponse.json({ error: data.message || "Delete resident failed" }, { status: res.status });
    }
    
    return NextResponse.json({ message: 'Resident deleted successfully' });
  } catch (error) {
    console.error('Error deleting resident:', error);
    return NextResponse.json(
      { error: 'Failed to delete resident' },
      { status: 500 }
    );
  }
}

// GET /api/contracts/[contractId]/residents/[residentId] - Get specific resident
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ contractId: string; residentId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { residentId } = await params;

    // Gọi API backend lấy thông tin resident
    const res = await fetch(`${API_URL}/temporary-residences/${residentId}`, {
      method: 'GET',
      headers: {
        "Authorization": `Bearer ${session.user.accessToken}`,
      },
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: data.message || "Fetch resident failed" }, { status: res.status });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching resident:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resident' },
      { status: 500 }
    );
  }
}
