"use client";

import React, { useEffect, useState } from "react";
import PaymentFilter from "../components/payment/PaymentFilter";
import { Table, Tag, Pagination } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  getPaymentsFromLocalStorage,
  clearPaymentHistory,
  PaymentRecord,
} from "@/lib/payment-storage";
import { formatCurrency } from "@/lib/vnpay-utils";
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const formatVnpayDate = (vnp_PayDate?: string) => {
  if (!vnp_PayDate) return "N/A";
  return `${vnp_PayDate.substring(6, 8)}/${vnp_PayDate.substring(
    4,
    6
  )}/${vnp_PayDate.substring(0, 4)} ${vnp_PayDate.substring(
    8,
    10
  )}:${vnp_PayDate.substring(10, 12)}:${vnp_PayDate.substring(12, 14)}`;
};

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [filter, setFilter] = useState<"all" | "success" | "failed">("all");
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [successCount, setSuccessCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [totalSuccess, setTotalSuccess] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    let paymentData: PaymentRecord[] = [];
    try {
      switch (filter) {
        case "success":
          paymentData = getPaymentsFromLocalStorage().filter(
            (p) => p.transactionStatus.success
          );
          break;
        case "failed":
          paymentData = getPaymentsFromLocalStorage().filter(
            (p) => !p.transactionStatus.success
          );
          break;
        default:
          paymentData = getPaymentsFromLocalStorage();
      }
      setPayments(paymentData);
      setCurrentPage(1);
      // Thống kê
      const allPayments = getPaymentsFromLocalStorage();
      const successList = allPayments.filter(
        (p) => p.transactionStatus.success
      );
      const failedList = allPayments.filter(
        (p) => !p.transactionStatus.success
      );
      setSuccessCount(successList.length);
      setFailedCount(failedList.length);
      setTotalSuccess(successList.reduce((total, p) => total + p.amount, 0));
    } catch (error) {
      console.error("Error loading payments:", error);
    }
  }, [filter]);

  const handleClearHistory = () => {
    try {
      clearPaymentHistory();
      setPayments([]);
      setSuccessCount(0);
      setFailedCount(0);
      setTotalSuccess(0);
      setShowConfirmClear(false);
      alert("Đã xóa lịch sử thanh toán");
    } catch (error) {
      console.error("Error clearing history:", error);
      alert("Có lỗi khi xóa lịch sử");
    }
  };

  // Antd Table columns
  const columns: ColumnsType<PaymentRecord> = [
    {
      title: "Mã GD",
      dataIndex: "vnp_TxnRef",
      key: "vnp_TxnRef",
      width: 180,
      render: (text: string) => (
        <span style={{ fontFamily: "monospace" }}>{text}</span>
      ),
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      width: 140,
      render: (amount: number) => (
        <span style={{ color: "#2563eb", fontWeight: 600 }}>
          {formatCurrency(amount)}
        </span>
      ),
    },
    {
      title: "Ngân hàng",
      dataIndex: "vnp_BankCode",
      key: "vnp_BankCode",
      width: 120,
      render: (bank: string) => bank || "N/A",
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 120,
      render: (_, record) => (
        <Tag color={record.transactionStatus.success ? "green" : "red"}>
          {record.transactionStatus.success ? "Thành công" : "Thất bại"}
        </Tag>
      ),
    },
    {
      title: "Thời gian",
      dataIndex: "vnp_PayDate",
      key: "vnp_PayDate",
      width: 160,
      render: (vnp_PayDate: string, record) => (
        <div>
          <div>{formatVnpayDate(vnp_PayDate)}</div>
          <div style={{ color: "#888", fontSize: 12 }}>
            Lưu: {formatDate(record.createdAt)}
          </div>
        </div>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "vnp_OrderInfo",
      key: "vnp_OrderInfo",
      width: 200,
      render: (info: string) => info || "",
    },
  ];

  const paginatedData = payments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div>
      <div className="min-h-screen py-8  bg-white dark:bg-[#001529] text-gray-900 p-8 transition-colors duration-300">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6 dark:!bg-[#22304a]">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:!text-white">
                Lịch sử thanh toán
              </h1>
              {/* hskdh */}
            </div>

            {/* Thống kê */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800">
                  Thành công
                </h3>
                <p className="text-2xl font-bold text-green-600">
                  {successCount}
                </p>
                <p className="text-sm text-green-600">
                  {formatCurrency(totalSuccess)}
                </p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-red-800">Thất bại</h3>
                <p className="text-2xl font-bold text-red-600">{failedCount}</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-800">
                  Tổng cộng
                </h3>
                <p className="text-2xl font-bold text-blue-600">
                  {successCount + failedCount}
                </p>
              </div>
            </div>

            {/* Filter */}
            <PaymentFilter />

            {/* Payment List */}
            <div>
              <Table
                columns={columns}
                dataSource={paginatedData}
                pagination={false}
                rowKey="id"
                size="small"
                locale={{
                  emptyText: (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-6xl mb-4">💳</div>
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">
                        Chưa có giao dịch nào
                      </h3>
                      <p className="text-gray-500">
                        Lịch sử thanh toán sẽ hiển thị tại đây
                      </p>
                    </div>
                  ),
                }}
              />
              <div className="flex justify-end mt-4">
                <Pagination
                  current={currentPage}
                  total={payments.length}
                  pageSize={pageSize}
                  onChange={setCurrentPage}
                  showSizeChanger={false}
                  showQuickJumper={false}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Confirm Clear Modal */}
        {showConfirmClear && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">
                Xác nhận xóa lịch sử
              </h3>
              <p className="text-gray-600 mb-6">
                Bạn có chắc chắn muốn xóa tất cả lịch sử thanh toán? Hành động
                này không thể hoàn tác.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowConfirmClear(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
                >
                  Hủy
                </button>
                <button
                  onClick={handleClearHistory}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
