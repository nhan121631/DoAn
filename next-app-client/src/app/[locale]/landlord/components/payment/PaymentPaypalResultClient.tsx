"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { formatCurrency } from "@/lib/vnpay-utils";
import { confirmPaymentPaypal } from "@/services/PaymentServive";

interface PaypalPaymentData {
  transactionStatus: { success: boolean; message: string };
  paypalOrderId: string;
  amount: number;
  description: string;
  payerEmail?: string;
  payerName?: string;
  paymentTime?: string;
  status?: string;
}

export default function PaymentPaypalResultClient() {
  const searchParams = useSearchParams();
  const [paymentData, setPaymentData] = useState<PaypalPaymentData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaymentResult = async () => {
      try {
        const params = new URLSearchParams();
        searchParams?.forEach((value, key) => {
          params.append(key, value);
        });

        const raw = await confirmPaymentPaypal(params.toString());

        let mappedData: PaypalPaymentData;
        if (!raw.success) {
          mappedData = {
            transactionStatus: {
              success: false,
              message: raw.message || "Payment failed",
            },
            paypalOrderId: raw.orderId || "",
            amount: raw.amount || 0,
            description: raw.description || "",
          };
        } else {
          const tx = raw.transaction;
          mappedData = {
            transactionStatus: { success: true, message: "Payment successful" },
            paypalOrderId: tx.transactionCode || tx.paypalOrderId || "",
            amount: tx.amount,
            description: tx.description || "",
            payerEmail: tx.payerEmail,
            payerName: tx.payerName,
            paymentTime: tx.paymentTime,
            status: tx.status,
          };
        }

        setPaymentData(mappedData);
      } catch (err) {
        setError("An error occurred while processing the payment result");
        console.error("PayPal Payment confirm error:", err);
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
    <div className="max-w-xl mx-auto bg-white rounded-lg shadow-lg p-8 mt-8">
      <h2
        className={`text-2xl font-bold mb-2 ${
          paymentData.transactionStatus.success
            ? "text-green-700"
            : "text-red-600"
        }`}
      >
        {paymentData.transactionStatus.success
          ? "✅ Payment successful!"
          : "❌ Payment failed!"}
      </h2>
      <div
        className={`inline-block px-4 py-2 rounded font-semibold mb-4 ${
          paymentData.transactionStatus.success
            ? "bg-green-100 text-green-800 border border-green-300"
            : "bg-red-100 text-red-800 border border-red-300"
        }`}
      >
        {paymentData.transactionStatus.message}
      </div>
      <table className="w-full text-sm mt-4 border-collapse">
        <tbody>
          <tr>
            <th className="text-left py-2 pr-4 font-semibold">
              PayPal Order ID
            </th>
            <td>{paymentData.paypalOrderId}</td>
          </tr>
          <tr>
            <th className="text-left py-2 pr-4 font-semibold">Amount</th>
            <td>{formatCurrency(paymentData.amount)}</td>
          </tr>
          <tr>
            <th className="text-left py-2 pr-4 font-semibold">Description</th>
            <td>{paymentData.description}</td>
          </tr>
          <tr>
            <th className="text-left py-2 pr-4 font-semibold">Payer Name</th>
            <td>{paymentData.payerName || "N/A"}</td>
          </tr>
          <tr>
            <th className="text-left py-2 pr-4 font-semibold">Payer Email</th>
            <td>{paymentData.payerEmail || "N/A"}</td>
          </tr>
          <tr>
            <th className="text-left py-2 pr-4 font-semibold">Payment Time</th>
            <td>{paymentData.paymentTime || "N/A"}</td>
          </tr>
          <tr>
            <th className="text-left py-2 pr-4 font-semibold">Status</th>
            <td>
              {paymentData.status ||
                (paymentData.transactionStatus.success
                  ? "COMPLETED"
                  : "FAILED")}
            </td>
          </tr>
        </tbody>
      </table>
      <div className="flex gap-3 mt-6">
        <a
          href="/landlord/profile"
          className="inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          ← Back to Profile
        </a>
        <a
          href="/landlord/payment-history"
          className="inline-block px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          📋 View Payment History
        </a>
      </div>
    </div>
  );
}
