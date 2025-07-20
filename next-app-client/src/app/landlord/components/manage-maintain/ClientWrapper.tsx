"use client"; 

import React, { useContext, useState } from "react";
import { Table, Tag, Button, Modal, Popconfirm, message, Space, Input } from "antd";
import type { ColumnsType } from "antd/es/table";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import { ThemeContext } from "@/app/context/ThemeContext";
import FormModal from "./FormModal"; // Import component Modal riêng
import { Room, MaintainData, FormValues } from "@/types/types";


const availableRooms: Room[] = [
  { name: "Mr. Nam's Room 1", address: "Ngu Hanh Son, Da Nang"},
  { name: "Mr. Tien's Room 2", address: "Son Tra, Da Nang" },
  { name: "Mr. Duong's Room 3", address: "Lien Chieu, Da Nang" },
  { name: "Ms. Phung's Room 1", address: "Hoa Vang , Da Nang" },
  { name: "Ms. Lan's Room 2", address: "Hoa Xuan , Da Nang"},
];

const initialMaintainData: MaintainData[] = [
  {
    key: "1",
    roomName: "Mr. Nam's Room 1",
    address: "Ngu Hanh Son, Da Nang",
    issue: "Sửa vòi nước bị rò rỉ",
    cost: 200000,
    date: "08/07/2023",
    status: "Completed",
  },
  {
    key: "2",
    roomName: "Mr. Tien's Room 2",
    address: "Son Tra, Da Nang",
    issue: "Bảo trì điều hòa",
    cost: 9000000,
    date: "08/10/2023",
    status: "Pending",
  },
  {
    key: "3",
    roomName: "Mr. Duong's Room 3",
    address: "Lien Chieu, Da Nang",
    issue: "Thay bóng đèn hỏng",
    cost: 100000,
    date: "08/15/2023",
    status: "In Progress",
  },
  {
    key: "4",
    roomName: "Ms. Phung's Room 1",
    address: "Hoa Vang , Da Nang",
    issue: "Kiểm tra hệ thống sưởi ấm",
    cost: 500000,
    date: "08/20/2023",
    status: "Pending",
  },
  {
    key: "5",
    roomName: "Ms. Lan's Room 2",
    address: "Hoa Xuan , Da Nang",
    issue: "Sửa chữa cửa sổ",
    cost: 300000,
    date: "08/25/2023",
    status: "Completed",
  },
];

const ClientWrapper: React.FC = () => {
  const [data, setData] = useState<MaintainData[]>(initialMaintainData);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewDetailsModalOpen, setViewDetailsModalOpen] = useState(false);
  const [selectedMaintain, setSelectedMaintain] = useState<MaintainData | null>(null);
  const [editingMaintain, setEditingMaintain] = useState<MaintainData | null>(null);
  const { isDark } = useContext(ThemeContext);

  const handleFormSubmit = (values: FormValues) => {
    if (editingMaintain) {
      const updatedData = data.map((item) =>
        item.key === editingMaintain.key
          ? { ...item, ...values } as MaintainData
          : item
      );
      setData(updatedData);
      message.success("Maintenance request updated successfully!");
    } else {
      const newKey = (data.length + 1).toString();
      const newMaintain: MaintainData = {
        key: newKey,
        roomName: values.roomName,
        address: values.address,
        issue: values.issue,
        cost: Number(values.cost),
        date: new Date().toLocaleDateString('en-US'),
        status: "Pending",
      };
      setData([...data, newMaintain]);
      message.success("Maintenance request added successfully!");
    }
    setIsFormModalOpen(false);
    setEditingMaintain(null);
  };

  const handleViewDetails = (record: MaintainData) => {
    setSelectedMaintain(record);
    setViewDetailsModalOpen(true);
  };

  const handleDeleteMaintain = (recordKey: string) => {
    const updatedData = data.filter(item => item.key !== recordKey);
    setData(updatedData);
    message.success("Maintenance request deleted successfully!");
  };

  const handleEditMaintain = (record: MaintainData) => {
    setEditingMaintain(record);
    setIsFormModalOpen(true);
  };

  const getStatusColorClass = (status: MaintainData['status']) => {
    switch (status) {
      case "Completed":
        return "green";
      case "In Progress":
        return "blue";
      case "Pending":
        return "volcano";
      default:
        return "";
    }
  };

  const columns: ColumnsType<MaintainData> = [
    {
      title: "Room Name",
      dataIndex: "roomName",
      key: "roomName",
      sorter: (a, b) => a.roomName.localeCompare(b.roomName),
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Problem", 
      dataIndex: "issue", 
      key: "issue",
    },
    {
      title: "Cost",
      dataIndex: "cost",
      key: "cost",
      sorter: (a, b) => a.cost - b.cost,
      render: (cost) => cost.toLocaleString("en-US") + " ₫",
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={getStatusColorClass(status)}>{status}</Tag>
      ),
      sorter: (a, b) => a.status.localeCompare(b.status),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<AiOutlineEdit size={18} />}
            onClick={() => handleEditMaintain(record)}
          />
          <Popconfirm
            title="Are you sure you want to delete this maintenance request?"
            onConfirm={() => handleDeleteMaintain(record.key)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger icon={<AiOutlineDelete size={18} />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="flex flex-col flex-1">
      <div className="flex justify-between items-center mt-2 mb-2">
        <Button
          type="primary"
          className="mr-4"
          onClick={() => {
            setEditingMaintain(null);
            setIsFormModalOpen(true);
          }}
        >
          Add Maintenance
        </Button>
        <Input.Search
          placeholder="Search:"
          style={{ width: 200 }}
        />
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="key"
        pagination={{ pageSize: 7 }}
        className="mt-8 mb-8"
      />

      {/* Add/Edit Maintenance Modal */}
      <FormModal
        open={isFormModalOpen}
        onCancel={() => {
          setIsFormModalOpen(false);
          setEditingMaintain(null);
        }}
        onSubmit={handleFormSubmit}
        editingMaintain={editingMaintain}
        availableRooms={availableRooms}
      />
    </div>
  );
};

export default ClientWrapper;
