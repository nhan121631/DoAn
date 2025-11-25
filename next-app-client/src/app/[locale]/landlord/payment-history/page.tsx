/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import PaymentStats from "../components/payment-history/PaymentStats";
import PaymentTable from "../components/payment-history/PaymentTable";
import PaymentPagination from "../components/payment-history/PaymentPagination";
import PaymentFilter from "../components/payment/PaymentFilter";
import { redirect } from "next/navigation";
import { getTransactionsByUserIdPaginated, getTransactionsByUserIdAndDateRange } from "@/services/PaymentServive";

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [filter, setFilter] = useState<"all" | "success" | "failed">("all");
  const [stats, setStats] = useState({
    successCount: 0,
    failedCount: 0,
    totalIn: 0,
    totalOut: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const pageSize = 5;
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const fetchAllStats = async () => {
      let successCount = 0;
      let failedCount = 0;
      let totalIn = 0; // tiền vào
      let totalOut = 0; // tiền ra

      let page = 0;
      const statsPageSize = 20;

      while (true) {
        const response = await fetch(
          `/api/landlord/payment-history?page=${page}&size=${statsPageSize}`
        );
        const result = await response.json();

        if (result.forbidden) {
          redirect("/auth/login");
          return;
        }

        const transactions = Array.isArray(result.transactions)
          ? result.transactions
          : [];
          // console.log("Transactions:", transactions);
        transactions.forEach((t: any) => {
          if (t.status === 1) {
            successCount++;
            if (t.transactionType == 1) totalIn += t.amount;
            if (t.transactionType == 0) totalOut += t.amount;
          } else if (t.status === 0) {
            failedCount++;
          }
        });

        const totalPages = result.totalPages || 1;
        page++;
        if (page >= totalPages) break;
      }

      setStats({ successCount, failedCount, totalIn, totalOut });
    };

    fetchAllStats();
  }, []);

  useEffect(() => {
    const fetchPayments = async () => {
      // Nếu có ngày lọc thì gọi API lọc, ngược lại gọi API phân trang bình thường
      let result;
      if (startDate && endDate) {
        result = await getTransactionsByUserIdAndDateRange(
          startDate,
          endDate,
          currentPage - 1,
          pageSize
        );
      } else {
        result = await getTransactionsByUserIdPaginated(
          currentPage - 1,
          pageSize
        );
      }

      if (result.status === "fail" || result.status === "error") {
        setPayments([]);
        setTotalRecords(0);
        return;
      }

      const transactions = Array.isArray(result.transactions)
        ? result.transactions
        : [];

      setPayments(transactions);
      setTotalRecords(result.totalRecords || transactions.length);
    };

    fetchPayments();
  }, [currentPage, pageSize, startDate, endDate]);

  const filteredPayments = payments.filter((p) =>
    filter === "success"
      ? Number(p.status) === 1
      : filter === "failed"
      ? Number(p.status) === 0
      : true
  );

  return (
    <div className="min-h-screen py-8 bg-white dark:bg-[#001529] text-gray-900 p-8 transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 dark:!bg-[#22304a]">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:!text-white">
              Payment History
            </h1>
          </div>

          <PaymentStats stats={stats} totalRecords={totalRecords} />
          <PaymentFilter
            filter={filter}
            setFilter={setFilter}
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
            onFilter={() => setCurrentPage(1)}
          />
          <PaymentTable payments={filteredPayments} />
          <PaymentPagination
            currentPage={currentPage}
            totalRecords={totalRecords}
            pageSize={pageSize}
            onChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}
