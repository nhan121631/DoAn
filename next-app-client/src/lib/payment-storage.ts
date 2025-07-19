// Utility functions để lưu và quản lý thông tin thanh toán

export interface PaymentRecord {
  id: string;
  vnp_TxnRef: string;
  amount: number;
  vnp_OrderInfo: string;
  vnp_TransactionNo?: string;
  vnp_BankTranNo?: string;
  vnp_BankCode?: string;
  vnp_CardType?: string;
  vnp_PayDate?: string;
  vnp_ResponseCode?: string;
  vnp_TransactionStatus?: string;
  transactionStatus: { success: boolean; message: string };
  createdAt: string;
  userId?: string; // Có thể thêm để liên kết với user
}

// Lưu thông tin thanh toán vào localStorage
export const savePaymentToLocalStorage = (
  paymentData: Omit<PaymentRecord, "id" | "createdAt">
): PaymentRecord => {
  const payment: PaymentRecord = {
    ...paymentData,
    id: generatePaymentId(),
    createdAt: new Date().toISOString(),
  };

  try {
    const existingPayments = getPaymentsFromLocalStorage();
    const updatedPayments = [payment, ...existingPayments];

    // Giữ tối đa 50 record thanh toán gần nhất
    const limitedPayments = updatedPayments.slice(0, 50);

    localStorage.setItem("payment_history", JSON.stringify(limitedPayments));
    console.log("Payment saved to localStorage:", payment);

    return payment;
  } catch (error) {
    console.error("Error saving payment to localStorage:", error);
    throw error;
  }
};

// Lấy danh sách thanh toán từ localStorage
export const getPaymentsFromLocalStorage = (): PaymentRecord[] => {
  try {
    const payments = localStorage.getItem("payment_history");
    return payments ? JSON.parse(payments) : [];
  } catch (error) {
    console.error("Error getting payments from localStorage:", error);
    return [];
  }
};

// Lấy thanh toán theo ID
export const getPaymentById = (id: string): PaymentRecord | null => {
  try {
    const payments = getPaymentsFromLocalStorage();
    return payments.find((payment) => payment.id === id) || null;
  } catch (error) {
    console.error("Error getting payment by ID:", error);
    return null;
  }
};

// Lấy thanh toán theo mã giao dịch VNPay
export const getPaymentByTxnRef = (
  vnp_TxnRef: string
): PaymentRecord | null => {
  try {
    const payments = getPaymentsFromLocalStorage();
    return (
      payments.find((payment) => payment.vnp_TxnRef === vnp_TxnRef) || null
    );
  } catch (error) {
    console.error("Error getting payment by TxnRef:", error);
    return null;
  }
};

// Xóa tất cả lịch sử thanh toán
export const clearPaymentHistory = (): void => {
  try {
    localStorage.removeItem("payment_history");
    console.log("Payment history cleared");
  } catch (error) {
    console.error("Error clearing payment history:", error);
  }
};

// Generate unique payment ID
const generatePaymentId = (): string => {
  return `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Lọc thanh toán theo trạng thái
export const getPaymentsByStatus = (success: boolean): PaymentRecord[] => {
  try {
    const payments = getPaymentsFromLocalStorage();
    return payments.filter(
      (payment) => payment.transactionStatus.success === success
    );
  } catch (error) {
    console.error("Error filtering payments by status:", error);
    return [];
  }
};

// Lấy tổng số tiền đã thanh toán thành công
export const getTotalSuccessfulPayments = (): number => {
  try {
    const successfulPayments = getPaymentsByStatus(true);
    return successfulPayments.reduce(
      (total, payment) => total + payment.amount,
      0
    );
  } catch (error) {
    console.error("Error calculating total successful payments:", error);
    return 0;
  }
};

// Export để có thể mở rộng lưu vào database
export const savePaymentToDatabase = async (
  paymentData: PaymentRecord
): Promise<void> => {
  // TODO: Implement database saving logic
  // Ví dụ: gọi API để lưu vào database
  try {
    const response = await fetch("/api/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      throw new Error("Failed to save payment to database");
    }

    console.log("Payment saved to database successfully");
  } catch (error) {
    console.error("Error saving payment to database:", error);
    // Fallback to localStorage if database save fails
    throw error;
  }
};
