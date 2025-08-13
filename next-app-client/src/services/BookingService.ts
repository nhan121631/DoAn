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
