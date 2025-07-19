"use client";

import { useState } from "react";

export default function PaymentFilter() {
  const [filter, setFilter] = useState<"all" | "success" | "failed">("all");
  return (
    <div className="flex gap-2 mb-6">
      {(["all", "success", "failed"] as const).map((filterType) => (
        <button
          key={filterType}
          onClick={() => setFilter(filterType)}
          className={`px-4 py-2 rounded transition ${
            filter === filterType
              ? "bg-blue-600 text-white"
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
