/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";

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

interface PaymentTableProps {
  payments: any[];
  columns?: ColumnsType<any>;
}

const defaultColumns: ColumnsType<any> = [
  {
    title: "Mã giao dịch",
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
    render: (amount: number, record: any) => (
      <span
        style={{
          color:
            record.transactionType === 0
              ? "#ef4444"
              : record.transactionType === 3
              ? "#f59e42"
              : "#2563eb",
          fontWeight: 600,
        }}
      >
        {amount.toLocaleString()}₫
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
    title: "Ngày",
    dataIndex: "transactionDate",
    key: "transactionDate",
    width: 160,
    render: (transactionDate: string) => formatDate(transactionDate),
  },
  {
    title: "Mô tả",
    dataIndex: "description",
    key: "description",
    width: 200,
    render: (info: string) => info || "",
  },
];

function PaymentTable({ payments, columns }: PaymentTableProps) {
  return (
    <Table
      columns={columns || defaultColumns}
      dataSource={payments}
      pagination={false}
      rowKey="transactionCode"
      size="small"
      locale={{
        emptyText: (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">💳</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Chưa có giao dịch
            </h3>
            <p className="text-gray-500">
              Lịch sử thanh toán sẽ được hiển thị tại đây
            </p>
          </div>
        ),
      }}
    />
  );
}
export default PaymentTable;
