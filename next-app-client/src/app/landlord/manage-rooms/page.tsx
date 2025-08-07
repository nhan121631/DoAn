/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { getRoomsByLandlord } from "@/services/RoomService";
import { Button, message, Popconfirm, Popover, Space, Table, Tag } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AiOutlineInfoCircle, AiOutlinePlus } from "react-icons/ai";
import { FaRegEdit } from "react-icons/fa";
import EditPostModal from "../components/manage-rooms/EditPostModal";
import RoomInfoModal from "../components/manage-rooms/RoomInfoModal";
import { TypePost } from "@/types/types";
import { getPostTypes } from "@/services/TypePostService";

function TableManageRoom() {
  const [data, setData] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isInfoModalOpen, setInfoModalOpen] = useState(false);

  const [extendingKey, setExtendingKey] = useState<string | null>(null);
  const [extendDates, setExtendDates] = useState<{ [id: string]: string }>({});
  const [selectedTypePostId, setSelectedTypePostId] = useState<
    string | undefined
  >(undefined);
  const [typeposts, setTypeposts] = useState<TypePost[]>([]);

  const [messageApi, contextHolder] = message.useMessage();

  const router = useRouter();

  const fetchRooms = async (page = 1, pageSize = 5) => {
    setLoading(true);
    try {
      const res = await getRoomsByLandlord(page - 1, pageSize);
      console.log("Rooms API response:", res);
      setData(res.rooms || []);
      setPagination({
        current: (res.pageNumber ?? 0) + 1,
        pageSize: res.pageSize ?? pageSize,
        total: res.totalRecords ?? 0,
      });
    } catch (error: any) {
      messageApi.error({
        content: "Failed to fetch rooms " + error.message,
        duration: 3,
      });
      console.error("Error fetching rooms:", error.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const fetchTypePosts = async () => {
      try {
        const data = await getPostTypes();
        setTypeposts(data);
      } catch (error) {
        console.error("Failed to fetch type posts:", error);
      }
    };
    fetchTypePosts();
  }, []);

  useEffect(() => {
    fetchRooms(pagination.current, pagination.pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTableChange = (pag: TablePaginationConfig) => {
    fetchRooms(pag.current!, pag.pageSize!);
  };

  const toggleHidden = (record: any) => {
    // TODO: Gọi API cập nhật trạng thái ẩn/hiện và fetch lại danh sách phòng
    console.log("Toggle hidden for:", record);
  };

  // Hàm xử lý khi nhấn nút edit
  const handleEditClick = (record: any) => {
    setSelectedRoom(record);
    setModalOpen(true);
  };

  // Hàm xử lý khi nhấn nút info
  const handleInfoClick = (record: any) => {
    setSelectedRoom(record);
    setInfoModalOpen(true);
  };

  const columns: ColumnsType<any> = [
    {
      title: "Room Name",
      dataIndex: "title",
      key: "title",
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: "Address",
      key: "address",
      render: (_, record) =>
        [
          record.address?.street,
          record.address?.ward?.name,
          record.address?.ward?.district?.name,
          record.address?.ward?.district?.province?.name,
        ]
          .filter(Boolean)
          .join(", "),
    },
    {
      title: "Price/month",
      dataIndex: "priceMonth",
      key: "priceMonth",
      sorter: (a, b) => a.priceMonth - b.priceMonth,
      render: (priceMonth) => priceMonth.toLocaleString("vi-VN") + " ₫",
    },
    {
      title: "Deposit",
      dataIndex: "priceDeposit",
      key: "priceDeposit",
      render: (priceDeposit) => priceDeposit.toLocaleString("vi-VN") + " ₫",
    },
    {
      title: "Post Start",
      dataIndex: "postStartDate",
      key: "postStartDate",
      render: (date) =>
        date
          ? new Date(date).toLocaleDateString("vi-VN", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })
          : "-",
    },
    {
      title: "Post End",
      dataIndex: "postEndDate",
      key: "postEndDate",
      render: (date) =>
        date
          ? new Date(date).toLocaleDateString("vi-VN", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })
          : "-",
    },
    {
      title: "Extend",
      key: "extend",
      render: (_, record) => {
        const now = new Date();
        const start = new Date(record.postStartDate);
        const end = new Date(record.postEndDate);
        const isStillValid = start <= now && now <= end;

        if (isStillValid) {
          return <Tag color="green">Still valid</Tag>;
        }

        // Format min date as yyyy-MM-dd (ngày sau postEndDate)
        const minDate = new Date(end.getTime() + 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10);

        // Tính tổng phí gia hạn
        let totalFee = 0;
        if (extendDates[record.id] && selectedTypePostId) {
          const selectedType = typeposts.find(
            (tp) => tp.id === selectedTypePostId
          );
          if (selectedType) {
            const newDate = new Date(extendDates[record.id]);
            // Số ngày = ngày mới - ngày kết thúc hiện tại
            const diffMs = newDate.getTime() - end.getTime();
            let diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
            if (diffDays <= 1) diffDays = 1;
            totalFee = diffDays * selectedType.pricePerDay;
          }
        }

        const popoverContent = (
          <Space direction="vertical">
            <input
              type="date"
              min={minDate}
              value={extendDates[record.id] || ""}
              onChange={(e) =>
                setExtendDates((prev) => ({
                  ...prev,
                  [record.id]: e.target.value,
                }))
              }
              style={{
                padding: "4px 8px",
                borderRadius: 4,
                border: "1px solid #ccc",
              }}
            />
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-100 dark:bg-[#232b3b]">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold">
                      Post Type
                    </th>
                    <th className="px-4 py-2 text-left font-semibold">
                      Price/Day (₫)
                    </th>
                    <th className="px-4 py-2 text-center font-semibold">
                      Select
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-[#232b3b]">
                  {typeposts.map((typepost) => (
                    <tr
                      key={typepost.id}
                      className="hover:bg-gray-50 dark:hover:bg-[#1a2233] transition"
                    >
                      <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        {typepost.name}
                      </td>
                      <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        {typepost.pricePerDay.toLocaleString("vi-VN")}
                      </td>
                      <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 text-center">
                        <input
                          type="radio"
                          name={`typepostId-${record.id}`}
                          value={typepost.id}
                          checked={selectedTypePostId === typepost.id}
                          onChange={() => setSelectedTypePostId(typepost.id)}
                          className="accent-blue-600 scale-125 cursor-pointer"
                          style={{ margin: 0 }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Hiển thị tổng phí gia hạn */}
            {totalFee > 0 && (
              <div style={{ fontWeight: 600, color: "#1677ff", marginTop: 8 }}>
                Tổng phí gia hạn: {totalFee.toLocaleString("vi-VN")} ₫
              </div>
            )}
            <Button
              type="primary"
              size="small"
              disabled={!extendDates[record.id] || !selectedTypePostId}
              onClick={() => {
                messageApi.success({
                  content: `Extend until ${extendDates[record.id]} for "${
                    record.title
                  }"`,
                  duration: 3,
                });
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
            title="Select new end date"
            trigger="click"
            open={extendingKey === record.id}
            onOpenChange={(visible) => {
              if (visible) {
                setExtendingKey(record.id);
                setExtendDates((prev) => ({
                  ...prev,
                  [record.id]: "",
                }));
              } else {
                setExtendingKey(null);
              }
            }}
          >
            <Button
              size="small"
              type="primary"
              disabled={record.isRemoved === 1}
            >
              Extend
            </Button>
          </Popover>
        );
      },
    },
    {
      title: "Available",
      dataIndex: "available",
      key: "available",
      render: (available) =>
        available === 1 ? (
          <Tag color="green">Rented</Tag>
        ) : (
          <Tag color="blue">Available</Tag>
        ),
      sorter: (a, b) => a.available - b.available,
    },
    {
      title: "Approval",
      dataIndex: "approval",
      key: "approval",
      sorter: (a, b) => a.approval - b.approval,
      render: (approval) => {
        if (approval === 0) {
          return <Tag color="orange">Pending</Tag>;
        } else if (approval === 1) {
          return <Tag color="green">Approved</Tag>;
        } else {
          return <Tag color="red">Rejected</Tag>;
        }
      },
    },
    {
      title: "Hide/Show",
      dataIndex: "hidden",
      key: "hidden",
      render: (hidden, record) => (
        <Popconfirm
          title={
            hidden === 1
              ? "Do you want to show this post again?"
              : "Are you sure to remove this post?"
          }
          onConfirm={() => toggleHidden(record)}
        >
          <Button size="small" type={hidden === 1 ? "default" : "primary"}>
            {hidden === 1 ? "Show" : "Hide"}
          </Button>
        </Popconfirm>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => {
        const now = new Date();
        // const start = new Date(record.postStartDate);
        const end = new Date(record.postEndDate);
        const isStillValid = now <= end;

        if (!isStillValid) {
          return (
            <span style={{ color: "gray", fontWeight: 600 }}>
              Bài đăng đã hết hạn
            </span>
          );
        }

        if (record.isRemoved === 1) {
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
              onClick={() => handleEditClick(record)}
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
      {contextHolder}
      <div className="flex items-center justify-between mb-4">
        <div className="mb-4">
          <h2 className="text-4xl font-semibold dark:!text-white">
            Manage Rooms
          </h2>
          <p className="text-xl text-gray-500">Room Post Management.</p>
        </div>
        <div>
          <Button
            type="primary"
            icon={<AiOutlinePlus size={18} />}
            onClick={() => router.push("/landlord/manage-rooms/add-room")}
          >
            Add Room
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          // showSizeChanger: true,
        }}
        onChange={handleTableChange}
      />

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
}

export default TableManageRoom;
