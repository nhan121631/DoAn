"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  Tag,
  Button,
  Empty,
  Input,
  Select,
  Space,
  Card,
  Alert,
  Spin,
} from "antd";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ContractService } from "@/services/ContractService";
import { ContractData } from "@/types/types";

const statusMap: Record<number, { text: string; color: string }> = {
  0: { text: "Active", color: "green" },
  1: { text: "Terminated", color: "red" },
  2: { text: "Expired", color: "orange" },
  3: { text: "Pending", color: "blue" },
};

const MyContract: React.FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [contracts, setContracts] = useState<ContractData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<number | null>(null);

  useEffect(() => {
    const fetchContracts = async () => {
      if (status === "loading") return;

      if (!session?.user?.id) {
        setError("Please log in to view your contracts");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await ContractService.getByTenant(session.user.id);
        setContracts(data);
      } catch (err) {
        console.error("Failed to fetch contracts:", err);
        // setError("Failed to load contracts. Please try again later.");
        setContracts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, [session, status]);

  if (status === "loading" || loading) {
    return (
      <div className="flex flex-col justify-center items-center h-96 space-y-3">
        <Spin size="large" />
        <span className="text-center whitespace-nowrap">
          Loading contracts...
        </span>
      </div>
    );
  }

  // Filter contracts based on search and status
  const filteredContracts = contracts.filter((contract: ContractData) => {
    const matchesSearch =
      contract.roomTitle.toLowerCase().includes(searchText.toLowerCase()) ||
      contract.landlordName.toLowerCase().includes(searchText.toLowerCase()) ||
      contract.contractName.toLowerCase().includes(searchText.toLowerCase());

    const matchesStatus =
      statusFilter === null || contract.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const columns: ColumnsType<ContractData> = [
    {
      title: "Room",
      dataIndex: "roomTitle",
      key: "roomTitle",
      sorter: (a, b) => a.roomTitle.localeCompare(b.roomTitle),
      width: "20%",
    },
    {
      title: "Landlord",
      dataIndex: "landlordName",
      key: "landlordName",
      sorter: (a, b) => a.landlordName.localeCompare(b.landlordName),
      width: "15%",
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      key: "startDate",
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
      width: "12%",
    },
    {
      title: "End Date",
      dataIndex: "endDate",
      key: "endDate",
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: (a, b) =>
        new Date(a.endDate).getTime() - new Date(b.endDate).getTime(),
      width: "12%",
    },
    {
      title: "Rent (vnđ)",
      dataIndex: "monthlyRent",
      key: "monthlyRent",
      align: "right" as const,
      sorter: (a, b) => a.monthlyRent - b.monthlyRent,
      render: (rent: number) => `${rent.toLocaleString()} vnđ`,
      width: "12%",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: number) => {
        const s = statusMap[status];
        return <Tag color={s.color}>{s.text}</Tag>;
      },
      sorter: (a, b) => a.status - b.status,
      filters: Object.entries(statusMap).map(([key, value]) => ({
        text: value.text,
        value: parseInt(key),
      })),
      onFilter: (value, record) => record.status === value,
      width: "12%",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          type="link"
          className="text-blue-600"
          onClick={() =>
            router.push(`/user-dashboard/my-contracts/${record.id}`)
          }
        >
          View Detail
        </Button>
      ),
      width: "15%",
    },
  ];

  return (
    <div className="space-y-6">
      {error ? (
        <Alert message="Error" description={error} type="error" showIcon />
      ) : null}
      <Card
        title={<span className="text-2xl font-bold">My Contracts</span>}
        className="shadow-md"
        extra={
          <Space>
            <Input
              placeholder="Search contracts..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
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
          rowKey="id"
          columns={columns}
          dataSource={filteredContracts}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} contracts`,
            pageSizeOptions: ["5", "10", "20", "50"],
          }}
          locale={{
            emptyText: (
              <Empty
                description={
                  searchText || statusFilter !== null
                    ? "No contracts match your search criteria"
                    : "No contracts found"
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ),
          }}
          scroll={{ x: 1000 }}
          size="middle"
        />
      </Card>
    </div>
  );
};

export default MyContract;
