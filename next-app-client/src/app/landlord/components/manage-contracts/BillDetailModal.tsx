/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import React from "react";
import { Modal, Tag } from "antd";
import { BillData, ContractData } from "@/types/types";

interface BillDetailModalProps {
  open: boolean;
  selectedBill: BillData | null;
  contract: ContractData | null;
  onClose: () => void;
}

const billStatusMap = {
  1: { text: "PAID", color: "green" },
  0: { text: "UNPAID", color: "red" },
};

export default function BillDetailModal({
  open,
  selectedBill,
  contract,
  onClose,
}: BillDetailModalProps) {
  return (
    <Modal
      open={open}
      title={null}
      onCancel={onClose}
      footer={null}
      width={600}
      className="bill-modal"
    >
      {selectedBill && (
        <div className="bg-white dark:bg-[#001529] p-6 h-full transition-colors duration-300">
          {/* Header hóa đơn */}
          <div className="text-center mb-6 border-b dark:border-gray-600 pb-4 transition-colors duration-300">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 transition-colors duration-300">
              RENTAL BILL
            </h2>
            <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
              RENTAL BILL
            </p>
            <div className="mt-3 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
              <p>Ngày xuất: {new Date().toLocaleDateString("vi-VN")}</p>
              <p>Mã hóa đơn: #{selectedBill.id}</p>
            </div>
          </div>

          {/* Thông tin khách hàng */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-200 transition-colors duration-300">
              CUSTOMER INFORMATION
            </h3>
            <div className="bg-gray-50 dark:bg-[#22304a] p-4 rounded-lg transition-colors duration-300">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium text-gray-600 dark:text-gray-300 transition-colors duration-300">
                    Name:{" "}
                  </span>
                  <p className="text-gray-800 dark:text-white font-bold text-lg transition-colors duration-300">
                    {contract?.tenantName}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-600 dark:text-gray-300 transition-colors duration-300">
                    Phone:
                  </span>
                  <p className="text-gray-800 dark:text-white font-bold text-lg transition-colors duration-300">
                    {contract?.tenantPhone}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-600 dark:text-gray-300 transition-colors duration-300">
                    Room:
                  </span>
                  <p className="text-gray-800 dark:text-white transition-colors duration-300">
                    {contract?.roomTitle}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-600 dark:text-gray-300 transition-colors duration-300">
                    Month:
                  </span>
                  <p className="text-gray-800 dark:text-white font-semiboldtransition-colors duration-300">
                    {selectedBill.month}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Chi tiết hóa đơn */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-200 transition-colors duration-300">
              BILL DETAILS
            </h3>
            <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden transition-colors duration-300">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-[#17223b] transition-colors duration-300">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-200 transition-colors duration-300">
                      Item
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-200 transition-colors duration-300">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t dark:border-gray-600 transition-colors duration-300">
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300 transition-colors duration-300">
                      Electricity
                    </td>
                    <td className="py-3 px-4 text-right text-gray-800 dark:text-white transition-colors duration-300">
                      {selectedBill.electricityFee?.toLocaleString("vi-VN")} đ
                    </td>
                  </tr>
                  <tr className="border-t dark:border-gray-600 bg-gray-50 dark:bg-[#22304a] transition-colors duration-300">
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300 transition-colors duration-300">
                      Water
                    </td>
                    <td className="py-3 px-4 text-right text-gray-800 dark:text-white transition-colors duration-300">
                      {selectedBill.waterFee?.toLocaleString("vi-VN")} đ
                    </td>
                  </tr>
                  <tr className="border-t dark:border-gray-600 transition-colors duration-300">
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300 transition-colors duration-300">
                      Service Fee
                    </td>
                    <td className="py-3 px-4 text-right text-gray-800 dark:text-white transition-colors duration-300">
                      {selectedBill.serviceFee?.toLocaleString("vi-VN")} đ
                    </td>
                  </tr>
                  {selectedBill.damageFee != null &&
                    selectedBill.damageFee > 0 && (
                      <tr className="border-t dark:border-gray-600 bg-red-50 dark:bg-red-900/20 transition-colors duration-300">
                        <td className="py-3 px-4 text-red-700 dark:text-red-300 font-medium transition-colors duration-300">
                          Other Fees
                        </td>
                        <td className="py-3 px-4 text-right text-red-800 dark:text-red-200 font-medium transition-colors duration-300">
                          {selectedBill.damageFee?.toLocaleString("vi-VN")} đ
                        </td>
                      </tr>
                    )}
                  {selectedBill.note && (
                    <tr className="border-t dark:border-gray-600 bg-yellow-50 dark:bg-yellow-900/20 transition-colors duration-300">
                      <td className="py-3 px-4 text-yellow-700 dark:text-yellow-300 font-medium transition-colors duration-300">
                        Note
                      </td>
                      <td className="py-3 px-4 text-left text-yellow-800 dark:text-yellow-200 font-medium transition-colors duration-300">
                        {selectedBill.note}
                      </td>
                    </tr>
                  )}
                  <tr className="border-t dark:border-gray-600 border-gray-300 bg-blue-50 dark:bg-[#17223b] transition-colors duration-300">
                    <td className="py-4 px-4 font-bold text-lg text-gray-800 dark:text-white transition-colors duration-300">
                      TOTAL
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-lg text-blue-600 dark:text-blue-400 transition-colors duration-300">
                      {selectedBill.totalAmount?.toLocaleString("vi-VN")} đ
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-600 transition-colors duration-300">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 transition-colors duration-300">
              Thank you for trusting and using our services!
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 transition-colors duration-300">
              Please pay on time. Contact: {contract?.landlordName}
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
}
