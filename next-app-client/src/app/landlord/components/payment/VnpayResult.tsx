import React from "react";

interface VnpayResultProps {
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
  formatCurrency: (amount: number) => string;
}

const formatDate = (vnp_PayDate?: string) => {
  if (!vnp_PayDate) return "N/A";
  return `${vnp_PayDate.substring(6, 8)}/${vnp_PayDate.substring(
    4,
    6
  )}/${vnp_PayDate.substring(0, 4)} ${vnp_PayDate.substring(
    8,
    10
  )}:${vnp_PayDate.substring(10, 12)}:${vnp_PayDate.substring(12, 14)}`;
};

export default function VnpayResult({
  transactionStatus,
  vnp_TxnRef,
  amount,
  vnp_OrderInfo,
  vnp_TransactionNo,
  vnp_BankTranNo,
  vnp_BankCode,
  vnp_CardType,
  vnp_PayDate,
  vnp_ResponseCode,
  vnp_TransactionStatus,
  formatCurrency,
}: VnpayResultProps) {
  return (
    <div className="max-w-xl mx-auto bg-white rounded-lg shadow-lg p-8 mt-8">
      <h2
        className={`text-2xl font-bold mb-2 ${
          transactionStatus.success ? "text-green-700" : "text-red-600"
        }`}
      >
        {transactionStatus.success
          ? "✅ Thanh toán thành công!"
          : "❌ Thanh toán thất bại!"}
      </h2>
      <div
        className={`inline-block px-4 py-2 rounded font-semibold mb-4 ${
          transactionStatus.success
            ? "bg-green-100 text-green-800 border border-green-300"
            : "bg-red-100 text-red-800 border border-red-300"
        }`}
      >
        {transactionStatus.message}
      </div>
      <table className="w-full text-sm mt-4 border-collapse">
        <tbody>
          <tr>
            <th className="text-left py-2 pr-4 font-semibold">Mã đơn hàng</th>
            <td>{vnp_TxnRef}</td>
          </tr>
          <tr>
            <th className="text-left py-2 pr-4 font-semibold">Số tiền</th>
            <td>{formatCurrency(amount)}</td>
          </tr>
          <tr>
            <th className="text-left py-2 pr-4 font-semibold">
              Thông tin đơn hàng
            </th>
            <td>{vnp_OrderInfo}</td>
          </tr>
          <tr>
            <th className="text-left py-2 pr-4 font-semibold">
              Mã giao dịch VNPay
            </th>
            <td>{vnp_TransactionNo || "N/A"}</td>
          </tr>
          <tr>
            <th className="text-left py-2 pr-4 font-semibold">
              Mã giao dịch ngân hàng
            </th>
            <td>{vnp_BankTranNo || "N/A"}</td>
          </tr>
          <tr>
            <th className="text-left py-2 pr-4 font-semibold">Ngân hàng</th>
            <td>{vnp_BankCode}</td>
          </tr>
          <tr>
            <th className="text-left py-2 pr-4 font-semibold">Loại thẻ</th>
            <td>{vnp_CardType}</td>
          </tr>
          <tr>
            <th className="text-left py-2 pr-4 font-semibold">
              Thời gian thanh toán
            </th>
            <td>{formatDate(vnp_PayDate)}</td>
          </tr>
          <tr>
            <th className="text-left py-2 pr-4 font-semibold">Mã phản hồi</th>
            <td>{vnp_ResponseCode}</td>
          </tr>
          <tr>
            <th className="text-left py-2 pr-4 font-semibold">
              Trạng thái giao dịch
            </th>
            <td>{vnp_TransactionStatus}</td>
          </tr>
        </tbody>
      </table>
      <div className="flex gap-3 mt-6">
        <a
          href="/landlord/profile"
          className="inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          ← Quay lại trang chủ
        </a>
        <a
          href="/landlord/payment-history"
          className="inline-block px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          📋 Xem lịch sử thanh toán
        </a>
      </div>
    </div>
  );
}
