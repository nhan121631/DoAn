/* eslint-disable @typescript-eslint/no-explicit-any */
import { DownOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import type {  TableColumnsType } from "antd";
import { Button, Dropdown, message, Popconfirm, Table, Tag } from "antd";
import React, { useState } from "react";
import {
  getPaginatedAccountsQueryOptions,
  useUpdateAccountRoles,
  useUpdateAccountStatus,
} from "../service/ReactQueryAccount";
import type { UserResponseDto } from "../types/type";

const TableManageAccount: React.FC = () => {
  const [pagination, setPagination] = useState({
    page: 0,
    pageSize: 7,
  });

  const { data, isLoading } = useQuery(getPaginatedAccountsQueryOptions(pagination.page, pagination.pageSize));
  const accountsData = data?.data || [];
  const totalRecords = data?.totalRecords || 0;

  const [messageApi, contextHolder] = message.useMessage();
  const updateRoleMutation = useUpdateAccountRoles({
    mutationConfig: {
      onSuccess: () => {
        messageApi.success({
          content: "You updated the account roles successfully!",
          duration: 3,
        });
      },
      onError: (error: any) => {
        messageApi.error({
          content:
            error?.response?.data?.message?.join(", ") ||
            "An error has occurred!",
          duration: 3,
        });
      },
    },
  });

  const updateStatusMutation = useUpdateAccountStatus({
    mutationConfig: {
      onSuccess: () => {
        messageApi.success({
          content: "You updated the account status successfully!",
          duration: 3,
        });
      },
      onError: (error: any) => {
        messageApi.error({
          content:
            error?.response?.data?.message?.join(", ") ||
            "An error has occurred!",
          duration: 3,
        });
      },
    },
  });

  

  const toggleStatus = (record: UserResponseDto) => {
    const newStatus = record.status === "Active" ? 1 : 0;
    updateStatusMutation.mutate({ id: record.id, status: newStatus });
  };

  const updateRoleHandler = (record: UserResponseDto, roleName: string) => {
    updateRoleMutation.mutate({ id: record.id, roleNames: [roleName] });
  };
  
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
        const items = [
          {
            label: "Landlords",
            key: "Landlords",
          },
          {
            label: "Users",
            key: "Users",
          },
        ];

        const currentRole = roles?.[0] || "";
        return (
          <Dropdown.Button
            menu={{
              items,
              onClick: (e) => updateRoleHandler(record, e.key),
            }}
            placement="bottom"
            icon={<DownOutlined />}
            onClick={(e) => e.preventDefault()}
            disabled={updateRoleMutation.isPending || isLoading}
          >
            <span>{currentRole}</span>
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
            <Button
              danger
              type="primary"
              size="small"
              disabled={updateStatusMutation.isPending || isLoading}
            >
              Disable
            </Button>
          </Popconfirm>
        ) : (
          <Button
            type="primary"
            size="small"
            onClick={() => toggleStatus(record)}
            disabled={updateStatusMutation.isPending || isLoading}
          >
            Activate
          </Button>
        ),
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      {contextHolder}
      <Table
        columns={columns}
        dataSource={accountsData}
        loading={isLoading}
        pagination={{
          pageSize: pagination.pageSize,
          current: pagination.page + 1,
          total: totalRecords,
          onChange: (page, pageSize) => {
            setPagination({
              page: page - 1, // ant design page starts from 1, so we minus 1 to match backend
              pageSize: pageSize,
            });
          },
        }}
        rowKey="id"
      />
    </div>
  );
};

export default TableManageAccount;
