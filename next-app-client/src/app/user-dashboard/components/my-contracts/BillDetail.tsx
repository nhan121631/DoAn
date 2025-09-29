"use client";

import { BillData, ContractData } from "@/types/types";
import { Modal } from "antd";

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

export default function BillDetail({
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
        <div className="bg-white p-6 h-full">
          {/* Header hóa đơn */}
          <div className="text-center mb-6 border-b pb-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">RENTAL BILL</h2>
            <p className="text-gray-600">RENTAL BILL</p>
            <div className="mt-3 text-sm text-gray-500">
              <p>Ngày xuất: {new Date().toLocaleDateString('vi-VN')}</p>
              <p>Mã hóa đơn: #{selectedBill.id}</p>
            </div>
          </div>

          {/* Thông tin khách hàng */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">CUSTOMER INFORMATION</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium text-gray-600">Name: </span>
                  <p className="text-gray-800 font-bold text-lg">{contract?.tenantName}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Phone:</span>
                  <p className="text-gray-800 font-bold text-lg">{contract?.tenantPhone}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Room:</span>
                  <p className="text-gray-800">{contract?.roomTitle}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Month:</span>
                  <p className="text-gray-800 font-semibold text-red-600">{selectedBill.month}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Chi tiết hóa đơn */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">BILL DETAILS</h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Item</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="py-3 px-4 text-gray-700">
                      <div>Electricity</div>
                      {selectedBill.electricityUsage && selectedBill.electricityPrice && (
                        <div className="text-xs text-gray-500 mt-1">
                          {selectedBill.electricityUsage.toFixed(2)} kWh × {selectedBill.electricityPrice.toLocaleString('vi-VN')} đ/kWh
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-800">
                      {selectedBill.electricityFee?.toLocaleString('vi-VN')} đ
                    </td>
                  </tr>
                  <tr className="border-t bg-gray-50">
                    <td className="py-3 px-4 text-gray-700">
                      <div>Water</div>
                      {selectedBill.waterUsage && selectedBill.waterPrice && (
                        <div className="text-xs text-gray-500 mt-1">
                          {selectedBill.waterUsage.toFixed(2)} m³ × {selectedBill.waterPrice.toLocaleString('vi-VN')} đ/m³
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-800">
                      {selectedBill.waterFee?.toLocaleString('vi-VN')} đ
                    </td>
                  </tr>
                  <tr className="border-t">
                    <td className="py-3 px-4 text-gray-700">Service Fee</td>
                    <td className="py-3 px-4 text-right text-gray-800">
                      {selectedBill.serviceFee?.toLocaleString('vi-VN')} đ
                    </td>
                  </tr>
                  {selectedBill.damageFee != null && selectedBill.damageFee > 0 && (
                    <tr className="border-t bg-red-50">
                      <td className="py-3 px-4 text-red-700">Other Fee</td>
                      <td className="py-3 px-4 text-right text-red-800">
                        {selectedBill.damageFee.toLocaleString('vi-VN')} đ
                      </td>
                    </tr>
                  )}
                  <tr className="border-t border-gray-300 bg-blue-50">
                    <td className="py-4 px-4 font-bold text-lg text-gray-800">TOTAL</td>
                    <td className="py-4 px-4 text-right font-bold text-lg text-blue-600">
                      {selectedBill.totalAmount?.toLocaleString('vi-VN')} đ
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>


          {/* Footer */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-2">
              Thank you for trusting and using our services!
            </p>
            <p className="text-xs text-gray-400">
              Please pay on time. Contact: {contract?.landlordName}
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
}
