"use client";
import React, { useState } from "react";
import {
  Table,
  Tag,
  Button,
  Space,
  Input,
  Popconfirm,
  message,
  Tooltip,
} from "antd";
import Link from "next/link";
import { ContractData, InvoiceFormValues } from "@/types/types";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  FilePdfOutlined,
} from "@ant-design/icons";
import InvoiceExportModal from "./InvoiceExportModal";

interface LandlordContractsProps {
  contracts: ContractData[];
}

const statusMap: Record<number, { text: string; color: string }> = {
  0: { text: "Active", color: "green" },
  1: { text: "Terminated", color: "volcano" },
  2: { text: "Expired", color: "gray" },
  3: { text: "Pending", color: "blue" },
};

const LandlordContracts: React.FC<LandlordContractsProps> = ({ contracts }) => {
  const [search, setSearch] = useState("");
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [contractToExport, setContractToExport] = useState<ContractData | null>(
    null
  );

  const handleEdit = (record: ContractData) => {
    message.info(`Edit contract ${record.id}`);
  };

  const handleDelete = (record: ContractData) => {
    message.success(`Deleted contract ${record.id}`);
  };

  const handleOpenExportModal = (record: ContractData) => {
    setContractToExport(record);
    setIsInvoiceModalOpen(true);
  };

  const handleExportSubmit = async (values: InvoiceFormValues) => {
    if (!contractToExport) return;
    try {
      console.log("Export invoice for contract:", contractToExport.id, values);
      message.success(`Invoice exported for contract ${contractToExport.id}`);
    } catch (err) {
      message.error("Export invoice failed!");
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
      render: (amount: number) =>
        amount ? amount.toLocaleString() + " ₫" : "-",
      sorter: (a: ContractData, b: ContractData) =>
        (a.depositAmount || 0) - (b.depositAmount || 0),
    },
    {
      title: "Rent",
      dataIndex: "monthlyRent",
      key: "monthlyRent",
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
        <Tag color={statusMap[status]?.color}>
          {statusMap[status]?.text}
        </Tag>
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
          <Tooltip title="Export Invoice">
            <Button
              type="text"
              icon={<FilePdfOutlined />}
              onClick={() => handleOpenExportModal(record)}
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

  const filteredContracts = contracts.filter(
    (c) =>
      c.roomTitle?.toLowerCase().includes(search.toLowerCase()) ||
      c.contractName?.toLowerCase().includes(search.toLowerCase()) ||
      c.tenantName?.toLowerCase().includes(search.toLowerCase()) ||
      c.tenantPhone?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Contract Management</h2>
        <Input.Search
          placeholder="Search contracts..."
          style={{ width: 280 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Table
        columns={columns}
        dataSource={filteredContracts}
        rowKey="id"
        pagination={{ pageSize: 8 }}
      />

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
