/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import type { TableColumnsType } from "antd";
import { Button, Popconfirm, Select, Space, Table, Tag } from "antd";
import React, { useState } from "react";
import { getAccountsQueryOptions } from "../service/ReactQueryAccount";
import type { UserResponseDto } from "../types/type";

const { Option } = Select;

const TableManageAccount: React.FC = () => {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [tempAuth, setTempAuth] = useState<string | null>(null);

  const { data = [], isLoading } = useQuery(getAccountsQueryOptions());

  // const loadAccounts = useCallback(async () => {
  //   setLoading(true);
  //   try {
  //     const responseData = await fetchAccounts();

  //     if (responseData && Array.isArray(responseData)) {
  //       setAccountsData(responseData);
  //       message.success(`Tìm thấy ${responseData.length} tài khoản.`);
  //     } else {
  //       message.error("❌ Nhận dữ liệu không hợp lệ.");
  //       setAccountsData([]);
  //     }
  //   } catch (error: any) {
  //     console.error("❌ Lỗi khi tải tài khoản:", error);
  //     message.error(error?.message || "Lỗi khi tải tài khoản");
  //     setAccountsData([]);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, []);

  // useEffect(() => {
  //   loadAccounts();
  // }, [loadAccounts]);

  // const updateAuthorization = useCallback(
  //   async (record: UserResponseDto) => {
  //     if (!tempAuth) {
  //       message.error("Vui lòng chọn một vai trò.");
  //       return;
  //     }
  //     setLoading(true);
  //     try {
  //       await updateAccountRoles(record.id, [tempAuth]);
  //       message.success("Cập nhật vai trò thành công!");
  //       setEditingKey(null);
  //       await loadAccounts();
  //     } catch (error: any) {
  //       console.error("Lỗi khi cập nhật vai trò:", error);
  //       message.error(error?.message || "Cập nhật vai trò thất bại!");
  //     } finally {
  //       setLoading(false);
  //     }
  //   },
  //   [tempAuth, loadAccounts]
  // );

  // const toggleStatus = useCallback(
  //   async (record: UserResponseDto) => {
  //     setLoading(true);
  //     try {
  //       const newStatus = record.status === "Active" ? 1 : 0;
  //       await updateAccountStatus(record.id, newStatus);
  //       message.success("Cập nhật trạng thái thành công!");
  //       await loadAccounts();
  //     } catch (error: any) {
  //       console.error("Lỗi khi cập nhật trạng thái:", error);
  //       message.error(error?.message || "Cập nhật trạng thái thất bại!");
  //     } finally {
  //       setLoading(false);
  //     }
  //   },
  //   [loadAccounts]
  // );

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
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "Active" ? "green" : "red"}>{status}</Tag>
      ),
    },
    {
      title: "Roles",
      dataIndex: "roles",
      key: "roles",
      render: (roles, record) => {
        const currentRole = roles[0];
        return editingKey === record.id ? (
          <Space>
            <Select
              style={{ width: 120 }}
              defaultValue={currentRole}
              onChange={(value) => setTempAuth(value)}
            >
              <Option value="Landlords">Landlords</Option>
              <Option value="Users">Users</Option>
            </Select>
            <Button
              size="small"
              type="primary"
              // onClick={() => updateAuthorization(record)}
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
              // setTempAuth(currentRole);
            }}
            style={{ cursor: "pointer" }}
          >
            {roles.map((r: any) => (
              <Tag key={r} color={r === "Landlords" ? "blue" : "default"}>
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
            title="Vô hiệu hóa tài khoản này?"
            // onConfirm={() => toggleStatus(record)}
            okText="Có"
            cancelText="Không"
          >
            <Button danger type="primary" size="small">
              Vô hiệu hóa
            </Button>
          </Popconfirm>
        ) : (
          <Button
            type="primary"
            size="small"
            // onClick={() => toggleStatus(record)}
          >
            Mở khóa
          </Button>
        ),
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <Table
        columns={columns}
        dataSource={data}
        loading={isLoading}
        pagination={{ pageSize: 5 }} // Giới hạn 5 bản ghi mỗi trang ở frontend
        rowKey="id"
      />
    </div>
  );
};

export default TableManageAccount;
