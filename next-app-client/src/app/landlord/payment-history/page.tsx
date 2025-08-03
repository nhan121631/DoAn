/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import PaymentFilter from "../components/payment/PaymentFilter";
import { Table, Tag, Pagination } from "antd";
import type { ColumnsType } from "antd/es/table";
import { formatCurrency } from "@/lib/vnpay-utils";

const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
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
  const [stats, setStats] = useState({
    successCount: 0,
    failedCount: 0,
    totalSuccess: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const pageSize = 5;

  // Fetch statistics ONCE when mount or when need to refresh
  async function fetchAllStats() {
    let successCount = 0;
    let failedCount = 0;
    let totalSuccessAmount = 0;

    let page = 0;
    const statsPageSize = 20;
    let totalPages = 1;

    do {
      const response = await fetch(
        `/api/landlord/payment-history?page=${page}&size=${statsPageSize}`
      );
      const result = await response.json();

      const transactions = Array.isArray(result.transactions)
        ? result.transactions
        : [];
      successCount += transactions.filter((t: any) => t.status === 1).length;
      failedCount += transactions.filter((t: any) => t.status === 0).length;
      totalSuccessAmount += transactions
        .filter((t: any) => t.status === 1)
        .reduce((sum: number, t: any) => sum + t.amount, 0);

      totalPages = result.totalPages || 1;
      page++;
    } while (page < totalPages);

    setStats({
      successCount,
      failedCount,
      totalSuccess: totalSuccessAmount,
    });
  }

  // Only fetch stats when mount or when you want to refresh stats
  useEffect(() => {
    fetchAllStats();
  }, []);

  // Fetch payments for current page only
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await fetch(
          `/api/landlord/payment-history?page=${
            currentPage - 1
          }&size=${pageSize}`
        );
        const result = await response.json();

        if (result.status === "fail" || result.status === "error") {
          setPayments([]);
          setTotalRecords(0);
          return;
        }

        const allPayments = Array.isArray(result.transactions)
          ? result.transactions
          : [];
        setPayments(allPayments);
        setTotalRecords(result.totalRecords || allPayments.length);
      } catch (error) {
        console.error("Error fetching payments:", error);
        setPayments([]);
        setTotalRecords(0);
      }
    };
    fetchPayments();
  }, [currentPage, pageSize]);

  // Filter payments by status for Table
  const filteredPayments = payments.filter((p: any) => {
    if (filter === "success") return p.status === 1;
    if (filter === "failed") return p.status === 0;
    return true;
  });

  // Antd Table columns
  const columns: ColumnsType<any> = [
    {
      title: "Transaction Code",
      dataIndex: "transactionCode",
      key: "transactionCode",
      width: 180,
      render: (text: string) => (
        <span style={{ fontFamily: "monospace" }}>{text}</span>
      ),
    },
    {
      title: "Amount",
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
      title: "Bank",
      dataIndex: "bankTransactionName",
      key: "bankTransactionName",
      width: 120,
      render: (bank: string) => bank || "N/A",
    },
    {
      title: "Status",
      key: "status",
      width: 120,
      render: (_: any, record: any) => (
        <Tag color={record.status === 1 ? "green" : "red"}>
          {record.status === 1 ? "Success" : "Failed"}
        </Tag>
      ),
    },
    {
      title: "Date",
      dataIndex: "transactionDate",
      key: "transactionDate",
      width: 160,
      render: (transactionDate: string) => (
        <div>
          <div>{transactionDate ? formatDate(transactionDate) : "N/A"}</div>
        </div>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: 200,
      render: (info: string) => info || "",
    },
    // {
    //   title: "Wallet Balance",
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

  return (
    <div>
      <div className="min-h-screen py-8 bg-white dark:bg-[#001529] text-gray-900 p-8 transition-colors duration-300">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6 dark:!bg-[#22304a]">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:!text-white">
                Payment History
              </h1>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800">
                  Success
                </h3>
                <p className="text-2xl font-bold text-green-600">
                  {stats.successCount}
                </p>
                <p className="text-sm text-green-600">
                  {formatCurrency(stats.totalSuccess)}
                </p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-red-800">Failed</h3>
                <p className="text-2xl font-bold text-red-600">
                  {stats.failedCount}
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-800">Total</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {totalRecords}
                </p>
              </div>
            </div>

            {/* Filter */}
            <PaymentFilter filter={filter} setFilter={setFilter} />

            {/* Payment List */}
            <div>
              <Table
                columns={columns}
                dataSource={filteredPayments}
                pagination={false}
                rowKey="transactionCode"
                size="small"
                locale={{
                  emptyText: (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-6xl mb-4">💳</div>
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">
                        No transactions yet
                      </h3>
                      <p className="text-gray-500">
                        Payment history will be displayed here
                      </p>
                    </div>
                  ),
                }}
              />
              <div className="flex justify-end mt-4">
                <Pagination
                  current={currentPage}
                  total={totalRecords}
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
