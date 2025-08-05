import React from "react";
import { formatCurrency } from "@/lib/vnpay-utils";

interface PaymentStatsProps {
  stats: {
    successCount: number;
    failedCount: number;
    totalSuccess: number;
  };
  totalRecords: number;
}

const PaymentStats: React.FC<PaymentStatsProps> = ({ stats, totalRecords }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-green-800">Success</h3>
      <p className="text-2xl font-bold text-green-600">{stats.successCount}</p>
      <p className="text-sm text-green-600">{formatCurrency(stats.totalSuccess)}</p>
    </div>
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-red-800">Failed</h3>
      <p className="text-2xl font-bold text-red-600">{stats.failedCount}</p>
    </div>
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-blue-800">Total</h3>
      <p className="text-2xl font-bold text-blue-600">{totalRecords}</p>
    </div>
  </div>
);

export default PaymentStats;