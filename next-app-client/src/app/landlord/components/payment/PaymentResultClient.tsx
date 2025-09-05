"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import VnpayResult from "@/app/landlord/components/payment/VnpayResult";
import { formatCurrency } from "@/lib/vnpay-utils";
// import { mapPaymentDataToTransactionData } from "@/services/PaymentServive";
// import { API_URL } from "@/services/Constant";
import { confirmPayment } from "@/services/PaymentServive";

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
  const [userId, setUserId] = useState("");
  const searchParams = useSearchParams();
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const res = await fetch("/api/auth/session");
      const session = await res.json();
      console.log("Session:", session);
      if (session?.user?.id) {
        setUserId(session.user.id);
      }
    };
    fetchSession();
  }, [userId]);

  // useEffect(() => {
  //   const fetchPaymentResult = async () => {
  //     try {
  //       const params = new URLSearchParams();
  //       searchParams.forEach((value, key) => {
  //         params.append(key, value);
  //       });
  //       const response = await fetch(`/api/vnpay-return?${params.toString()}`);
  //       if (!response.ok) {
  //         throw new Error("Failed to process payment result");
  //       }
  //       const data = await response.json();
  //       setPaymentData(data);
  //       try {
  //         // savePaymentToLocalStorage(data);
  //         const transactionData = mapPaymentDataToTransactionData(data);
  //         // await createTransactionByUserId(userId, transactionData);
  //         await fetch("/api/landlord/payment-result-client", {
  //           method: "POST",
  //           headers: { "Content-Type": "application/json" },
  //           body: JSON.stringify(transactionData),
  //         });
  //         console.log("Transaction data:", transactionData);
  //       } catch (saveError) {
  //         console.error("Failed to save payment data:", saveError);
  //       }
  //     } catch (err) {
  //       setError("An error occurred while processing the payment result");
  //       console.error("Payment result fetch error:", err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   if (searchParams.toString()) {
  //     fetchPaymentResult();
  //   } else {
  //     setError("No payment information found");
  //     setLoading(false);
  //   }
  // }, [searchParams]);
  useEffect(() => {
    const fetchPaymentResult = async () => {
      try {
        const params = new URLSearchParams();
        searchParams?.forEach((value, key) => {
          params.append(key, value);
        });

        const raw = await confirmPayment(params.toString());

        let mappedData: PaymentData;
        if (!raw.success) {
          mappedData = {
            transactionStatus: {
              success: false,
              message: raw.message || "Payment failed",
            },
            vnp_TxnRef: "",
            amount: 0,
            vnp_OrderInfo: "",
          };
        } else {
          const tx = raw.transaction;
          mappedData = {
            transactionStatus: { success: true, message: "Payment successful" },
            vnp_TxnRef: tx.transactionCode,
            amount: tx.amount,
            vnp_OrderInfo: tx.description || "",
            vnp_TransactionNo: tx.transactionCode,
            vnp_BankCode: tx.bankTransactionName,
            // vnp_CardType: tx.cardType || "",
            // vnp_PayDate: tx.transactionDate || "",
            // vnp_ResponseCode: tx.responseCode,
            // vnp_TransactionStatus: tx.transactionStatus,
          };
        }

        setPaymentData(mappedData);
      } catch (err) {
        setError("An error occurred while processing the payment result");
        console.error("Payment confirm error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (searchParams?.toString()) {
      fetchPaymentResult();
    } else {
      setError("No payment information found");
      setLoading(false);
    }
  }, [searchParams]);
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Processing payment result...</p>
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
              An error occurred
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <a
              href="/landlord/add-funds"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              ← Back to Add Funds
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
          <p className="text-gray-600">No payment data found</p>
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
