/* eslint-disable @typescript-eslint/no-explicit-any */
const API_URL = "http://localhost:3333/api";

export async function getAllTransactionsByUserId(
  userId: string,
  accessToken: string
) {
  try {
    const response = await fetch(
      `http://localhost:3333/api/transactions/${userId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    if (!response.ok) throw new Error("Network error");
    const data = await response.json();
    // Đảm bảo luôn trả về mảng
    if (!Array.isArray(data)) return [];
    return data;
  } catch (error) {
    console.error("Error getAllTransactionsByUserId:", error);
    return [];
  }
}

export async function getTransactionsByUserIdPaginated(
  userId: string,
  accessToken: string,
  page: number,
  size: number
) {
  try {
    const response = await fetch(
      `http://localhost:3333/api/transactions/by-user/${userId}/paging?page=${page}&size=${size}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    if (!response.ok) throw new Error("Network error");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error getTransactionsByUserIdPaginated:", error);
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

export async function createTransactionByUserId(
  userId: string,
  transactionData: any,
  accessToken: string
) {
  try {
    const response = await fetch(`${API_URL}/transactions/${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ userId, ...transactionData }),
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
