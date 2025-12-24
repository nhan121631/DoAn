/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";
import { ContractData, InvoiceFormValues } from "@/types/types";
import { ContractService } from "@/services/ContractService";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FilterOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Input,
  message,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
} from "antd";
import Link from "next/link";
import React, { useState } from "react";
import InvoiceExportModal from "./InvoiceExportModal";

interface LandlordContractsProps {
  contracts: ContractData[];
  onContractDeleted?: () => void;
}

const statusMap: Record<number, { text: string; color: string }> = {
  0: { text: "Hoạt động", color: "green" },
  1: { text: "Đã chấm dứt", color: "volcano" },
  2: { text: "Hết hạn", color: "gray" },
  3: { text: "Đang chờ", color: "blue" },
};

const LandlordContracts: React.FC<LandlordContractsProps> = ({
  contracts,
  onContractDeleted,
}) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<number | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [contractToExport, setContractToExport] = useState<ContractData | null>(
    null
  );
  const [messageApi, contextHolder] = message.useMessage();

  const handleEdit = (record: ContractData) => {
    // Navigate to contract detail page with edit mode
    window.location.href = `/landlord/manage-contracts/${record.id}?tab=overview&edit=true`;
  };

  const handleDelete = async (record: ContractData) => {
    try {
      await ContractService.deleteContract(record.id);
      messageApi.success(`Đã xóa hợp đồng ${record.contractName} thành công`);
      // Call the callback to refresh data
      if (onContractDeleted) {
        onContractDeleted();
      }
    } catch (error) {
      console.error("Lỗi khi xóa hợp đồng:", error);
      messageApi.error(
        error instanceof Error
          ? error.message
          : "Xóa hợp đồng thất bại. Vui lòng thử lại."
      );
    }
  };

  const handleOpenExportModal = (record: ContractData) => {
    setContractToExport(record);
    setIsInvoiceModalOpen(true);
  };

  const handleExportSubmit = async (values: InvoiceFormValues) => {
    if (!contractToExport) return;
    try {
      console.log("Export invoice for contract:", contractToExport.id, values);
      messageApi.success(`Đã xuất hóa đơn cho hợp đồng ${contractToExport.id}`);
    } catch (err) {
      messageApi.error("Xuất hóa đơn thất bại!");
    } finally {
      setIsInvoiceModalOpen(false);
      setContractToExport(null);
    }
  };

  const columns = [
    {
      title: "Tên hợp đồng",
      dataIndex: "contractName",
      key: "contractName",
      sorter: (a: ContractData, b: ContractData) =>
        a.contractName.localeCompare(b.contractName),
    },
    {
      title: "Người thuê",
      dataIndex: "tenantName",
      key: "tenantName",
      sorter: (a: ContractData, b: ContractData) =>
        a.tenantName.localeCompare(b.tenantName),
    },
    {
      title: "Số điện thoại",
      dataIndex: "tenantPhone",
      key: "tenantPhone",
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "startDate",
      key: "startDate",
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: (a: ContractData, b: ContractData) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "endDate",
      key: "endDate",
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: (a: ContractData, b: ContractData) =>
        new Date(a.endDate).getTime() - new Date(b.endDate).getTime(),
    },
    {
      title: "Đặt cọc",
      dataIndex: "depositAmount",
      key: "depositAmount",
      align: "right" as const,
      render: (amount: number) =>
        amount ? amount.toLocaleString() + " ₫" : "-",
      sorter: (a: ContractData, b: ContractData) =>
        (a.depositAmount || 0) - (b.depositAmount || 0),
    },
    {
      title: "Giá thuê",
      dataIndex: "monthlyRent",
      key: "monthlyRent",
      align: "right" as const,
      render: (amount: number) =>
        amount ? amount.toLocaleString() + " ₫/tháng" : "-",
      sorter: (a: ContractData, b: ContractData) =>
        (a.monthlyRent || 0) - (b.monthlyRent || 0),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: number) => (
        <Tag color={statusMap[status]?.color}>{statusMap[status]?.text}</Tag>
      ),
      sorter: (a: ContractData, b: ContractData) => a.status - b.status,
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_: any, record: ContractData) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Link href={`/landlord/manage-contracts/${record.id}`}>
              <Button type="text" icon={<EyeOutlined />} />
            </Link>
          </Tooltip>

          {/* <Tooltip title="Chỉnh sửa hợp đồng">
            <Button
              type="text"
              icon={<EditOutlined />}
              disabled={record.status !== 0}
              onClick={() => handleEdit(record)}
            />
          </Tooltip> */}
          <Tooltip title="Xóa hợp đồng">
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa hợp đồng này?"
              onConfirm={() => handleDelete(record)}
              okText="Có"
              cancelText="Không"
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const filteredContracts = contracts.filter((contract: ContractData) => {
    const matchesSearch =
      contract.roomTitle?.toLowerCase().includes(search.toLowerCase()) ||
      contract.contractName?.toLowerCase().includes(search.toLowerCase()) ||
      contract.tenantName?.toLowerCase().includes(search.toLowerCase()) ||
      contract.tenantPhone?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === null ||
      statusFilter === undefined ||
      contract.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {contextHolder}
      <div className="mb-4">
        <h2 className="text-2xl font-semibold dark:!text-white">
          Quản lý hợp đồng
        </h2>
      </div>
      <Card
        title={
          <span className="text-gray-900 dark:text-white">
            Quản lý hợp đồng và thỏa thuận cho thuê
          </span>
        }
        className="shadow-md bg-white dark:bg-[#22304a] border-gray-200 dark:border-gray-600 transition-colors duration-300"
        extra={
          <Space>
            <Input
              placeholder="Tìm kiếm hợp đồng..."
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 200 }}
              allowClear
            />
            <Select
              placeholder="Lọc theo trạng thái"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 150 }}
              allowClear
              suffixIcon={<FilterOutlined />}
            >
              {Object.entries(statusMap).map(([key, value]) => (
                <Select.Option key={key} value={parseInt(key)}>
                  <Tag color={value.color}>{value.text}</Tag>
                </Select.Option>
              ))}
            </Select>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredContracts}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} hợp đồng`,
            pageSizeOptions: ["5", "10", "20", "50"],
          }}
          size="middle"
        />
      </Card>

      {/* Modal Export Invoice */}
      <InvoiceExportModal
        open={isInvoiceModalOpen}
        onCancel={() => setIsInvoiceModalOpen(false)}
        onSubmit={handleExportSubmit}
        contractToExport={contractToExport}
      />
    </div>
  );
};

export default LandlordContracts;
