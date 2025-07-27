"use client";
import React, { useState } from "react";
import { Table, Tag, Button, Popconfirm, message, Space, Popover } from "antd";
import { useRouter } from "next/navigation";

import RoomInfoModal from "../components/manage-rooms/RoomInfoModal";
import type { ColumnsType } from "antd/es/table";
import { AiOutlineInfoCircle, AiOutlinePlus } from "react-icons/ai";
import { FaRegEdit } from "react-icons/fa";
import { RoomData } from "../types";
import EditPostModal from "../components/manage-rooms/EditPostModal";

const initialData: RoomData[] = [
  {
    key: "1",
    name: "Mr. Nam’s Room 1",
    address: "Dong Da, Hanoi",
    area: 20,
    price: 3999999,
    postStartDate: "2025-01-01",
    postEndDate: "2025-12-31",
    available: "Available",
    approval: 0,
    isRemove: 0,
    hidden: 1,
  },
  {
    key: "2",
    name: "Mr. Nam’s Room 2",
    address: "Thanh Xuan, Hanoi",
    area: 25,
    price: 3000000,
    postStartDate: "2025-02-01",
    postEndDate: "2025-07-10",
    available: "Rented",
    approval: 0,
    isRemove: 0,
    hidden: 0,
  },
  {
    key: "3",
    name: "Mr. Nam’s Room 3",
    address: "Cau Giay, Hanoi",
    area: 30,
    price: 2000000,
    postStartDate: "2025-03-01",
    postEndDate: "2025-09-30",
    available: "Available",
    approval: 2,
    isRemove: 1,
    hidden: 0,
  },
  {
    key: "4",
    name: "Ms. Lan’s Room 1",
    address: "Hoan Kiem, Hanoi",
    area: 35,
    price: 5000000,
    postStartDate: "2025-04-01",
    postEndDate: "2025-10-31",
    available: "Available",
    approval: 1,
    isRemove: 0,
    hidden: 0,
  },
  {
    key: "5",
    name: "Ms. Lan’s Room 2",
    address: "Ba Dinh, Hanoi",
    area: 40,
    price: 4500000,
    postStartDate: "2025-05-01",
    postEndDate: "2025-11-30",
    available: "Rented",
    approval: 1,
    isRemove: 0,
    hidden: 0,
  },
];

