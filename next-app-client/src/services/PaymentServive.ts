/* eslint-disable @typescript-eslint/no-explicit-any */
export async function getTransactionsByUserIdPaginated(
  page: number,
  size: number
) {
  try {
    const response = await fetch(
      `/api/landlord/payment-history?page=${page}&size=${size}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) throw new Error("Network error");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return {
      transactions: [],
      pageNumber: page,
      pageSize: size,
      totalRecords: 0,
      totalPages: 0,
      hasNext: false,
      hasPrevious: false,
    };
  }
}

export async function createTransactionByUserId(transactionData: any) {
  try {
    const response = await fetch("/api/landlord/payment-result-client", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(transactionData),
    });
    if (!response.ok) {
      throw new Error("Failed to create transaction");
    }
    const data = await response.json();
    return data.transaction || data;
  } catch (error) {
    console.error("Error creating transaction:", error);
    throw error;
  }
}

export async function getTransactionsByUserIdAndDateRange(
  startDate: string,
  endDate: string,
  page: number = 0,
  size: number = 5
) {
  try {
    const params = new URLSearchParams({
      startDate,
      endDate,
      page: page.toString(),
      size: size.toString(),
    }).toString();

    const response = await fetch(
      `/api/landlord/payment-history/filter-by-date?${params}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) throw new Error("Network error");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching transactions by date range:", error);
    return {
      transactions: [],
      pageNumber: page,
      pageSize: size,
      totalRecords: 0,
      totalPages: 0,
      hasNext: false,
      hasPrevious: false,
    };
  }
}

type PaymentData = {
  amount: number;
  vnp_BankCode?: string;
  vnp_TxnRef: string;
  vnp_PayDate?: string | null;
  transactionStatus?: { success: boolean };
  vnp_OrderInfo?: string;
};

function formatVnpPayDateToISO(vnpPayDate?: string | null): string | null {
  // VNPay trả về dạng "yyyyMMddHHmmss" (VD: "20250802195453")
  if (!vnpPayDate || vnpPayDate.length !== 14) return null;
  const year = vnpPayDate.substring(0, 4);
  const month = vnpPayDate.substring(4, 6);
  const day = vnpPayDate.substring(6, 8);
  const hour = vnpPayDate.substring(8, 10);
  const minute = vnpPayDate.substring(10, 12);
  const second = vnpPayDate.substring(12, 14);
  // Tạo chuỗi ISO: "2025-08-02T19:54:53.000+07:00"
  return `${year}-${month}-${day}T${hour}:${minute}:${second}.000+07:00`;
}

export function mapPaymentDataToTransactionData(payment: PaymentData) {
  return {
    amount: payment.amount,
    transactionType: 1,
    bankTransactionName: payment.vnp_BankCode || "VNPAY",
    transactionCode: payment.vnp_TxnRef,
    transactionDate: payment.vnp_PayDate
      ? formatVnpPayDateToISO(payment.vnp_PayDate)
      : null,
    status: payment.transactionStatus?.success ? 1 : 0,
    description: payment.vnp_OrderInfo || "",
  };
}

//-------------create-payment--------------//
export const createPayment = async (payload: {
  amount: number;
  description: string;
  userId: string;
}) => {
  const res = await fetch("/api/payments/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Payment creation failed");
  return data;
};
//------- confirm payment ------//
export const confirmPayment = async (query: string) => {
  try {
    const res = await fetch(`/api/payments/confirm?${query}`, {
      method: "GET",
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to confirm payment");
    }

    return data;
  } catch (error: any) {
    console.error("Confirm payment service error:", error);
    throw error;
  }
};

// export async function getAllTransactionsByUserId(
//   userId: string,
//   accessToken: string
// ) {
//   try {
//     const response = await fetch(`${API_URL}/transactions/${userId}`, {
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${accessToken}`,
//       },
//     });

//     if (response.status === 400) {
//       return null;
//     }

//     if (response.status === 403) {
//       console.log("Forbidden access to transactions");
//       return { forbidden: true };
//     }

//     if (!response.ok) throw new Error("Network error");
//     const data = await response.json();
//     // Đảm bảo luôn trả về mảng
//     if (!Array.isArray(data)) return [];
//     return data;
//   } catch (error) {
//     console.error("Error getAllTransactionsByUserId:", error);
//     return [];
//   }
// }
