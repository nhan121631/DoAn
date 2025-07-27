"use client";

import React, { useContext, useState, useEffect } from "react"; 
import { Table, Tag, Button, Modal, message, Space, Input, Form, Select, Row, Col } from "antd";
import type { ColumnsType } from "antd/es/table";
import { AiOutlineEdit } from "react-icons/ai";
import { ThemeContext } from "@/app/context/ThemeContext";
import { Room } from "@/types/types";
import { RequestData } from "@/app/user-dashboard/request-status/page"; 

const { Option } = Select; 

export type RequestFormValues = {
  roomName: string;
  customerName: string;
  phoneNumber: string;
  requestDescription: string;
};

interface RequestFormModalProps {
  initialRequests: RequestData[];
}

const availableRooms: Room[] = [
  { name: "Phòng trọ Mr. Nam", address: "Ngu Hanh Son, Da Nang"},
  { name: "Phòng trọ Ms. Lan", address: "Son Tra, Da Nang" },
  { name: "Phòng trọ Mr. Duong", address: "Lien Chieu, Da Nang" },
];

const RequestFormModal: React.FC<RequestFormModalProps> = ({ initialRequests }) => {
  const [data, setData] = useState<RequestData[]>(initialRequests);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<RequestData | null>(null);
  const { isDark } = useContext(ThemeContext);
  const [form] = Form.useForm(); 

  useEffect(() => {
    if (editingRequest) {
      form.setFieldsValue(editingRequest);
    } else {
      form.resetFields();
    }
  }, [editingRequest, form]);

  const getStatusDisplay = (status: 0 | 1) => {
    switch (status) {
      case 0: return { text: "Not Processed", color: "red" };
      case 1: return { text: "Completed", color: "green" };
      default: return { text: "Unknown", color: "default" };
    }
  };

  const handleFormSubmit = (values: RequestFormValues) => {
    if (editingRequest) {
      const updatedData = data.map((item) =>
        item.key === editingRequest.key
          ? {
              ...item,
              ...values,
              status: item.status, 
            } as RequestData
          : item
      );
      setData(updatedData);
      message.success("Request updated successfully!");
    }
    // No "add new request" logic here, as it's handled by Rental History
    setIsFormModalOpen(false);
    setEditingRequest(null);
  };

  const handleEditRequest = (record: RequestData) => {
    setEditingRequest(record);
    setIsFormModalOpen(true);
  };

  const handleCancelModal = () => {
    setIsFormModalOpen(false);
    setEditingRequest(null);
    form.resetFields(); 
  };

  const columns: ColumnsType<RequestData> = [
    {
      title: "ID",
      dataIndex: "key",
      key: "id",
      sorter: (a, b) => Number(a.key) - Number(b.key),
      width: 70,
    },
    {
      title: "Room Name",
      dataIndex: "roomName",
      key: "roomName",
      sorter: (a, b) => a.roomName.localeCompare(b.roomName),
      width: 150,
    },
    {
      title: "Customer Name",
      dataIndex: "customerName",
      key: "customerName",
      sorter: (a, b) => a.customerName.localeCompare(b.customerName),
      width: 150,
    },
    {
      title: "Phone Number",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      width: 120,
    },
    {
      title: "Request Description",
      dataIndex: "requestDescription",
      key: "requestDescription",
      ellipsis: true,
      width: 250,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: 0 | 1) => {
        const { text, color } = getStatusDisplay(status);
        return <Tag color={color}>{text}</Tag>;
      },
      sorter: (a, b) => a.status - b.status,
      width: 120,
    },
    {
      title: "Actions",
      key: "actions",
      width: 80,
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<AiOutlineEdit size={18} />}
            onClick={() => handleEditRequest(record)}
            title="Edit Request"
            disabled={record.status === 1} // Disable if Completed
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="flex flex-col flex-1 p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
      <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-white">Request Management</h2>
      <div className="flex items-center justify-end mb-6"> {/* Removed Add Request button */}
        <Input.Search
          placeholder="Search requests..."
          style={{ width: 250 }}
          onSearch={(value) => {
            const filteredData = initialRequests.filter(request =>
              request.roomName.toLowerCase().includes(value.toLowerCase()) ||
              request.customerName.toLowerCase().includes(value.toLowerCase()) ||
              request.requestDescription.toLowerCase().includes(value.toLowerCase())
            );
            setData(filteredData);
          }}
          onChange={(e) => {
            if (e.target.value === "") {
              setData(initialRequests);
            }
          }}
        />
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="key"
        pagination={{ pageSize: 7 }}
        className="mt-4 mb-8 border border-gray-200 rounded-md dark:border-gray-700"
      />

      <Modal
        title={editingRequest ? "Edit Request" : "Add New Request"} // Title adjusts based on editing state
        open={isFormModalOpen}
        onCancel={handleCancelModal}
        footer={null}
        className={isDark ? "dark" : ""}
        destroyOnClose={true} // Use destroyOnClose to reset form state when modal closes
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
        >
          <div className="max-h-[400px] overflow-y-auto pr-4">
            <Form.Item
              label="Room Name"
              name="roomName"
              rules={[{ required: true, message: "Please select a room!" }]}
            >
              <Select
                placeholder="Select a room"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  String(option?.children).toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {availableRooms.map((room) => (
                  <Option key={room.name} value={room.name}>
                    {room.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Customer Name"
                  name="customerName"
                  rules={[{ required: true, message: "Please enter customer name!" }]}
                >
                  <Input placeholder="e.g., Nguyen Van A" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Phone Number"
                  name="phoneNumber"
                  rules={[{ required: true, message: "Please enter phone number!" }]}
                >
                  <Input placeholder="e.g., 0912345678" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Request Description"
              name="requestDescription"
              rules={[{ required: true, message: "Please enter request description!" }]}
            >
              <Input.TextArea rows={4} placeholder="e.g., Yêu cầu sửa chữa điện nước" />
            </Form.Item>

            {/* Status field is intentionally removed for user-side editing */}
          </div>

          <Form.Item>
            <div className="flex justify-end gap-2 mt-4">
              <Button onClick={handleCancelModal}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                Update Request {/* Always "Update Request" from this page */}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RequestFormModal;
