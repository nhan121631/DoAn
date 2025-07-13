import React, { useState } from "react";
import { Table, Tag, Button, Modal, Popconfirm, message, Space } from "antd";
import type { ColumnsType } from "antd/es/table";
import { AiOutlineMail, AiOutlineInfoCircle } from "react-icons/ai";

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
  {
    key: "6",
    name: "Ms. Lan’s Room 3",
    description: "Quiet neighborhood, ideal for professionals.",
    address: "Long Bien, Hanoi",
    price: 4000000,
    available: "Available",
    approval: 2,
    hidden: 1,
  },
  {
    key: "7",
    name: "Mr. Minh’s Room 1",
    description: "Luxury room with all facilities.",
    address: "Ho Chi Minh City",
    price: 8000000,
    available: "Available",
    approval: 0,
    hidden: 0,
  },
  {
    key: "8",
    name: "Mr. Minh’s Room 2",
    description: "Affordable and comfortable.",
    address: "Da Nang",
    price: 3500000,
    available: "Rented",
    approval: 1,
    hidden: 0,
  },
  {
    key: "9",
    name: "Mr. Minh’s Room 3",
    description: "Near the beach, great for vacations.",
    address: "Nha Trang",
    price: 6000000,
    available: "Available",
    approval: 2,
    hidden: 1,
  },
  {
    key: "10",
    name: "Ms. Hoa’s Room 1",
    description: "Charming room with vintage decor.",
    address: "Hue",
    price: 3000000,
    available: "Available",
    approval: 0,
    hidden: 0,
  },
  {
    key: "11",
    name: "Ms. Hoa’s Room 2",
    description: "Cozy and affordable, perfect for students.",
    address: "Can Tho",
    price: 2500000,
    available: "Rented",
    approval: 1,
    hidden: 0,
  },
  {
    key: "12",
    name: "Ms. Hoa’s Room 3",
    description: "Spacious with a beautiful view.",
    address: "Hai Phong",
    price: 4000000,
    available: "Available",
    approval: 2,
    hidden: 1,
  },
];

const TableManageRoom: React.FC = () => {
  const [data, setData] = useState<RoomData[]>(initialData);
  const [selectedRoom, setSelectedRoom] = useState<RoomData | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isInfoModalOpen, setInfoModalOpen] = useState(false);

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
      title: "Price",
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
    },
    {
      title: "Approval",
      key: "approval",
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
      <div className="dark:!bg-[#171f2f] dark:!text-white rounded-xl">
        <Table
          columns={columns}
          dataSource={data}
          rowKey="key"
          className="dark:!bg-[#171f2f] dark:!text-white"
          rowClassName={() => "dark:!bg-[#171f2f] dark:!text-white"}
          pagination={{ pageSize: 7 }}
        />
      </div>

      {/* Send Mail Modal */}
      <Modal
        title="Send Email"
        open={isModalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => setModalOpen(false)}
        className="dark:!bg-[#171f2f] dark:!text-white"
      >
        <p>
          Send email to: <b>{selectedRoom?.name}</b>
        </p>
      </Modal>

      {/* Info Modal */}
      <Modal
        title="Room Details"
        open={isInfoModalOpen}
        onCancel={() => setInfoModalOpen(false)}
        footer={null}
        width={700}
        className="dark:!bg-[#171f2f] dark:!text-white"
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
