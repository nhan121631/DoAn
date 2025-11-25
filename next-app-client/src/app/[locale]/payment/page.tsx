"use client";

import { API_URL } from "@/services/Constant";
import React, { useState, useEffect } from "react";

export default function AddFundsPage() {
  const [amount, setAmount] = useState<number>(50000);
  //   const [bankCode, setBankCode] = useState<string>("");
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    // Lấy userId từ session của bạn (tùy hệ thống auth)
    // Ví dụ:
    (async () => {
      try {
        const r = await fetch("/api/auth/session");
        const s = await r.json();
        if (s?.user?.id) setUserId(s.user.id);
      } catch {}
    })();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return alert("Chưa có userId");

    const res = await fetch(`${API_URL}/payments/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, userId }),
    });

    const data = await res.json();
    if (!res.ok || !data.paymentUrl) {
      alert("Tạo thanh toán thất bại");
      return;
    }
    // Redirect sang VNPay
    window.location.href = data.paymentUrl;
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow">
      <h1 className="text-xl font-semibold mb-4">Nạp tiền vào ví</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Số tiền (VND)</label>
          <input
            type="number"
            min={5000}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* <div>
          <label className="block mb-1">Ngân hàng (tuỳ chọn)</label>
          <input
            value={bankCode}
            onChange={(e) => setBankCode(e.target.value)}
            placeholder="VD: NCB"
            className="w-full border rounded px-3 py-2"
          />
        </div> */}

        <button className="w-full bg-blue-600 text-white rounded px-4 py-2">
          Thanh toán VNPay
        </button>
      </form>
    </div>
  );
}