const TableManageRoom: React.FC = () => {
  const [data, setData] = useState<RoomData[]>(initialData);
  const [selectedRoom, setSelectedRoom] = useState<RoomData | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isInfoModalOpen, setInfoModalOpen] = useState(false);

  const [extendingKey, setExtendingKey] = useState<string | null>(null);
  const [selectedMonths, setSelectedMonths] = useState<number>(1);
  // const [isAddRoomOpen, setAddRoomOpen] = useState(false);
  const router = useRouter();

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
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Area (m²)",
      dataIndex: "area",
      key: "area",
      sorter: (a, b) => a.area - b.area,
      render: (_, record) => (record.area ? record.area + " m²" : "-"),
    },
    {
      title: "Price/month",
      dataIndex: "price",
      key: "price",
      sorter: (a, b) => a.price - b.price,
      render: (price) => price.toLocaleString("vi-VN") + " ₫",
    },
    {
      title: "Post Start",
      dataIndex: "postStartDate",
      key: "postStartDate",
      render: (date: string, record: RoomData) => {
        // fallback nếu date là undefined/null
        const d = date || record.postStartDate;
        if (!d) return "-";
        try {
          const parsed = new Date(d);
          if (isNaN(parsed.getTime())) return d;
          return parsed.toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          });
        } catch {
          return d;
        }
      },
    },
    {
      title: "Post End",
      dataIndex: "postEndDate",
      key: "postEndDate",
      render: (date: string, record: RoomData) => {
        const d = date || record.postEndDate;
        if (!d) return "-";
        try {
          const parsed = new Date(d);
          if (isNaN(parsed.getTime())) return d;
          return parsed.toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          });
        } catch {
          return d;
        }
      },
    },

    {
      title: "Gia hạn",
      key: "extend",
      render: (_, record) => {
        const now = new Date();
        const start = new Date(record.postStartDate);
        const end = new Date(record.postEndDate);
        const isStillValid = start <= now && now <= end;

        if (isStillValid) {
          return <Tag color="green">Còn hạn</Tag>;
        }

        const popoverContent = (
          <Space>
            <select
              value={selectedMonths}
              onChange={(e) => setSelectedMonths(Number(e.target.value))}
              style={{
                padding: "4px 8px",
                borderRadius: 4,
                border: "1px solid #ccc",
              }}
            >
              {[1, 2, 3, 4, 5].map((m) => (
                <option key={m} value={m}>
                  {m} tháng
                </option>
              ))}
            </select>

            <div>
              <span style={{ color: "black", fontWeight: 600 }}>
                {(record.price * selectedMonths).toLocaleString("vi-VN")} ₫
              </span>
            </div>

            <Button
              type="primary"
              size="small"
              onClick={() => {
                message.success(
                  `Gia hạn ${selectedMonths} tháng cho "${record.name}"`
                );
                setExtendingKey(null);
              }}
            >
              OK
            </Button>
          </Space>
        );

        return (
          <Popover
            content={popoverContent}
            title="Chọn thời gian gia hạn"
            trigger="click"
            open={extendingKey === record.key}
            onOpenChange={(visible) => {
              if (visible) {
                setExtendingKey(record.key);
                setSelectedMonths(1);
              } else {
                setExtendingKey(null);
              }
            }}
          >
            <Button size="small" type="primary">
              Gia hạn
            </Button>
          </Popover>
        );
      },
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
          return <Tag color="orange">Pending</Tag>;
        } else if (record.approval === 1) {
          return <Tag color="green">Approved</Tag>;
        } else {
          return <Tag color="red">Rejected</Tag>;
        }
      },
    },
    {
      title: "Hide/Show",
      key: "hiden",
      render: (_, record) => (
        <Popconfirm
          title={
            record.hidden === 1
              ? "Do you want to show this post again?"
              : "Are you sure to remove this post?"
          }
          onConfirm={() => toggleHidden(record)}
        >
          <Button
            size="small"
            type={record.hidden === 1 ? "default" : "primary"}
          >
            {record.hidden === 1 ? "Show" : "Hide"}
          </Button>
        </Popconfirm>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => {
        const now = new Date();
        const start = new Date(record.postStartDate);
        const end = new Date(record.postEndDate);
        const isStillValid = start <= now && now <= end;

        if (!isStillValid) {
          return (
            <span style={{ color: "gray", fontWeight: 600 }}>
              Bài đăng đã hết hạn
            </span>
          );
        }

        if (record.isRemove === 1) {
          return (
            <span style={{ color: "red", fontWeight: 600 }}>
              Admin đã gỡ bài
            </span>
          );
        }
        return (
          <Space>
            <Button
              type="text"
              icon={<FaRegEdit size={18} />}
              onClick={() => handleMailClick(record)}
            />
            <Button
              type="text"
              icon={<AiOutlineInfoCircle size={18} />}
              onClick={() => handleInfoClick(record)}
            />
          </Space>
        );
      },
    },
  ];

  return (
    <div className="mx-4 my-6 p-6 min-h-[280px] dark:!bg-[#171f2f] dark:!text-white">
      <div className="flex items-center justify-between mb-4">
        <div className="mb-4">
        <h2 className="text-4xl font-semibold dark:!text-white">Manage Rooms</h2>
        <p className="text-xl text-gray-500">Room Post Management.</p>
      </div>
        {/* Button to add new post room */}
        <div>
          <Button
            type="primary"
            icon={<AiOutlinePlus size={18} />}
            onClick={() => router.push("/landlord/add-room")}
          >
            Thêm phòng
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="key"
        pagination={{ pageSize: 7 }}
      />

      {/* AddRoomModal đã chuyển sang trang riêng */}
      <EditPostModal
        open={isModalOpen}
        onClose={() => setModalOpen(false)}
        selectedRoom={selectedRoom}
      />
      <RoomInfoModal
        open={isInfoModalOpen}
        onClose={() => setInfoModalOpen(false)}
        selectedRoom={selectedRoom}
      />
    </div>
  );
};

export default TableManageRoom;
