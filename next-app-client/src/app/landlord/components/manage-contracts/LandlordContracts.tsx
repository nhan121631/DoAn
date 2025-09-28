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
  0: { text: "Active", color: "green" },
  1: { text: "Terminated", color: "volcano" },
  2: { text: "Expired", color: "gray" },
  3: { text: "Pending", color: "blue" },
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
      messageApi.success(
        `Deleted contract ${record.contractName} successfully`
      );
      // Call the callback to refresh data
      if (onContractDeleted) {
        onContractDeleted();
      }
    } catch (error) {
      console.error("Error deleting contract:", error);
      messageApi.error(
        error instanceof Error
          ? error.message
          : "Failed to delete contract. Please try again."
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
      messageApi.success(
        `Invoice exported for contract ${contractToExport.id}`
      );
    } catch (err) {
      messageApi.error("Export invoice failed!");
    } finally {
      setIsInvoiceModalOpen(false);
      setContractToExport(null);
    }
  };

  const columns = [
    {
      title: "Contract Name",
      dataIndex: "contractName",
      key: "contractName",
      sorter: (a: ContractData, b: ContractData) =>
        a.contractName.localeCompare(b.contractName),
    },
    {
      title: "Tenant",
      dataIndex: "tenantName",
      key: "tenantName",
      sorter: (a: ContractData, b: ContractData) =>
        a.tenantName.localeCompare(b.tenantName),
    },
    {
      title: "Phone",
      dataIndex: "tenantPhone",
      key: "tenantPhone",
    },
    {
      title: "Start",
      dataIndex: "startDate",
      key: "startDate",
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: (a: ContractData, b: ContractData) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    },
    {
      title: "End",
      dataIndex: "endDate",
      key: "endDate",
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: (a: ContractData, b: ContractData) =>
        new Date(a.endDate).getTime() - new Date(b.endDate).getTime(),
    },
    {
      title: "Deposit",
      dataIndex: "depositAmount",
      key: "depositAmount",
      align: "right" as const,
      render: (amount: number) =>
        amount ? amount.toLocaleString() + " ₫" : "-",
      sorter: (a: ContractData, b: ContractData) =>
        (a.depositAmount || 0) - (b.depositAmount || 0),
    },
    {
      title: "Rent",
      dataIndex: "monthlyRent",
      key: "monthlyRent",
      align: "right" as const,
      render: (amount: number) =>
        amount ? amount.toLocaleString() + " ₫/month" : "-",
      sorter: (a: ContractData, b: ContractData) =>
        (a.monthlyRent || 0) - (b.monthlyRent || 0),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: number) => (
        <Tag color={statusMap[status]?.color}>{statusMap[status]?.text}</Tag>
      ),
      sorter: (a: ContractData, b: ContractData) => a.status - b.status,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: ContractData) => (
        <Space>
          <Tooltip title="View Details">
            <Link href={`/landlord/manage-contracts/${record.id}`}>
              <Button type="text" icon={<EyeOutlined />} />
            </Link>
          </Tooltip>
          <Tooltip title="Edit Contract">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>

          <Tooltip title="Delete Contract">
            <Popconfirm
              title="Are you sure delete this contract?"
              onConfirm={() => handleDelete(record)}
              okText="Yes"
              cancelText="No"
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
          Contract Management
        </h2>
      </div>
      <Card
        title={
          <span className="text-gray-900 dark:text-white">
            Manage your rental contracts and agreements
          </span>
        }
        className="shadow-md bg-white dark:bg-[#22304a] border-gray-200 dark:border-gray-600 transition-colors duration-300"
        extra={
          <Space>
            <Input
              placeholder="Search contracts..."
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 200 }}
              allowClear
            />
            <Select
              placeholder="Filter by status"
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
              `${range[0]}-${range[1]} of ${total} contracts`,
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
