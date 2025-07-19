// src/app/landlord/ManageMaintain/components/ManageMaintainClientWrapper.tsx
"use client"; // Đây là Client Component

import React, { useContext, useState, useEffect } from "react";
import { Table, Tag, Button, Modal, Popconfirm, message, Space, Input, Select } from "antd";
import { Form } from "antd"; // Giữ lại Form để định nghĩa ColumnsType
import type { ColumnsType } from "antd/es/table";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai"; // Đã xóa AiOutlineEye
import { ThemeContext } from "@/app/context/ThemeContext";
import MaintenanceFormModal from "./MaintenanceFormModal"; // Import component Modal mới

// Định nghĩa kiểu dữ liệu cho một phòng (vẫn cần ở đây nếu dùng cho availableRooms)
type Room = {
  name: string;
  address: string;
};

const availableRooms: Room[] = [
  { name: "Mr. Nam's Room 1", address: "Ngu Hanh Son, Da Nang" },
  { name: "Mr. Nam's Room 2", address: "Son Tra, Da Nang" },
  { name: "Room 506", address: "Lien Chieu, Da Nang" },
  { name: "Ms. Lan's Room 1", address: "Hoa Vang , Da Nang" },
  { name: "Ms. Lan's Room 2", address: "Hoa Xuan , Da Nang" },
];

type MaintainData = {
  key: string;
  roomName: string;
  address: string;
  issue: string;
  cost: number;
  date: string;
  status: "Pending" | "Completed" | "In Progress";
};

// Định nghĩa kiểu dữ liệu cho các giá trị từ Form
type FormValues = {
  roomName: string;
  address: string;
  issue: string;
  cost: number;
  status?: "Pending" | "Completed" | "In Progress"; // Status là tùy chọn khi thêm mới
};

const initialMaintainData: MaintainData[] = [
  {
    key: "1",
    roomName: "Mr. Nam's Room 2",
    address: "Ngu Hanh Son, Da Nang",
    issue: "Leaky faucet repair",
    cost: 200000,
    date: "08/07/2023", 
    status: "Completed",
  },
  {
    key: "2",
    roomName: "Mr. Nam's Room 1",
    address: "Son Tra, Da Nang",
    issue: "Air conditioner maintenance",
    cost: 9000000,
    date: "08/10/2023", 
    status: "Pending",
  },
  { 
    key: "3",
    roomName: "Room 506",
    address: "Lien Chieu, Da Nang",
    issue: "Broken light bulb replacement",
    cost: 100000,
    date: "08/15/2023", 
    status: "In Progress",
  },
    {
        key: "4",
        roomName: "Ms. Lan's Room 1",
        address: "Hoa Vang , Da Nang",
        issue: "Heating system check",
        cost: 500000,
        date: "08/20/2023",
        status: "Pending",
    },
    {
        key: "5",
        roomName: "Ms. Lan's Room 2", 
        address: "Hoa Xuan , Da Nang",
        issue: "Window repair",
        cost: 300000,
        date: "08/25/2023",
        status: "Completed",
    },
];

const ManageMaintainClientWrapper: React.FC = () => {
  const [data, setData] = useState<MaintainData[]>(initialMaintainData);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewDetailsModalOpen, setViewDetailsModalOpen] = useState(false);
  const [selectedMaintain, setSelectedMaintain] = useState<MaintainData | null>(null);
  const [editingMaintain, setEditingMaintain] = useState<MaintainData | null>(null);
  const { isDark } = useContext(ThemeContext);
  // const [form] = Form.useForm(); // useForm() đã được chuyển vào component Modal

  // useEffect này không còn cần thiết để set giá trị form vì form đã được reset/set trong Modal
  // useEffect(() => {
  //   console.log("useEffect triggered. editingMaintain:", editingMaintain);
  //   if (editingMaintain) {
  //     form.setFieldsValue(editingMaintain);
  //     form.setFieldsValue({ roomName: editingMaintain.roomName });
  //     console.log("Form fields set for editing:", form.getFieldsValue());
  //   } else {
  //     form.resetFields();
  //     console.log("Form fields reset for new entry.");
  //   }
  // }, [editingMaintain, form]);

  const handleFormSubmit = (values: FormValues) => { // Đã thay đổi 'any' thành 'FormValues'
    if (editingMaintain) {
      const updatedData = data.map((item) =>
        item.key === editingMaintain.key
          ? { ...item, ...values } as MaintainData // Ép kiểu an toàn hơn
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
        cost: Number(values.cost), // Đảm bảo cost là số
        date: new Date().toLocaleDateString('en-US'),
        status: "Pending", // Default to Pending when adding new
      };
      setData([...data, newMaintain]);
      message.success("Maintenance request added successfully!");
    }
    setIsFormModalOpen(false);
    setEditingMaintain(null);
    // form.resetFields(); // Reset form sẽ được xử lý trong MaintenanceFormModal
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
      title: "Maintenance Card",
      dataIndex: "issue",
      key: "issue",
      render: (_, record) => (
        <Button onClick={() => handleViewDetails(record)}>View</Button>
      ),
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
    <div className={`
      bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 m-5
      ${isDark ? "dark-mode" : ""}
    `}>
      <div className="mb-4">
        <div>
          <h2 className="text-4xl font-semibold dark:!text-white">Manage Maintain</h2>
          <p className="text-gray-500 text-xl">Room Maintenance Management.</p>
        </div>
        <div className="flex justify-between items-center mt-2 mb-2">
          <Button
            type="primary"
            className="mr-4"
            onClick={() => {
              setEditingMaintain(null);
              setIsFormModalOpen(true);
            }}
          >
            Add Maintenance Voucher
          </Button>
          <Input.Search
            placeholder="Search:"
            style={{ width: 200 }}
          />
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="key"
        pagination={{ pageSize: 7 }}
        className="mt-8 mb-8"
      />

      {/* Add/Edit Maintenance Voucher Modal (đã chuyển sang component con) */}
      <MaintenanceFormModal
        open={isFormModalOpen}
        onCancel={() => {
          setIsFormModalOpen(false);
          setEditingMaintain(null);
        }}
        onSubmit={handleFormSubmit}
        editingMaintain={editingMaintain}
        availableRooms={availableRooms}
      />

      {/* View Maintenance Voucher Details Modal */}
      <Modal
        title="Maintenance Voucher Details"
        open={isViewDetailsModalOpen}
        onCancel={() => setViewDetailsModalOpen(false)}
        footer={null}
        width={700}
        className={isDark ? "dark" : ""}
      >
        {selectedMaintain && (
          <>
            <p>
              <b>Room Name:</b> {selectedMaintain.roomName}
            </p>
            <p>
              <b>Address:</b> {selectedMaintain.address}
            </p>
            <p>
              <b>Problem:</b> {selectedMaintain.issue}
            </p>
            <p>
              <b>Cost:</b> {selectedMaintain.cost.toLocaleString("en-US")} ₫
            </p>
            <p>
              <b>Date:</b> {selectedMaintain.date}
            </p>
            <p>
              <b>Status:</b>{" "}
              <Tag
                color={
                  selectedMaintain.status === "Completed"
                    ? "green"
                    : selectedMaintain.status === "In Progress"
                    ? "blue"
                    : "volcano"
                }
              >
                {selectedMaintain.status}
              </Tag>
            </p>
          </>
        )}
      </Modal>
    </div>
  );
};

export default ManageMaintainClientWrapper;
