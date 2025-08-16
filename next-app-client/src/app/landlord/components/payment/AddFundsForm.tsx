/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
"use client";
import { formatCurrency } from "@/lib/vnpay-utils";
import { createPayment } from "@/services/PaymentServive";
import { message } from "antd";
import { useEffect, useState } from "react";

interface AddFundsFormProps {
  onSuccess?: () => void;
}

export default function AddFundsForm({ onSuccess }: AddFundsFormProps) {
  const [amount, setAmount] = useState<string>("50000");
  const [orderInfo, setOrderInfo] = useState("");
  //   const [bankCode, setBankCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/auth/session");
        const s = await r.json();
        if (s?.user?.id) setUserId(s.user.id);
      } catch {}
    })();
  }, []);
  const handlePay = async () => {
    const amountNumber = Number(amount);
    if (amountNumber < 5000) {
      messageApi.error({ content: "Minimum amount is 5,000 VND", duration: 2 });
      return;
    }

    setLoading(true);
    try {
      const data = await createPayment({
        amount: amountNumber,
        description:
          orderInfo || `Add ${formatCurrency(amountNumber)} to wallet`,
        userId,
      });
      if (!data.paymentUrl) {
        throw new Error("No payment URL received");
      }

      window.location.href = data.paymentUrl;
    } catch (err: any) {
      console.error("Payment error:", err);
      messageApi.error({
        content: err.message || "Payment failed",
        duration: 2,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handlePay();
        }}
        className="space-y-6"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 dark:!text-white">
            Amount <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="5000"
            step="1000"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg dark:placeholder:!text-gray-400"
            placeholder="Enter amount"
            required
          />
          <p className="text-sm text-gray-500 mt-1  dark:!text-white">
            Amount:{" "}
            <span className="font-semibold text-blue-700">
              {formatCurrency(Number(amount))}
            </span>
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2  dark:!text-white">
            Payment description
          </label>
          <input
            type="text"
            value={orderInfo}
            onChange={(e) => setOrderInfo(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent "
            placeholder="Enter payment description (optional)"
          />
        </div>
        {/* Only 1 payment method: VNPay */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2  dark:!text-white">
            Payment method
          </label>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded font-semibold text-base">
              <svg
                width="24"
                height="24"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="mr-2"
              >
                <rect width="48" height="48" rx="24" fill="#1976D2" />
                <text
                  x="24"
                  y="30"
                  textAnchor="middle"
                  fontSize="16"
                  fill="#fff"
                  fontWeight="bold"
                >
                  VNPay
                </text>
              </svg>
              VNPay
            </span>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading || Number(amount) < 5000}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center text-lg"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </>
          ) : (
            <div className="text-white flex items-center justify-center">
              <svg
                width="24"
                height="24"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="mr-2"
              >
                <rect width="48" height="48" rx="24" fill="#1976D2" />
                <text
                  x="24"
                  y="30"
                  textAnchor="middle"
                  fontSize="16"
                  fill="#fff"
                  fontWeight="bold"
                >
                  VNPay
                </text>
              </svg>
              Pay with VNPay
            </div>
          )}
        </button>
        <div className="text-center pt-4">
          <a
            href="/transactions"
            className="text-blue-600 hover:text-blue-800 text-sm underline"
          >
            🔍 Transaction lookup
          </a>
        </div>
        <div className="text-center pt-2">
          <p className="text-xs text-gray-500">
            Secured by VNPay - Vietnam's leading payment gateway
          </p>
        </div>
      </form>
    </>
  );
}
