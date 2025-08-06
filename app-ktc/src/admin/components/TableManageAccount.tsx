import React, { useState, useEffect, useCallback } from "react";
import { Table, Select, Tag, Button, Popconfirm, message, Space, Pagination } from "antd";
import type { TableColumnsType } from "antd";
import type { UserResponseDto } from "../types/type";
import { fetchAccounts, updateAccountStatus, updateAccountRoles } from "../service/AccountService";

const { Option } = Select;

const TableManageAccount: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [accountsData, setAccountsData] = useState<UserResponseDto[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 7, total: 0 });
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [tempAuth, setTempAuth] = useState<string | null>(null);

  const loadAccounts = useCallback(async (page: number, size: number) => {
    setLoading(true);
    try {
      const res = await fetchAccounts(page - 1, size);

      // Lọc bỏ Administrator
      const filtered = res.data.filter(acc => !acc.roles.includes("Administrators"));

      setAccountsData(filtered);
      setPagination(prev => ({
        ...prev,
        current: res.pageNumber + 1,
        pageSize: res.pageSize || size,
        total: res.totalRecords || filtered.length
      }));
    } catch (error: any) {
      message.error(error?.message || "Error loading accounts");
      setAccountsData([]);
      setPagination(prev => ({ ...prev, total: 0 }));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAccounts(pagination.current, pagination.pageSize);
  }, [loadAccounts, pagination.current, pagination.pageSize]);

  const toggleStatus = async (record: UserResponseDto) => {
    const newStatus = record.status === "Active" ? 0 : 1;
    try {
      await updateAccountStatus(record.id, newStatus);
      message.success(`Account ${newStatus === 1 ? "unlocked" : "disabled"} successfully`);
      // Cập nhật UI ngay lập tức
      setAccountsData(prev =>
        prev.map(acc => acc.id === record.id ? { ...acc, status: newStatus === 1 ? "Active" : "Disabled" } : acc)
      );
    } catch (error: any) {
      message.error(error?.message || "Failed to update status");
    }
  };

  const saveAuthorization = async (record: UserResponseDto) => {
    if (!tempAuth) {
      message.warning("No role selected.");
      return;
    }
    try {
      await updateAccountRoles(record.id, [tempAuth]);
      message.success("Authorization updated successfully!");
      setEditingKey(null);
      setTempAuth(null);
      // Cập nhật UI ngay lập tức
      setAccountsData(prev =>
        prev.map(acc => acc.id === record.id ? { ...acc, roles: [tempAuth] } : acc)
      );
    } catch (error: any) {
      message.error(error?.message || "Failed to update authorization");
    }
  };

  const columns: TableColumnsType<UserResponseDto> = [
    { title: "Name", dataIndex: "username", width: "15%", sorter: (a, b) => a.username.localeCompare(b.username) },
    { title: "Email", dataIndex: "email", width: "20%", sorter: (a, b) => a.email.localeCompare(b.email) },
    { title: "Phone Number", dataIndex: "phoneNumber", width: "15%" },
    {
      title: "Status",
      dataIndex: "status",
      width: "10%",
      render: (val: string) => val === "Active" ? <Tag color="green">Active</Tag> : <Tag color="red">Disabled</Tag>
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
            <Select value={tempAuth || currentRole} onChange={setTempAuth} style={{ width: 120 }}>
              <Option value="Users">User</Option>
              <Option value="Landlords">Landlord</Option>
            </Select>
            <Button type="primary" size="small" onClick={() => saveAuthorization(record)}>OK</Button>
            <Button size="small" onClick={() => setEditingKey(null)}>Cancel</Button>
          </Space>
        ) : (
          <span onClick={() => { setEditingKey(record.id); setTempAuth(currentRole); }} style={{ cursor: 'pointer' }}>
            {roles.map(r => (
              <Tag key={r} color={r === "Landlords" ? "blue" : "default"}>{r}</Tag>
            ))}
          </span>
        );
      }
    },
    {
      title: "Action",
      key: "action",
      width: "15%",
      render: (_, record) =>
        record.status === "Active" ? (
          <Popconfirm title="Disable this account?" onConfirm={() => toggleStatus(record)}>
            <Button danger type="primary" size="small">Disable</Button>
          </Popconfirm>
        ) : (
          <Button type="primary" size="small" onClick={() => toggleStatus(record)}>Unlock</Button>
        )
    }
  ];

  return (
    <div style={{ padding: '20px' }}>
      <Table columns={columns} dataSource={accountsData} loading={loading} pagination={false} rowKey="id" />
      <div style={{
  marginTop: '20px',
  display: 'flex',
  justifyContent: 'flex-end'
}}>
        <Pagination
          current={pagination.current}
          pageSize={pagination.pageSize}
          total={pagination.total}
          onChange={(page, size) => setPagination(prev => ({ ...prev, current: page, pageSize: size || prev.pageSize }))}
        />
        {/* <Pagination
  current={pagination.current}
  pageSize={pagination.pageSize}
  total={pagination.total}
  onChange={(page, size) => {
    setPagination(prev => ({
      ...prev,
      current: size !== prev.pageSize ? 1 : page, // Nếu đổi pageSize thì về trang 1
      pageSize: size || prev.pageSize
    }));
  }}
/> */}
      </div>
    </div>
  );
};

export default TableManageAccount;
