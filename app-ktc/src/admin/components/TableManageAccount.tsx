import React, { useState, useEffect, useCallback } from "react";
import { Table, Select, Tag, Button, Popconfirm, message, Space } from "antd";
import type { TableColumnsType, TablePaginationConfig } from "antd";
import type { UserResponseDto } from "../types/type";
import {
  fetchAccounts,
  updateAccountStatus,
  updateAccountRoles,
} from "../service/AccountService";

const { Option } = Select;

const TableManageAccount: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [accountsData, setAccountsData] = useState<UserResponseDto[]>([]);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [tempAuth, setTempAuth] = useState<string | null>(null);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 5,
    total: 0,
  });

  const loadAccounts = useCallback(async (page = 0, pageSize = 5) => {
    setLoading(true);
    try {
      const response = await fetchAccounts(page, pageSize);
      
      setAccountsData(response.content);
      setPagination({
        current: response.page + 1, // Backend starts from 0, Ant Design from 1
        pageSize: response.size,
        total: response.totalElements,
      });
      
      message.success(`Loaded ${response.content.length} of ${response.totalElements} accounts.`);
    } catch (error: any) {
      console.error("❌ Error loading accounts:", error);
      message.error(error?.message || "Error loading accounts");
      setAccountsData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const handleTableChange = (newPagination: TablePaginationConfig) => {
    // Convert to 0-based for backend
    const backendPage = (newPagination.current || 1) - 1;
    loadAccounts(backendPage, newPagination.pageSize);
  };

  const toggleStatus = async (record: UserResponseDto) => {
    // Correct mapping with backend
    const newStatusNumber = record.status === "Active" ? 1 : 0;
    const newStatusText = newStatusNumber === 1 ? "Disabled" : "Active"; // toggle text

    try {
      await updateAccountStatus(record.id, newStatusNumber);

      setAccountsData(prev =>
        prev.map(acc =>
          acc.id === record.id ? { ...acc, status: newStatusText } : acc
        )
      );

      message.success(
        `Account has been ${newStatusNumber === 0 ? "unlocked" : "disabled"}`
      );
    } catch (error: any) {
      message.error(error?.message || "Failed to update status");
    }
  };

  const saveAuthorization = async (record: UserResponseDto) => {
    if (!tempAuth) {
      message.warning("Please select a role.");
      return;
    }
    try {
      await updateAccountRoles(record.id, [tempAuth]);

      // ✅ Update local state, no need to refetch
      setAccountsData(prev =>
        prev.map(acc =>
          acc.id === record.id ? { ...acc, roles: [tempAuth] } : acc
        )
      );

      message.success("Authorization updated successfully!");
      setEditingKey(null);
      setTempAuth(null);
    } catch (error: any) {
      message.error(error?.message || "Failed to update authorization");
    }
  };

  const columns: TableColumnsType<UserResponseDto> = [
    {
      title: "Username",
      dataIndex: "username",
      width: "15%",
      sorter: (a, b) => a.username.localeCompare(b.username),
    },
    {
      title: "Email",
      dataIndex: "email",
      width: "20%",
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    { title: "Phone Number", dataIndex: "phoneNumber", width: "15%" },
    {
      title: "Status",
      dataIndex: "status",
      width: "10%",
      render: (val: string) =>
        val === "Active" ? (
          <Tag color="green">Active</Tag>
        ) : (
          <Tag color="red">Disabled</Tag>
        ),
    },
    {
      title: "Authorization",
      dataIndex: "roles",
      width: "20%",
      render: (roles, record) => {
        const isEditing = editingKey === record.id;
        const currentRole = roles?.[0] || "Users";
        return isEditing ? (
          <Space>
            <Select
              value={tempAuth || currentRole}
              onChange={setTempAuth}
              style={{ width: 120 }}
            >
              <Option value="Users">User</Option>
              <Option value="Landlords">Landlord</Option>
            </Select>
            <Button
              type="primary"
              size="small"
              onClick={() => saveAuthorization(record)}
            >
              Save
            </Button>
            <Button size="small" onClick={() => setEditingKey(null)}>
              Cancel
            </Button>
          </Space>
        ) : (
          <span
            onClick={() => {
              setEditingKey(record.id);
              setTempAuth(currentRole);
            }}
            style={{ cursor: "pointer" }}
          >
            {roles.map((r) => (
              <Tag
                key={r}
                color={r === "Landlords" ? "blue" : "default"}
              >
                {r}
              </Tag>
            ))}
          </span>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      width: "15%",
      render: (_, record) =>
        record.status === "Active" ? (
          <Popconfirm
            title="Disable this account?"
            onConfirm={() => toggleStatus(record)}
          >
            <Button danger type="primary" size="small">
              Disable
            </Button>
          </Popconfirm>
        ) : (
          <Button
            type="primary"
            size="small"
            onClick={() => toggleStatus(record)}
          >
            Unlock
          </Button>
        ),
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <Table
        columns={columns}
        dataSource={accountsData}
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
        rowKey="id"
      />
    </div>
  );
};

export default TableManageAccount;