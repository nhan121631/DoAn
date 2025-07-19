"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import VnpayResult from "@/app/landlord/components/payment/VnpayResult";
import { formatCurrency } from "@/lib/vnpay-utils";
import { savePaymentToLocalStorage } from "@/lib/payment-storage";

interface PaymentData {
  transactionStatus: { success: boolean; message: string };
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
}

export default function PaymentResultClient() {
  const searchParams = useSearchParams();
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaymentResult = async () => {
      try {
        const params = new URLSearchParams();
        searchParams.forEach((value, key) => {
          params.append(key, value);
        });
        const response = await fetch(`/api/vnpay-return?${params.toString()}`);
        if (!response.ok) {
          throw new Error("Failed to process payment result");
        }
        const data = await response.json();
        setPaymentData(data);
        try {
          savePaymentToLocalStorage(data);
        } catch (saveError) {
          console.error("Failed to save payment data:", saveError);
        }
      } catch (err) {
        setError("Có lỗi xảy ra khi xử lý kết quả thanh toán");
      } finally {
        setLoading(false);
      }
    };
    if (searchParams.toString()) {
      fetchPaymentResult();
    } else {
      setError("Không có thông tin thanh toán");
      setLoading(false);
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang xử lý kết quả thanh toán...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Có lỗi xảy ra
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <a
              href="/landlord/add-funds"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              ← Quay lại trang nạp tiền
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!paymentData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Không có dữ liệu thanh toán</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <VnpayResult {...paymentData} formatCurrency={formatCurrency} />
      </div>
    </div>
  );
}
