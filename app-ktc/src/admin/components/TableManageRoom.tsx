import {
  Button,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Space,
  Table,
  Tag,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import React, { useContext, useEffect, useState } from "react";
import { AiOutlineInfoCircle, AiOutlineMail } from "react-icons/ai";
import { ThemeContext } from "../context/ThemeContext";
import { fetchAllRoomPaging } from "../service/RoomService";
import type { RoomResponseDto } from "../types/type";

// Dữ liệu sẽ lấy từ API, không dùng mock data

const TableManageRoom: React.FC = () => {
  const [data, setData] = useState<RoomResponseDto[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<RoomResponseDto | null>(
    null
  );
  const [isModalOpen, setModalOpen] = useState(false);
  const [isInfoModalOpen, setInfoModalOpen] = useState(false);
  const { isDark } = useContext(ThemeContext);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const pageSize = 5;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); 
      try {
        const res = await fetchAllRoomPaging(page, pageSize);
        const rooms: RoomResponseDto[] = (res.rooms ?? []).map((room) => ({
          ...room,
          key: room.id,
          name: room.title,
          addressText: [
            room.address?.street,
            room.address?.ward?.name,
            room.address?.ward?.district?.name,
            room.address?.ward?.district?.province?.name,
          ]
            .filter(Boolean)
            .join(", "),
          price: room.priceMonth,
          approval: room.approval as 0 | 1 | 2,
          isRemove: room.isRemoved as 0 | 1,
        }));
        setData(rooms);
        setTotal(res.totalRecords ?? 0);
      } catch (_) {
        message.error("Lỗi khi tải danh sách phòng!");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [page]);

  const updateApproval = (record: RoomResponseDto, value: 1 | 2) => {
    const updated = data.map((item) =>
      item.id === record.id ? { ...item, approval: value } : item
    );
    setData(updated);
    message.success(
      value === 1 ? "Approved successfully" : "Rejected successfully"
    );
  };

  const toggleHidden = (record: RoomResponseDto) => {
    const updated = data.map((item) =>
      item.id === record.id
        ? { ...item, isRemoved: (item.isRemoved === 1 ? 0 : 1) as 0 | 1 }
        : item
    );
    setData(updated);
    message.success(
      record.isRemoved === 1 ? "Post is now visible." : "Post has been hidden."
    );
  };

  const handleMailClick = (record: RoomResponseDto) => {
    setSelectedRoom(record);
    setModalOpen(true);
  };

  const handleInfoClick = (record: RoomResponseDto) => {
    setSelectedRoom(record);
    setInfoModalOpen(true);
  };

  const columns: ColumnsType<RoomResponseDto> = [
    {
      title: "Room Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Owner Name",
      dataIndex: "landlordFullName",
      key: "landlordFullName",
      render: (text) => <span>{text}</span>,
    },
    {
      title: "Address",
      dataIndex: "addressText",
      key: "addressText",
    },
    {
      title: "Price/month",
      dataIndex: "price",
      key: "price",
      sorter: (a, b) => a.priceMonth - b.priceMonth,
      render: (price) => price.toLocaleString() + " ₫",
    },
    {
      title: "Available",
      dataIndex: "available",
      key: "available",
      render: (available: number) => {
        const label = available === 1 ? "Rented" : "Available";
        const color = available === 1 ? "green" : "blue";
        return <Tag color={color}>{label}</Tag>;
      },
      sorter: (a, b) => a.available - b.available,
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
            record.isRemoved === 1
              ? "Do you want to show this post again?"
              : "Are you sure to remove this post?"
          }
          onConfirm={() => toggleHidden(record)}
          okText="Yes"
          cancelText="No"
        >
          <Button
            size="small"
            danger={record.isRemoved === 0}
            type={record.isRemoved === 1 ? "default" : "primary"}
          >
            {record.isRemoved === 1 ? "Removed" : "Remove"}
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
        loading={loading}
        pagination={{
          pageSize,
          current: page + 1,
          total,
          onChange: (p) => setPage(p - 1),
        }}
      />
      {/* ...existing code for modals... */}
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
            <Input value={selectedRoom?.title} disabled />
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
      <Modal
        title="Room Details"
        open={isInfoModalOpen}
        onCancel={() => setInfoModalOpen(false)}
        footer={null}
        width={700}
        className={isDark ? "dark" : ""}
      >
        <p>
          <b>Name:</b> {selectedRoom?.title}
        </p>
        <p>
          <b>Description:</b> {selectedRoom?.description}
        </p>
        <p>
          <b>Address:</b>{" "}
          {selectedRoom?.address ? String(selectedRoom.address) : ""}
        </p>
        <p>
          <b>Price:</b> {selectedRoom?.priceMonth?.toLocaleString()} ₫
        </p>
        <p>
          <b>Status:</b> {selectedRoom?.available}
        </p>
        <p>
          <b>Approval:</b> {selectedRoom?.approval}
        </p>
        <p>
          <b>Removed:</b> {selectedRoom?.isRemoved === 1 ? "Yes" : "No"}
        </p>
      </Modal>
    </>
  );
};

export default TableManageRoom;
