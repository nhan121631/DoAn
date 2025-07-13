import React, { useState } from "react";
import { Table, Select, Tag, Button, Popconfirm, message, Space } from "antd";
import type { TableColumnsType } from "antd";

const { Option } = Select;

export interface DataType {
  key: React.Key;
  name: string;
  email: string;
  phonenumber: string;
  status: 0 | 1; // 0 = Active, 1 = Disabled
  authorization: 1 | 2; // 1 = User, 2 = Landlord
}

const TableManageAccount: React.FC = () => {
  const [data, setData] = useState<DataType[]>([
    {
      key: "1",
      name: "John Brown",
      email: "john.brown@example.com",
      phonenumber: "0123456789",
      status: 1,
      authorization: 2,
    },
    {
      key: "2",
      name: "Jim Green",
      email: "jim.green@example.com",
      phonenumber: "0987654321",
      status: 0,
      authorization: 1,
    },
    {
      key: "3",
      name: "Joe Black",
      email: "jo@gmail.com",
      phonenumber: "1234567890",
      status: 0,
      authorization: 1,
    },
    {
      key: "4",
      name: "Jane Doe",
      email: "djoaid@gmail  .com",
      phonenumber: "9876543210",
      status: 1,
      authorization: 2,
    },
    {
      key: "5",
      name: "Jane Doe",
      email: "djoaid@gmail  .com",
      phonenumber: "9876543210",
      status: 1,
      authorization: 2,
    },
    {
      key: "6",
      name: "Jane Doe",
      email: "djoaid@gmail  .com",
      phonenumber: "9876543210",
      status: 1,
      authorization: 2,
    },
  ]);

  const [editingKey, setEditingKey] = useState<React.Key | null>(null);
  const [tempAuth, setTempAuth] = useState<1 | 2 | null>(null);

  const toggleStatus = (record: DataType) => {
    const updated = data.map((item) =>
      item.key === record.key
        ? { ...item, status: (item.status === 0 ? 1 : 0) as 0 | 1 }
        : item
    );
    setData(updated);
    message.success(
      `Account ${record.status === 0 ? "disabled" : "unlocked"} successfully`
    );
  };

  const handleAuthorizationChange = (value: 1 | 2) => {
    setTempAuth(value);
  };

  const saveAuthorization = (record: DataType) => {
    if (tempAuth === null) return;
    const updated = data.map((item) =>
      item.key === record.key ? { ...item, authorization: tempAuth } : item
    );
    setData(updated);
    message.success("Authorization updated");
    setEditingKey(null);
    setTempAuth(null);
  };

  const cancelEdit = () => {
    setEditingKey(null);
    setTempAuth(null);
  };

  const columns: TableColumnsType<DataType> = [
    {
      title: "Name",
      dataIndex: "name",
      width: "20%",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Email",
      dataIndex: "email",
      width: "25%",
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: "Phone Number",
      dataIndex: "phonenumber",
      width: "20%",
      sorter: (a, b) => a.phonenumber.localeCompare(b.phonenumber),
    },
    {
      title: "Status",
      dataIndex: "status",
      width: "15%",
      sorter: (a, b) => a.status - b.status,
      render: (value) =>
        value === 0 ? (
          <Tag color="green">Active</Tag>
        ) : (
          <Tag color="red">Disabled</Tag>
        ),
    },
    {
      title: "Authorization",
      dataIndex: "authorization",
      width: "25%",
      sorter: (a, b) => a.authorization - b.authorization,
      render: (_, record) => {
        const isEditing = editingKey === record.key;
        return isEditing ? (
          <Space>
            <Select
              defaultValue={record.authorization}
              onChange={handleAuthorizationChange}
              style={{
                width: 120,
                border: "1px solid #d9d9d9",
                borderRadius: 4,
              }}
            >
              <Option value={1}>User</Option>
              <Option value={2}>Landlord</Option>
            </Select>
            <Button
              type="primary"
              size="small"
              onClick={() => saveAuthorization(record)}
            >
              OK
            </Button>
            <Button size="small" onClick={cancelEdit}>
              Cancel
            </Button>
          </Space>
        ) : (
          <Button
            type="link"
            onClick={() => {
              setEditingKey(record.key);
              setTempAuth(record.authorization);
            }}
          >
            {record.authorization === 1 ? "User" : "Landlord"}
          </Button>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      width: "20%",
      render: (_, record) =>
        record.status === 0 ? (
          <Popconfirm
            title="Are you sure you want to disable this account?"
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
            Unlock
          </Button>
        ),
    },
  ];

  return (
    <div className="height-full p-4 bg-white dark:bg-[#171f2f] rounded-lg shadow">
      <Table<DataType>
        columns={columns}
        dataSource={data}
        pagination={{ pageSize: 5 }}
        rowKey="key"
      />
    </div>
  );
};

export default TableManageAccount;
