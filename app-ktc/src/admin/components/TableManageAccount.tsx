/* eslint-disable @typescript-eslint/no-explicit-any */
import { DownOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import type { TableColumnsType } from "antd";
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

  const { data, isLoading } = useQuery(
    getPaginatedAccountsQueryOptions(pagination.page, pagination.pageSize)
  );
  const accountsData = data?.data || [];
  const totalRecords = data?.totalRecords || 0;

  const [messageApi, contextHolder] = message.useMessage();
  const updateRoleMutation = useUpdateAccountRoles({
    mutationConfig: {
      onSuccess: () => {
        messageApi.success({
          content: "Bạn đã cập nhật vai trò tài khoản thành công!",
          duration: 3,
        });
      },
      onError: (error: any) => {
        messageApi.error({
          content:
            error?.response?.data?.message?.join(", ") || "Đã xảy ra lỗi!",
          duration: 3,
        });
      },
    },
  });

  const updateStatusMutation = useUpdateAccountStatus({
    mutationConfig: {
      onSuccess: () => {
        messageApi.success({
          content: "Bạn đã cập nhật trạng thái tài khoản thành công!",
          duration: 3,
        });
      },
      onError: (error: any) => {
        messageApi.error({
          content:
            error?.response?.data?.message?.join(", ") || "Đã xảy ra lỗi!",
          duration: 3,
        });
      },
    },
  });

  const toggleStatus = (record: UserResponseDto) => {
    const newStatus = record.status === "Hoạt động" ? 1 : 0;
    updateStatusMutation.mutate({ id: record.id, status: newStatus });
  };

  const updateRoleHandler = (record: UserResponseDto, roleName: string) => {
    updateRoleMutation.mutate({ id: record.id, roleNames: [roleName] });
  };

  const columns: TableColumnsType<UserResponseDto> = [
    {
      title: "Tên đăng nhập",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: "Vai trò",
      dataIndex: "roles",
      key: "roles",
      render: (roles, record) => {
        const items = [
          {
            label: "Chủ nhà",
            key: "Landlords",
          },
          {
            label: "Người dùng",
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
            <span>
              {currentRole === "Landlords" ? "Chủ nhà" : "Người dùng"}
            </span>
          </Dropdown.Button>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          color={
            status === "Active" || status === "Hoạt động" ? "green" : "red"
          }
        >
          {status === "Active"
            ? "Hoạt động"
            : status === "Inactive"
            ? "Vô hiệu hóa"
            : status}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      width: "15%",
      render: (_, record) =>
        record.status === "Active" || record.status === "Hoạt động" ? (
          <Popconfirm
            title="Vô hiệu hóa tài khoản này?"
            onConfirm={() => toggleStatus(record)}
            okText="Có"
            cancelText="Không"
          >
            <Button
              danger
              type="primary"
              size="small"
              disabled={updateStatusMutation.isPending || isLoading}
            >
              Vô hiệu hóa
            </Button>
          </Popconfirm>
        ) : (
          <Button
            type="primary"
            size="small"
            onClick={() => toggleStatus(record)}
            disabled={updateStatusMutation.isPending || isLoading}
          >
            Kích hoạt
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
