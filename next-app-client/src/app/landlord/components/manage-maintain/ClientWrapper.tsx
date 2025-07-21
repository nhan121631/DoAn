"use client";

import React, {  useState } from "react";
import { Table, Tag, Button, Popconfirm, message, Space, Input } from "antd";
import type { ColumnsType } from "antd/es/table";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
<<<<<<< HEAD
import FormModal from "./FormModal"; // Import component Modal riêng
import { Room, MaintainData, FormValues } from "@/types/maintenance";
=======
import FormModal from "./FormModal"; 
import { Room, MaintainData, FormValues } from "@/types/types"; 
>>>>>>> 9beb899836875ba583b49c78ca6edd739f3b3a20

const availableRooms: Room[] = [
  { name: "Mr. Nam's Room 1", address: "Ngu Hanh Son, Da Nang" },
  { name: "Mr. Tien's Room 2", address: "Son Tra, Da Nang" },
  { name: "Mr. Duong's Room 3", address: "Lien Chieu, Da Nang" },
  { name: "Ms. Phung's Room 1", address: "Hoa Vang , Da Nang" },
  { name: "Ms. Lan's Room 2", address: "Hoa Xuan , Da Nang" },
];

const initialMaintainData: MaintainData[] = [
  {
    key: "1",
    roomName: "Mr. Nam's Room 1",
    address: "Ngu Hanh Son, Da Nang",
    issue: "Sửa vòi nước bị rò rỉ",
    cost: 200000,
    date: "08/07/2023",
    status: 2, // Completed
  },
  {
    key: "2",
    roomName: "Mr. Tien's Room 2",
    address: "Son Tra, Da Nang",
    issue: "Bảo trì điều hòa",
    cost: 9000000,
    date: "08/10/2023",
    status: 0, // Pending
  },
  {
    key: "3",
    roomName: "Mr. Duong's Room 3",
    address: "Lien Chieu, Da Nang",
    issue: "Thay bóng đèn hỏng",
    cost: 100000,
    date: "08/15/2023",
    status: 1, // In Progress
  },
  {
    key: "4",
    roomName: "Ms. Phung's Room 1",
    address: "Hoa Vang , Da Nang",
    issue: "Kiểm tra hệ thống sưởi ấm",
    cost: 500000,
    date: "08/20/2023",
    status: 0, // Pending
  },
  {
    key: "5",
    roomName: "Ms. Lan's Room 2",
    address: "Hoa Xuan , Da Nang",
    issue: "Sửa chữa cửa sổ",
    cost: 300000,
    date: "08/25/2023",
    status: 2, // Completed
  },
];

const ClientWrapper: React.FC = () => {
  const [data, setData] = useState<MaintainData[]>(initialMaintainData);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
<<<<<<< HEAD
  const [isViewDetailsModalOpen, setViewDetailsModalOpen] = useState(false);
  const [selectedMaintain, setSelectedMaintain] = useState<MaintainData | null>(
    null
  );
  const [editingMaintain, setEditingMaintain] = useState<MaintainData | null>(
    null
  );
=======
 
  const [editingMaintain, setEditingMaintain] = useState<MaintainData | null>(null);
>>>>>>> 9beb899836875ba583b49c78ca6edd739f3b3a20

  const handleFormSubmit = (values: FormValues) => {
    const submittedStatus = values.status !== undefined ? Number(values.status) : undefined;

    if (editingMaintain) {
      const updatedData = data.map((item) =>
        item.key === editingMaintain.key
<<<<<<< HEAD
          ? ({ ...item, ...values } as MaintainData)
=======
          ? { ...item, ...values, status: submittedStatus as (0 | 1 | 2) } as MaintainData
>>>>>>> 9beb899836875ba583b49c78ca6edd739f3b3a20
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
<<<<<<< HEAD
        date: new Date().toLocaleDateString("en-US"),
        status: "Pending",
=======
        date: new Date().toLocaleDateString('en-US'),
        status: 0, // Mặc định là 0 (Pending) khi thêm mới
>>>>>>> 9beb899836875ba583b49c78ca6edd739f3b3a20
      };
      setData([...data, newMaintain]);
      message.success("Maintenance request added successfully!");
    }
    setIsFormModalOpen(false);
    setEditingMaintain(null);
  };

  const handleDeleteMaintain = (recordKey: string) => {
    const updatedData = data.filter((item) => item.key !== recordKey);
    setData(updatedData);
    message.success("Maintenance request deleted successfully!");
  };

  const handleEditMaintain = (record: MaintainData) => {
    setEditingMaintain(record);
    setIsFormModalOpen(true);
  };

<<<<<<< HEAD
  const getStatusColorClass = (status: MaintainData["status"]) => {
=======
  const getStatusDisplay = (status: 0 | 1 | 2) => {
>>>>>>> 9beb899836875ba583b49c78ca6edd739f3b3a20
    switch (status) {
      case 0: return { text: "Pending", color: "volcano" };
      case 1: return { text: "In Progress", color: "blue" };
      case 2: return { text: "Completed", color: "green" };
      default: return { text: "Unknown", color: "default" };
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
      render: (status: 0 | 1 | 2) => {
        const { text, color } = getStatusDisplay(status);
        return <Tag color={color}>{text}</Tag>;
      },
      sorter: (a, b) => a.status - b.status,
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
        <Input.Search placeholder="Search:" style={{ width: 200 }} />
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="key"
        pagination={{ pageSize: 7 }}
        className="mt-8 mb-8"
      />

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
