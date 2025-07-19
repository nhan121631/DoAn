// src/app/landlord/ManageMaintain/page.tsx (hoặc file ManageMaintain.tsx của bạn)

"use client";
import React, { useContext, useState } from "react";
import { Table, Tag, Button, Modal, Popconfirm, message, Space, Input } from "antd";
import { Form } from "antd";
import type { ColumnsType } from "antd/es/table";
import { AiOutlineDelete, AiOutlineEye } from "react-icons/ai";
import { ThemeContext } from "@/app/context/ThemeContext";

type MaintainData = {
  key: string;
  roomName: string;
  address: string;
  issue: string;
  cost: number;
  date: string;
  status: "Pending" | "Completed" | "In Progress";
};

const initialMaintainData: MaintainData[] = [
  {
    key: "1",
    roomName: "Nhà trọ của nhà bác Nam là số 2",
    address: "Đống Đa, Hà Nội",
    issue: "Sửa vòi nước bị rò rỉ",
    cost: 200000,
    date: "07/08/2023",
    status: "Completed",
  },
  {
    key: "2",
    roomName: "Nhà trọ của nhà bác Nam là số 1",
    address: "Thanh Xuân, Hà Nội",
    issue: "Bảo trì điều hòa",
    cost: 9000000,
    date: "10/08/2023",
    status: "Pending",
  },
  {
    key: "3",
    roomName: "Phòng 506",
    address: "Cầu Giấy, Hà Nội",
    issue: "Thay bóng đèn hỏng",
    cost: 100000,
    date: "15/08/2023",
    status: "In Progress",
  },
];

const ManageMaintain: React.FC = () => {
  const [data, setData] = useState<MaintainData[]>(initialMaintainData);
  const [isAddMaintainModalOpen, setAddMaintainModalOpen] = useState(false);
  const [isViewDetailsModalOpen, setViewDetailsModalOpen] = useState(false);
  const [selectedMaintain, setSelectedMaintain] = useState<MaintainData | null>(null);
  const { isDark } = useContext(ThemeContext);
  const [form] = Form.useForm();

  const handleAddMaintain = (values: any) => {
    const newKey = (data.length + 1).toString();
    const newMaintain: MaintainData = {
      key: newKey,
      roomName: values.roomName,
      address: values.address,
      issue: values.issue,
      cost: values.cost ? parseFloat(values.cost) : 0,
      date: new Date().toLocaleDateString('vi-VN'),
      status: "Pending",
    };
    setData([...data, newMaintain]);
    message.success("Thêm phiếu bảo trì thành công!");
    setAddMaintainModalOpen(false);
    form.resetFields();
  };

  const handleViewDetails = (record: MaintainData) => {
    setSelectedMaintain(record);
    setViewDetailsModalOpen(true);
  };

  const handleDeleteMaintain = (recordKey: string) => {
    const updatedData = data.filter(item => item.key !== recordKey);
    setData(updatedData);
    message.success("Xóa phiếu bảo trì thành công!");
  };

  const columns: ColumnsType<MaintainData> = [
    {
      title: "Tên Phòng",
      dataIndex: "roomName",
      key: "roomName",
      sorter: (a, b) => a.roomName.localeCompare(b.roomName),
    },
    {
      title: "Địa Chỉ",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Phiếu bảo trì",
      dataIndex: "issue",
      key: "issue",
      render: (_, record) => (
        <Button onClick={() => handleViewDetails(record)}>Xem</Button>
      ),
    },
    {
      title: "Chi phí",
      dataIndex: "cost",
      key: "cost",
      sorter: (a, b) => a.cost - b.cost,
      render: (cost) => cost.toLocaleString("vi-VN") + " ₫",
    },
    {
      title: "Thời gian",
      dataIndex: "date",
      key: "date",
      sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    },
    {
      title: "Chế độ",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color;
        if (status === "Completed") {
          color = "green";
        } else if (status === "In Progress") {
          color = "blue";
        } else {
          color = "volcano";
        }
        return <Tag color={color}>{status}</Tag>;
      },
      sorter: (a, b) => a.status.localeCompare(b.status),
    },
    {
      title: "",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa phiếu bảo trì này?"
            onConfirm={() => handleDeleteMaintain(record.key)}
            okText="Có"
            cancelText="Không"
          >
            <Button type="text" danger icon={<AiOutlineDelete size={18} />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    // Đây là div gốc mới của component ManageMaintain
    // Loại bỏ div ngoài cùng với min-h-[100vh] và p-8
    <div className={`
      bg-white dark:bg-gray-800 rounded-lg shadow-md p-6
      ${isDark ? "dark-mode" : ""}
    `}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">Quản lý bảo trì</h2>
          <p className="text-gray-500">Quản lý bảo trì của phòng trọ.</p>
        </div>
        <div className="flex items-center">
          <Button
            type="primary"
            className="mr-4"
            onClick={() => setAddMaintainModalOpen(true)}
          >
            Thêm Phiếu Bảo Trì
          </Button>
          <Input.Search
            placeholder="Tìm kiếm:"
            style={{ width: 200 }}
          />
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="key"
        pagination={{ pageSize: 10 }}
      />

      {/* Modal Thêm Phiếu Bảo Trì */}
      <Modal
        title="Thêm Phiếu Bảo Trì Mới"
        open={isAddMaintainModalOpen}
        onCancel={() => setAddMaintainModalOpen(false)}
        footer={null}
        className={isDark ? "dark" : ""}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddMaintain}
        >
          <Form.Item
            label="Tên Phòng"
            name="roomName"
            rules={[{ required: true, message: "Vui lòng nhập tên phòng!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Địa Chỉ"
            name="address"
            rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Mô tả vấn đề"
            name="issue"
            rules={[{ required: true, message: "Vui lòng mô tả vấn đề!" }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item
            label="Chi phí dự kiến (₫)"
            name="cost"
            rules={[{ pattern: /^\d+(\.\d{1,2})?$/, message: 'Vui lòng nhập số hợp lệ!' }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full">
              Thêm
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Xem Chi Tiết Phiếu Bảo Trì */}
      <Modal
        title="Chi Tiết Phiếu Bảo Trì"
        open={isViewDetailsModalOpen}
        onCancel={() => setViewDetailsModalOpen(false)}
        footer={null}
        width={700}
        className={isDark ? "dark" : ""}
      >
        {selectedMaintain && (
          <>
            <p>
              <b>Tên Phòng:</b> {selectedMaintain.roomName}
            </p>
            <p>
              <b>Địa Chỉ:</b> {selectedMaintain.address}
            </p>
            <p>
              <b>Vấn đề:</b> {selectedMaintain.issue}
            </p>
            <p>
              <b>Chi phí:</b> {selectedMaintain.cost.toLocaleString("vi-VN")} ₫
            </p>
            <p>
              <b>Thời gian:</b> {selectedMaintain.date}
            </p>
            <p>
              <b>Trạng thái:</b>{" "}
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

export default ManageMaintain;