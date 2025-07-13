import React, { useContext, useState } from "react";
import { Table, Tag, Button, Modal, Popconfirm, message, Space } from "antd";
import { Form, Input } from "antd";
import type { ColumnsType } from "antd/es/table";
import { AiOutlineMail, AiOutlineInfoCircle } from "react-icons/ai";
import { ThemeContext } from "../context/ThemeContext";

type RoomData = {
  key: string;
  name: string;
  description: string;
  address: string;
  price: number;
  available: "Rented" | "Available";
  approval: 0 | 1 | 2; // 0 = pending, 1 = approved, 2 = rejected
  hidden: 0 | 1; // 0 = visible, 1 = hidden (bị ẩn)
};

const initialData: RoomData[] = [
  {
    key: "1",
    name: "Mr. Nam’s Room 1",
    description: "Affordable and cozy – perfect for students!",
    address: "Dong Da, Hanoi",
    price: 3999999,
    available: "Available",
    approval: 0,
    hidden: 0,
  },
  {
    key: "2",
    name: "Mr. Nam’s Room 2",
    description: "Clean and close to the center.",
    address: "Thanh Xuan, Hanoi",
    price: 3000000,
    available: "Rented",
    approval: 0,
    hidden: 0,
  },
  {
    key: "3",
    name: "Mr. Nam’s Room 3",
    description: "Near schools, fully furnished.",
    address: "Cau Giay, Hanoi",
    price: 2000000,
    available: "Available",
    approval: 2,
    hidden: 1,
  },
  {
    key: "4",
    name: "Ms. Lan’s Room 1",
    description: "Spacious and bright, perfect for families.",
    address: "Hoan Kiem, Hanoi",
    price: 5000000,
    available: "Available",
    approval: 1,
    hidden: 0,
  },
  {
    key: "5",
    name: "Ms. Lan’s Room 2",
    description: "Modern amenities, great location.",
    address: "Ba Dinh, Hanoi",
    price: 4500000,
    available: "Rented",
    approval: 1,
    hidden: 0,
  },
];

const TableManageRoom: React.FC = () => {
  const [data, setData] = useState<RoomData[]>(initialData);
  const [selectedRoom, setSelectedRoom] = useState<RoomData | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isInfoModalOpen, setInfoModalOpen] = useState(false);
  const { isDark } = useContext(ThemeContext);

  const updateApproval = (record: RoomData, value: 1 | 2) => {
    const updated = data.map((item) =>
      item.key === record.key ? { ...item, approval: value } : item
    );
    setData(updated);
    message.success(
      value === 1 ? "Approved successfully" : "Rejected successfully"
    );
  };

  const toggleHidden = (record: RoomData) => {
    const updated = data.map((item) =>
      item.key === record.key
        ? { ...item, hidden: (item.hidden === 1 ? 0 : 1) as 0 | 1 }
        : item
    );
    setData(updated);
    message.success(
      record.hidden === 1 ? "Post is now visible." : "Post has been hidden."
    );
  };

  const handleMailClick = (record: RoomData) => {
    setSelectedRoom(record);
    setModalOpen(true);
  };

  const handleInfoClick = (record: RoomData) => {
    setSelectedRoom(record);
    setInfoModalOpen(true);
  };

  const columns: ColumnsType<RoomData> = [
    {
      title: "Room Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Price/month",
      dataIndex: "price",
      key: "price",
      sorter: (a, b) => a.price - b.price,
      render: (price) => price.toLocaleString() + " ₫",
    },
    {
      title: "Available",
      dataIndex: "available",
      key: "available",
      render: (available) => (
        <Tag color={available === "Rented" ? "green" : "blue"}>{available}</Tag>
      ),
      sorter: (a, b) => a.available.localeCompare(b.available),
    },
    {
      title: "Approval",
      key: "approval",
      sorter: (a, b) => a.approval - b.approval,
      render: (_, record) => {
        if (record.approval === 0) {
          return (
            <Space>
              <Popconfirm
                title="Are you sure to approve this room?"
                onConfirm={() => updateApproval(record, 1)}
                okText="Yes"
                cancelText="No"
              >
                <Button size="small" type="primary">
                  Apply
                </Button>
              </Popconfirm>
              <Popconfirm
                title="Are you sure to reject this room?"
                onConfirm={() => updateApproval(record, 2)}
                okText="Yes"
                cancelText="No"
              >
                <Button size="small" danger>
                  Reject
                </Button>
              </Popconfirm>
            </Space>
          );
        } else if (record.approval === 1) {
          return <Tag color="green">Applied</Tag>;
        } else {
          return <Tag color="red">Rejected</Tag>;
        }
      },
    },
    {
      title: "Remove Post",
      key: "remove",
      render: (_, record) => (
        <Popconfirm
          title={
            record.hidden === 1
              ? "Do you want to show this post again?"
              : "Are you sure to remove this post?"
          }
          onConfirm={() => toggleHidden(record)}
          okText="Yes"
          cancelText="No"
        >
          <Button
            size="small"
            danger={record.hidden === 0}
            type={record.hidden === 1 ? "default" : "primary"}
          >
            {record.hidden === 1 ? "Removed" : "Remove"}
          </Button>
        </Popconfirm>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<AiOutlineMail size={18} />}
            onClick={() => handleMailClick(record)}
          />
          <Button
            type="text"
            icon={<AiOutlineInfoCircle size={18} />}
            onClick={() => handleInfoClick(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="key"
        pagination={{ pageSize: 7 }}
      />

      {/* Send Mail Modal */}
      <Modal
        title="Send Email"
        open={isModalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        className={isDark ? "dark" : ""}
      >
        <Form
          layout="vertical"
          onFinish={(values) => {
            console.log("Email values:", values);
            message.success("Email sent successfully!");
            setModalOpen(false);
          }}
        >
          <Form.Item label="To">
            <Input value={selectedRoom?.name} disabled />
          </Form.Item>

          <Form.Item
            label="Subject"
            name="subject"
            rules={[{ required: true, message: "Please enter email subject" }]}
          >
            <Input placeholder="Enter email subject" />
          </Form.Item>

          <Form.Item
            label="Message"
            name="message"
            rules={[
              { required: true, message: "Please enter your message" },
              { min: 10, message: "Message should be at least 10 characters" },
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Enter your message"
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full">
              Send
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Info Modal */}
      <Modal
        title="Room Details"
        open={isInfoModalOpen}
        onCancel={() => setInfoModalOpen(false)}
        footer={null}
        width={700}
        className={isDark ? "dark" : ""}
      >
        <p>
          <b>Name:</b> {selectedRoom?.name}
        </p>
        <p>
          <b>Description:</b> {selectedRoom?.description}
        </p>
        <p>
          <b>Address:</b> {selectedRoom?.address}
        </p>
        <p>
          <b>Price:</b> {selectedRoom?.price?.toLocaleString()} ₫
        </p>
        <p>
          <b>Status:</b> {selectedRoom?.available}
        </p>
        <p>
          <b>Approval:</b> {selectedRoom?.approval}
        </p>
        <p>
          <b>Hidden:</b> {selectedRoom?.hidden === 1 ? "Yes" : "No"}
        </p>
      </Modal>
    </>
  );
};

export default TableManageRoom;
