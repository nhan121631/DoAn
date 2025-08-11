/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from "react";
import { Table, Tag, Button, Popconfirm, message, Dropdown } from "antd";
import { DownOutlined, UserOutlined } from "@ant-design/icons";
import type { MenuProps, TableColumnsType } from "antd";
import type { UserResponseDto } from "../types/type";

const TableManageAccount: React.FC = () => {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [tempAuth, setTempAuth] = useState<string | null>(null);

  const { data = [], isLoading } = useQuery(getAccountsQueryOptions());

  // const loadAccounts = useCallback(async () => {
  //   setLoading(true);
  //   try {
  //     const responseData = await fetchAccounts();

  const toggleStatus = useCallback(
    async (record: UserResponseDto) => {
      setLoading(true);
      try {
        const newStatus = record.status === "Active" ? 1 : 0;
        await updateAccountStatus(record.id, newStatus);
        message.success("Cập nhật trạng thái thành công!");
        await loadAccounts();
      } catch (error: any) {
        console.error("Lỗi khi cập nhật trạng thái:", error);
        message.error(error?.message || "Cập nhật trạng thái thất bại!");
      } finally {
        setLoading(false);
      }
    },
    [loadAccounts]
  );

  const columns: TableColumnsType<UserResponseDto> = [
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone Number",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    
    {
      title: "Roles",
      dataIndex: "roles",
      key: "roles",
      render: (roles, record) => {
        const currentRole = roles[0];

        const items: MenuProps["items"] = [
          {
            label: "Landlords",
            key: "Landlords",
            icon: <UserOutlined />,
          },
          {
            label: "Users",
            key: "Users",
            icon: <UserOutlined />,
          },
        ];

        const handleMenuClick: MenuProps["onClick"] = async (e) => {
          setLoading(true);
          try {
            await updateAccountRoles(record.id, [e.key]);
            message.success("Cập nhật vai trò thành công!");
            // setEditingKey(null);
            await loadAccounts();
          } catch (error: any) {
            message.error(error?.message || "Cập nhật vai trò thất bại!");
          } finally {
            setLoading(false);
          }
        };

        return (
          <Dropdown.Button
            menu={{ items, onClick: handleMenuClick }}
            placement="bottom"
            icon={<DownOutlined />}
            onClick={e => e.preventDefault()}
            disabled={loading}
            // type="primary"
          >
            {currentRole}
          </Dropdown.Button>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "Active" ? "green" : "red"}>{status}</Tag>
      ),
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
            okText="Yes"
            cancelText="No"
          >
            <Button danger type="primary" size="small">
              Disable
            </Button>
          </Popconfirm>
        ) : (
          <Button
            type="primary"
            size="small"
            // onClick={() => toggleStatus(record)}
          >
            Activate
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
        pagination={{ pageSize: 5 }}
        rowKey="id"
      />
    </div>
  );
};

export default TableManageAccount;