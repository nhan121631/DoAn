/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {
  getRoomsByLandlord,
  hideShowRoom,
  updateRoomPostExtend,
} from "@/services/RoomService";
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
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
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
  const [sortField, setSortField] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<string | undefined>(undefined);

  const fetchRooms = async (
    page = 1,
    pageSize = pagination.pageSize,
    sf?: string,
    so?: string
  ) => {
    setLoading(true);
    try {
      const res = await getRoomsByLandlord(page, pageSize, sf, so);
      console.log("Rooms API response:", res);
      setData(res.rooms || []);
      setPagination({
        current: (res.pageNumber ?? 0) + 1,
        pageSize: res.pageSize ?? pageSize,
        total: res.totalRecords ?? 0,
      });
    } catch (error: any) {
      messageApi.error({
        content: "Lỗi tải phòng " + error.message,
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
    fetchRooms(pagination.current, pagination.pageSize, sortField, sortOrder);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTableChange = (
    pag: TablePaginationConfig,
    _filters: Record<string, any>,
    sorter: any
  ) => {
    const newPage = pag.current ?? 1;
    const newPageSize = pag.pageSize ?? pagination.pageSize;

    let sf: string | undefined = undefined;
    let so: string | undefined = undefined;

    if (Array.isArray(sorter)) {
      if (sorter.length > 0) {
        sf = sorter[0]?.field || sorter[0]?.columnKey;
        so =
          sorter[0]?.order === "descend"
            ? "desc"
            : sorter[0]?.order === "ascend"
            ? "asc"
            : undefined;
      }
    } else if (sorter) {
      sf = sorter.field || sorter.columnKey;
      if (sorter.order) {
        so =
          sorter.order === "descend"
            ? "desc"
            : sorter.order === "ascend"
            ? "asc"
            : undefined;
      }
    }

    setPagination((prev) => ({
      ...prev,
      current: newPage,
      pageSize: newPageSize,
    }));
    setSortField(sf);
    setSortOrder(so);
    fetchRooms(newPage, newPageSize, sf, so);
  };

  const toggleHidden = async (record: any) => {
    try {
      await hideShowRoom(record.id, record.hidden === 1 ? 0 : 1);
      messageApi.success({
        content: `Phòng hiện ${record.hidden === 1 ? "hiển thị" : "ẩn"}`,
        duration: 3,
      });
      fetchRooms(pagination.current, pagination.pageSize);
    } catch (error: any) {
      messageApi.error({
        content: error.message || "Lỗi cập nhật trạng thái hiển thị phòng",
        duration: 3,
      });
    }
  };

  // Hàm xử lý khi nhấn nút edit
  const handleEditClick = (record: any) => {
    setSelectedRoomId(record.id);
    setModalOpen(true);
  };

  // Hàm xử lý khi nhấn nút info
  const handleInfoClick = (record: any) => {
    setSelectedRoomId(record.id);
    setInfoModalOpen(true);
  };

  const columns: ColumnsType<any> = [
    {
      title: "Tên phòng",
      dataIndex: "title",
      key: "title",
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: "Địa chỉ",
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
      title: "Giá/tháng",
      dataIndex: "priceMonth",
      key: "priceMonth",
      align: "right" as const,
      sorter: (a, b) => a.priceMonth - b.priceMonth,
      render: (priceMonth) => priceMonth.toLocaleString("vi-VN") + " ₫",
    },
    {
      title: "Tiền đặt cọc",
      dataIndex: "priceDeposit",
      key: "priceDeposit",
      align: "right" as const,
      render: (priceDeposit) => priceDeposit.toLocaleString("vi-VN") + " ₫",
      sorter: (a, b) => a.priceDeposit - b.priceDeposit,
    },
    {
      title: "Ngày bắt đầu đăng",
      dataIndex: "postStartDate",
      key: "postStartDate",
      render: (date) =>
        date
          ? new Date(date).toLocaleString("vi-VN", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })
          : "-",
      sorter: (a, b) => {
        const dateA = new Date(a.postStartDate);
        const dateB = new Date(b.postStartDate);
        return dateA.getTime() - dateB.getTime();
      },
    },
    {
      title: "Ngày kết thúc đăng",
      dataIndex: "postEndDate",
      key: "postEndDate",
      render: (date) =>
        date
          ? new Date(date).toLocaleString("vi-VN", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })
          : "-",
      sorter: (a, b) => {
        const dateA = new Date(a.postEndDate);
        const dateB = new Date(b.postEndDate);
        return dateA.getTime() - dateB.getTime();
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
        const isRemoved = record.isRemoved === 1;
        const isReject = record.approval === 2;

        // Nếu bài đã bị xóa hoặc vẫn còn hiệu lực thì không hiển thị nút Extend, thay vào đó hiển thị trạng thái phù hợp
        if (isRemoved) {
          return <Tag color="red">Đã xóa</Tag>;
        }
        if (isReject) {
          return <Tag color="orange">Bài đăng bị từ chối</Tag>;
        }
        if (isStillValid) {
          return <Tag color="green">Còn hiệu lực</Tag>;
        }

        // Format min date là ngày hiện tại + 1 ngày nữa
        const tomorrowDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + 2
        );
        const minDate = tomorrowDate.toISOString().slice(0, 10);

        // Tính tổng phí gia hạn và số ngày dựa vào ngày hiện tại (client) và ngày kết thúc chọn từ input
        let totalFee = 0;
        let diffDays = 0;
        if (extendDates[record.id] && selectedTypePostId) {
          const selectedType = typeposts.find(
            (tp) => tp.id === selectedTypePostId
          );
          if (selectedType) {
            // Ngày bắt đầu là ngày hiện tại
            const startDate = new Date();
            startDate.setHours(0, 0, 0, 0);
            // Ngày kết thúc là ngày chọn từ input
            const endDate = new Date(extendDates[record.id]);
            endDate.setHours(0, 0, 0, 0);
            // Tính số ngày: bao gồm cả ngày bắt đầu và ngày kết thúc
            diffDays = Math.max(
              1,
              Math.ceil(
                (endDate.getTime() - startDate.getTime()) /
                  (1000 * 60 * 60 * 24)
              )
            );
            totalFee = diffDays * selectedType.pricePerDay;
          }
        }

        const popoverContent = (
          <Space direction="vertical">
            <input
              type="date"
              min={minDate}
              value={extendDates[record.id] || ""}
              onChange={(e) => {
                const selected = e.target.value;
                if (selected >= minDate) {
                  setExtendDates((prev) => ({
                    ...prev,
                    [record.id]: selected,
                  }));
                }
              }}
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
                      Loại bài đăng
                    </th>
                    <th className="px-4 py-2 text-left font-semibold">
                      Giá/ngày (₫)
                    </th>
                    <th className="px-4 py-2 text-center font-semibold">
                      Chọn
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
            {/* Hiển thị số ngày gia hạn và tổng phí */}
            {diffDays > 0 && (
              <div style={{ fontWeight: 600, color: "#1677ff", marginTop: 8 }}>
                Số ngày gia hạn: {diffDays} <br />
                Tổng phí gia hạn: {totalFee.toLocaleString("vi-VN")} ₫
              </div>
            )}
            <Button
              type="primary"
              size="small"
              disabled={!extendDates[record.id] || !selectedTypePostId}
              onClick={async () => {
                try {
                  // postStartDate lấy ngày giờ hiện tại đầy đủ
                  const postStartDate = new Date().toISOString();
                  // postEndDate lấy ngày từ input và set thời gian cuối ngày
                  const endDate = new Date(
                    extendDates[record.id] + "T23:59:59"
                  );
                  const postEndDate = endDate.toISOString();
                  await updateRoomPostExtend(
                    record.id,
                    postStartDate,
                    postEndDate,
                    selectedTypePostId as string
                  );
                  console.log("postEndDate", postEndDate);
                  console.log("postStartDate", postStartDate);
                  messageApi.success({
                    content: `Gia hạn đến ${extendDates[record.id]} cho "${
                      record.title
                    }", đang chờ phê duyệt`,
                    duration: 3,
                  });
                  fetchRooms(pagination.current, pagination.pageSize);
                } catch (error: any) {
                  messageApi.error({
                    content: error.message || "Lỗi gia hạn bài đăng",
                    duration: 3,
                  });
                }
                setExtendingKey(null);
              }}
            >
              OK
            </Button>
          </Space>
        );

        // Nếu không bị xóa và đã hết hạn thì hiển thị nút Extend
        return (
          <Popover
            content={popoverContent}
            title="Chọn ngày kết thúc mới"
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
            <Button size="small" type="primary">
              Gia hạn
            </Button>
          </Popover>
        );
      },
      sorter: (a, b) => {
        const dateA = new Date(a.postEndDate);
        const dateB = new Date(b.postEndDate);
        return dateA.getTime() - dateB.getTime();
      },
    },
    {
      title: "Tình trạng",
      dataIndex: "available",
      key: "available",
      render: (available) =>
        available === 1 ? (
          <Tag color="green">Đã thuê</Tag>
        ) : (
          <Tag color="blue">Có sẵn</Tag>
        ),
      sorter: (a, b) => a.available - b.available,
    },
    {
      title: "Phê duyệt",
      dataIndex: "approval",
      key: "approval",
      sorter: (a, b) => a.approval - b.approval,
      render: (approval) => {
        if (approval === 0) {
          return <Tag color="orange">Đang chờ</Tag>;
        } else if (approval === 1) {
          return <Tag color="green">Đã phê duyệt</Tag>;
        } else {
          return <Tag color="red">Bị từ chối</Tag>;
        }
      },
    },
    {
      title: "Ẩn/Hiện",
      dataIndex: "hidden",
      key: "hidden",
      render: (hidden, record) => {
        const now = new Date();
        const end = new Date(record.postEndDate);
        const isExpired = now > end;
        const isRemoved = record.isRemoved === 1;

        // Nếu bài đã bị xóa thì hiển thị trạng thái
        if (isRemoved) {
          return <Tag color="red">Đã bị xóa</Tag>;
        }
        // Nếu bài đã hết hạn thì hiển thị trạng thái
        if (isExpired) {
          return <Tag color="gray">Bài đăng đã hết hạn</Tag>;
        }

        // Nếu không bị xóa và chưa hết hạn thì hiển thị nút Hide/Show
        return (
          <Popconfirm
            title={
              hidden === 1
                ? "Bạn có muốn hiển thị lại bài đăng này không?"
                : "Bạn có chắc muốn ẩn bài đăng này không?"
            }
            onConfirm={() => toggleHidden(record)}
          >
            <Button size="small" type={hidden === 1 ? "default" : "primary"}>
              {hidden === 1 ? "Hiện" : "Ẩn"}
            </Button>
          </Popconfirm>
        );
      },
      sorter: (a, b) => a.hidden - b.hidden,
      defaultSortOrder: "ascend",
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => {
        const now = new Date();
        // const start = new Date(record.postStartDate);
        const end = new Date(record.postEndDate);
        const isStillValid = now <= end;

        if (record.isRemoved === 1) {
          return (
            <span style={{ color: "red", fontWeight: 600 }}>
              Đã bị xóa bởi quản trị viên
            </span>
          );
        }

        if (!isStillValid) {
          return (
            <span style={{ color: "gray", fontWeight: 600 }}>
              Bài đăng đã hết hạn
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
          <h2 className="text-2xl font-semibold dark:!text-white">
            Quản lý phòng
          </h2>
          <p className="text-lg text-gray-500">Quản lý bài đăng phòng.</p>
        </div>
        <div>
          <Button
            type="primary"
            icon={<AiOutlinePlus size={18} />}
            onClick={() => router.push("/landlord/manage-rooms/add-room")}
          >
            Thêm phòng
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
        roomId={selectedRoomId}
        onSuccess={() => fetchRooms(pagination.current, pagination.pageSize)}
      />
      <RoomInfoModal
        open={isInfoModalOpen}
        onClose={() => setInfoModalOpen(false)}
        roomId={selectedRoomId}
      />
    </div>
  );
}

export default TableManageRoom;
