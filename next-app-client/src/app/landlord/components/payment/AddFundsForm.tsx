"use client";

import { useState } from "react";

interface AddFundsFormProps {
  onSuccess?: () => void;
}

export default function AddFundsForm({ onSuccess }: AddFundsFormProps) {
  const [amount, setAmount] = useState(50000);
  const [orderInfo, setOrderInfo] = useState("");
//   const [bankCode, setBankCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    if (amount < 5000) {
      alert("Số tiền tối thiểu là 5,000 VNĐ");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/vnpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          orderInfo: orderInfo || `Thanh toán đơn hàng ${new Date().getTime()}`,
        //   bankCode: bankCode || undefined,
        }),
      });
      if (!res.ok) throw new Error("Network response was not ok");
      const data = await res.json();
      if (data.error) {
        alert(data.error);
        return;
      }
      // Redirect to VNPay
      window.location.href = data.url;
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Có lỗi xảy ra khi tạo thanh toán. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handlePay();
      }}
      className="space-y-6"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 dark:!text-white">
          Số tiền cần nạp <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          min="5000"
          step="1000"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg dark:placeholder:!text-gray-400"
          placeholder="Nhập số tiền"
          required
        />
        <p className="text-sm text-gray-500 mt-1  dark:!text-white">
          Số tiền:{" "}
          <span className="font-semibold text-blue-700">
            {formatCurrency(amount)}
          </span>
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2  dark:!text-white">
          Nội dung thanh toán
        </label>
        <input
          type="text"
          value={orderInfo}
          onChange={(e) => setOrderInfo(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent "
          placeholder="Nhập nội dung thanh toán (tùy chọn)"
        />
      </div>
      {/* Chỉ còn 1 phương thức thanh toán VNPay */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2  dark:!text-white">
          Phương thức thanh toán
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
        disabled={loading || amount < 5000}
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
            Đang xử lý...
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
            Nạp tiền qua VNPay
          </div>
        )}
      </button>
      <div className="text-center pt-4">
        <a
          href="/transactions"
          className="text-blue-600 hover:text-blue-800 text-sm underline"
        >
          🔍 Tra cứu giao dịch
        </a>
      </div>
      <div className="text-center pt-2">
        <p className="text-xs text-gray-500">
          Được bảo mật bởi VNPay - Cổng thanh toán hàng đầu Việt Nam
        </p>
      </div>
    </form>
  );
}
