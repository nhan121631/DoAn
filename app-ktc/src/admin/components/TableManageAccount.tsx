/* eslint-disable @typescript-eslint/no-explicit-any */
import { DownOutlined, UserOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import type { MenuProps, TableColumnsType } from "antd";
import { Button, Dropdown, message, Popconfirm, Table, Tag } from "antd";
import React from "react";
import {
  getAccountsQueryOptions,
  useUpdateAccountRoles,
  useUpdateAccountStatus,
} from "../service/ReactQueryAccount";
import type { UserResponseDto } from "../types/type";

const TableManageAccount: React.FC = () => {
  const { data = [], isLoading } = useQuery(getAccountsQueryOptions());

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

  // const toggleStatus = useCallback(
  //   async (record: UserResponseDto) => {
  //     try {
  //       const newStatus = record.status === "Active" ? 1 : 0;
  //       await updateAccountStatus(record.id, newStatus);
  //       message.success("Cập nhật trạng thái thành công!");
  //       await loadAccounts();
  //     } catch (error: any) {
  //       console.error("Lỗi khi cập nhật trạng thái:", error);
  //       message.error(error?.message || "Cập nhật trạng thái thất bại!");
  //     }
  //   },
  // );

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
    console.log("Toggling status for user:", record.id, "to", newStatus);
    updateStatusMutation.mutate({ id: record.id, status: newStatus });
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
          console.log("Updating role for user:", record.id, "to", e.key);
          updateRoleMutation.mutate({ id: record.id, roleNames: [e.key] });
        };

        return (
          <Dropdown.Button
            menu={{ items, onClick: handleMenuClick }}
            placement="bottom"
            icon={<DownOutlined />}
            onClick={(e) => e.preventDefault()}
            disabled={isLoading}
            // type="primary"
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
        dataSource={data}
        loading={isLoading}
        pagination={{ pageSize: 5 }}
        rowKey="id"
      />
    </div>
  );
};

export default TableManageAccount;
