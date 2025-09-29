/* eslint-disable @typescript-eslint/no-explicit-any */
import { LandlordPaymentInfo } from "@/types/types";

export async function userFetchBookings(page: number, size: number) {
  const response = await fetch(`/api/booking/user?page=${page}&size=${size}`);
  if (!response.ok) {
    const errorJson = await response.json();
    throw new Error(errorJson.message || "Failed to fetch bookings");
  }
  const data = await response.json();
  return data;
}

export async function landlordFetchBookings(page: number, size: number) {
  const response = await fetch(
    `/api/booking/landlord?page=${page}&size=${size}`
  );
  if (!response.ok) {
    const errorJson = await response.json();
    throw new Error(errorJson.message || "Failed to fetch bookings");
  }
  const data = await response.json();
  return data;
}

export async function createBooking(bookingData: any) {
  console.log("BookingService - createBooking called with:", bookingData);

  const response = await fetch("/api/booking", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bookingData),
  });

  console.log("BookingService - Response status:", response.status);
  console.log("BookingService - Response ok:", response.ok);

  if (!response.ok) {
    const errorJson = await response.json();
    console.error("BookingService - Error response:", errorJson);

    const errorMessage =
      errorJson.details || errorJson.message || "Failed to create booking";
    throw new Error(errorMessage);
  }

  const booking = await response.json();
  console.log("BookingService - Success response:", booking);
  return booking;
}

export async function updateBookingStatus(
  bookingId: string,
  newStatus: number
) {
  const response = await fetch(`/api/booking?bookingId=${bookingId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ newStatus }),
  });

  if (!response.ok) {
    const errorJson = await response.json();
    throw new Error(errorJson.message || "Failed to update booking status");
  }

  const booking = await response.json();
  return booking;
}

export async function getLandlordPaymentInfo(
  bookingId: string
): Promise<LandlordPaymentInfo> {
  const response = await fetch(
    `/api/booking?bookingId=${bookingId}&action=landlord-payment-info`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorJson = await response.json();
    throw new Error(errorJson.message || "Failed to get landlord payment info");
  }

  const paymentInfo = await response.json();
  return paymentInfo;
}

export async function deleteBooking(bookingId: string) {
  if (!bookingId) {
    throw new Error("Missing bookingId");
  }

  const response = await fetch(
    `/api/booking/landlord?bookingId=${encodeURIComponent(bookingId)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    // Backend may return plain text (error message) or JSON. Read text and try to parse JSON.
    const text = await response.text();
    let message = "Failed to delete booking";
    try {
      const parsed = JSON.parse(text);
      message = parsed.message || text || message;
    } catch (_) {
      message = text || message;
    }
    throw new Error(message);
  }

  // Success: backend may return plain text confirmation
  const successText = await response.text();
  return { success: true, message: successText };
}

export async function uploadBillTransferImage(bookingId: string, file: File) {
  if (!bookingId) {
    throw new Error("Missing bookingId");
  }

  if (!file) {
    throw new Error("Missing file");
  }

  console.log("BookingService - uploadBillTransferImage called with:", {
    bookingId,
    fileName: file.name,
  });

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `/api/booking/${bookingId}/upload-bill-transfer`,
    {
      method: "POST",
      body: formData,
    }
  );

  console.log("BookingService - Upload response status:", response.status);
  console.log("BookingService - Upload response ok:", response.ok);

  if (!response.ok) {
    const errorJson = await response.json();
    console.error("BookingService - Upload error response:", errorJson);

    const errorMessage =
      errorJson.error ||
      errorJson.message ||
      "Failed to upload bill transfer image";
    throw new Error(errorMessage);
  }

  const result = await response.json();
  console.log("BookingService - Upload success response:", result);
  return result;
}
