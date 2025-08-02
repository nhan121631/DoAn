/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import PaymentFilter from "../components/payment/PaymentFilter";
import { Table, Tag, Pagination } from "antd";
import type { ColumnsType } from "antd/es/table";
import { getAllTransactionsByUserId } from "@/services/PaymentServive";
import { formatCurrency } from "@/lib/vnpay-utils";

const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
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

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [filter, setFilter] = useState<"all" | "success" | "failed">("all");
  const [successCount, setSuccessCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [totalSuccess, setTotalSuccess] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const userId = "44256067-6f69-11f0-8622-b42e993f445f";
        let allPayments = await getAllTransactionsByUserId(userId);

        console.log("All payments:", allPayments);
        // Đảm bảo luôn là mảng
        if (!Array.isArray(allPayments)) {
          allPayments = [];
        }

        let paymentData: any[] = [];
        switch (filter) {
          case "success":
            paymentData = allPayments.filter((p: any) => p.status === 1);
            break;
          case "failed":
            paymentData = allPayments.filter((p: any) => p.status === 0);
            break;
          default:
            paymentData = allPayments;
        }
        setPayments(paymentData);
        setCurrentPage(1);

        // Thống kê
        const successList = allPayments.filter((p: any) => p.status === 1);
        const failedList = allPayments.filter((p: any) => p.status === 0);
        setSuccessCount(successList.length);
        setFailedCount(failedList.length);
        setTotalSuccess(
          successList.reduce((total: any, p: any) => total + p.amount, 0)
        );
      } catch (error) {
        console.error("Error loading payments:", error);
        setPayments([]); // Đảm bảo payments luôn là mảng
      }
    };
    fetchPayments();
  }, [filter]);

  // Antd Table columns
  const columns: ColumnsType<any> = [
    {
      title: "Mã GD",
      dataIndex: "transactionCode",
      key: "transactionCode",
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
      dataIndex: "bankTransactionName",
      key: "bankTransactionName",
      width: 120,
      render: (bank: string) => bank || "N/A",
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 120,
      render: (_: any, record: any) => (
        <Tag color={record.status === 1 ? "green" : "red"}>
          {record.status === 1 ? "Thành công" : "Thất bại"}
        </Tag>
      ),
    },
    {
      title: "Thời gian",
      dataIndex: "transactionDate",
      key: "transactionDate",
      width: 160,
      render: (transactionDate: string, record: any) => (
        <div>
          <div>{transactionDate ? formatDate(transactionDate) : "N/A"}</div>
        </div>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      width: 200,
      render: (info: string) => info || "",
    },
    // {
    //   title: "Số dư ví",
    //   dataIndex: ["wallet", "balance"],
    //   key: "walletBalance",
    //   width: 120,
    //   render: (balance: number) => (
    //     <span style={{ color: "#8b5cf6", fontWeight: 600 }}>
    //       {formatCurrency(balance)}
    //     </span>
    //   ),
    // },
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
            <PaymentFilter filter={filter} setFilter={setFilter} />

            {/* Payment List */}
            <div>
              <Table
                columns={columns}
                dataSource={paginatedData}
                pagination={false}
                rowKey="transactionCode"
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
      </div>
    </div>
  );
}
