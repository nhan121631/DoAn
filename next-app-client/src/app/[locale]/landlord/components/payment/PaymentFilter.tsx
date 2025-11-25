"use client";

import { message } from "antd";
import React, { useEffect } from "react";

interface PaymentFilterProps {
  filter: "all" | "success" | "failed";
  setFilter: (filter: "all" | "success" | "failed") => void;
  startDate: string;
  endDate: string;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  onFilter: () => void;
}

export default function PaymentFilter({
  filter,
  setFilter,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  onFilter,
}: PaymentFilterProps) {
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end < start) {
        messageApi.error({
          content: "End date must be after or equal to start date!",
          duration: 3,
        });
        return;
      }
    }
    onFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  return (
    <>
      {contextHolder}
      <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 p-4 bg-gray-50 rounded-lg shadow-sm dark:!bg-[#1c283e]">
        <div className="flex gap-2 flex-wrap dark:!text-white">
          {(["all", "success", "failed"] as const).map((filterType) => (
            <button
              key={filterType}
              onClick={() => {
                setFilter(filterType);
                onFilter();
              }}
              className={`px-4 py-2 rounded font-semibold transition-all duration-150 shadow-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:!border-gray-600 dark:!focus:ring-blue-500 ${
                filter === filterType
                  ? "bg-blue-600 !text-white border-blue-600 dark:!bg-blue-500 dark:!text-white"
                  : "bg-white text-gray-700 hover:bg-blue-50 dark:!bg-[#22304a] dark:!text-white"
              }`}
            >
              {filterType === "all" && "All"}
              {filterType === "success" && "Success"}
              {filterType === "failed" && "Failed"}
            </button>
          ))}
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <label className="text-sm font-medium text-gray-700 dark:!text-white">
            Start date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-gray-700 dark:!bg-[#22304a] dark:!text-white"
          />
          <label className="text-sm font-medium text-gray-700 dark:!text-white">End date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-gray-700 dark:!bg-[#22304a] dark:!text-white"
          />
          <button
            type="button"
            onClick={() => {
              setStartDate("");
              setEndDate("");
            }}  
            className="ml-2 px-3 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 font-medium border border-gray-300 dark:!bg-[#2c3e50] dark:!text-white dark:!hover:bg-[#34495e] transition-colors duration-150"
          >
            Reset
          </button>
        </div>
      </div>
    </>
  );
}
