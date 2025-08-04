"use client";

import React from "react";

interface PaymentFilterProps {
  filter: "all" | "success" | "failed";
  setFilter: (filter: "all" | "success" | "failed") => void;
}

export default function PaymentFilter({
  filter,
  setFilter,
}: PaymentFilterProps) {
  return (
    <div className="flex gap-2 mb-6">
      {(["all", "success", "failed"] as const).map((filterType) => (
        <button
          key={filterType}
          onClick={() => setFilter(filterType)}
          className={`px-4 py-2 rounded transition ${
            filter === filterType
              ? "bg-blue-600 !text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {filterType === "all" && "Tất cả"}
          {filterType === "success" && "Thành công"}
          {filterType === "failed" && "Thất bại"}
        </button>
      ))}
    </div>
  );
}
