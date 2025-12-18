/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, message, Popconfirm, Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import React, { useContext, useState } from "react";
import { AiOutlineInfoCircle, AiOutlineMail } from "react-icons/ai";
import { ThemeContext } from "../context/ThemeContext";
import { sendAdminEmailToLandlordWithFile } from "../service/RoomService";
import type { RoomResponseDto } from "../types/type";
// import type { UploadFile } from "antd/es/upload";
import { useQuery } from "@tanstack/react-query";
import {
  getRoomQueryOptions,
  useDeleteRoom,
  useUpdateApproval,
} from "../service/ReactQueryRoom";
import RoomDetailModal from "./RoomDetailModal";
import SendMailModal from "./SendMailModal";

const TableManageRoom: React.FC = () => {
  const [sortField, setSortField] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<string | undefined>(undefined);
  const [selectedRoom, setSelectedRoom] = useState<RoomResponseDto | null>(
    null
  );
  const [isModalOpen, setModalOpen] = useState(false);
  const [isInfoModalOpen, setInfoModalOpen] = useState(false);
  const { isDark } = useContext(ThemeContext);
  const [page, setPage] = useState(0);

  const pageSize = 5;
  const [messageApi, contextHolder] = message.useMessage();
  // const [form] = Form.useForm();

  const { data, isLoading, refetch } = useQuery(
    getRoomQueryOptions(page, pageSize, sortField, sortOrder)
  );

  // Reset to first page when sort changes
  React.useEffect(() => {
    setPage(0);
  }, [sortField, sortOrder]);

  const updateApprovalMutation = useUpdateApproval({
    mutationConfig: {
      onSuccess: () => {
        refetch();
        messageApi.success({
          content: "Bạn đã cập nhật trạng thái phê duyệt phòng thành công!",
          duration: 3,
        });
      },
      onError: (error: any) => {
        messageApi.error({
          content:
            error?.response?.data?.message?.join(", ") || "Đã xảy ra lỗi!",
          duration: 3,
        });
      },
    },
  });
  const updateApproval = (record: RoomResponseDto, value: 1 | 2) => {
    console.log("Updating approval for phòng:", record.id, "to status:", value);
    updateApprovalMutation.mutate({
      roomId: record.id,
      status: value,
      page,
      pageSize,
    });
  };

  const deleteMutation = useDeleteRoom({
    mutationConfig: {
      onSuccess: (_, variables) => {
        refetch();
        messageApi.success({
          content:
            variables && variables.isRemoved === 0
              ? "Bài đăng đã được khôi phục."
              : "Bạn đã xóa phòng thành công!",
          duration: 3,
        });
      },
      onError: (error: any) => {
        messageApi.error({
          content:
            error?.response?.data?.message?.join(", ") || "Đã xảy ra lỗi!",
          duration: 3,
        });
      },
    },
  });
  const toggleRemove = (record: RoomResponseDto) => {
    console.log("Removing phòng:", record.id);
    deleteMutation.mutate({
      roomId: record.id,
      isRemoved: record.isRemoved === 1 ? 0 : 1,
      page,
      pageSize,
    });
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
      title: "Tên phòng",
      dataIndex: "title",
      key: "title",
      sorter: true,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      width: 250,
      render: (text: string) => (
        <div className="line-clamp-5 break-words">{text}</div>
      ),
    },
    {
      title: "Tên chủ nhà",
      dataIndex: "landlordFullName",
      key: "landlordFullName",
      render: (text) => <span>{text}</span>,
    },
    {
      title: "Địa chỉ",
      key: "address",
      render: (_, record) => {
        const addr = record.address;
        if (!addr) return "";
        const street = addr.street || "";
        const ward = addr.ward?.name || "";
        const district = addr.ward?.district?.name || "";
        const province = addr.ward?.district?.province?.name || "";
        return `${street}, ${ward}, ${district}, ${province}`;
      },
    },
    {
      title: "Giá/tháng",
      dataIndex: "priceMonth",
      key: "priceMonth",
      sorter: true,
      render: (priceMonth) =>
        priceMonth ? priceMonth.toLocaleString() + " ₫" : "N/A",
    },
    {
      title: "Tình trạng",
      dataIndex: "available",
      key: "available",
      render: (available: number) => {
        const label = available === 1 ? "Đã thuê" : "Còn trống";
        const color = available === 1 ? "green" : "blue";
        return <Tag color={color}>{label}</Tag>;
      },
      sorter: true,
    },
    {
      title: "Phê duyệt",
      key: "approval",
      sorter: true,
      render: (_, record) => {
        if (record.isRemoved === 1) {
          return <Tag color="red">Bài đăng đã bị xóa</Tag>;
        } else if (record.approval === 0) {
          return (
            <Space>
              <Popconfirm
                title="Bạn có chắc chắn muốn phê duyệt phòng này?"
                onConfirm={() => updateApproval(record, 1)}
                okText="Có"
                cancelText="Không"
              >
                <Button size="small" type="primary">
                  Phê duyệt
                </Button>
              </Popconfirm>
              <Popconfirm
                title="Bạn có chắc chắn muốn từ chối phòng này?"
                onConfirm={() => updateApproval(record, 2)}
                okText="Có"
                cancelText="Không"
              >
                <Button size="small" danger>
                  Từ chối
                </Button>
              </Popconfirm>
            </Space>
          );
        } else if (record.approval === 1) {
          return <Tag color="green">Đã phê duyệt</Tag>;
        } else {
          return <Tag color="red">Đã từ chối</Tag>;
        }
      },
    },
    {
      title: "Xóa bài đăng",
      key: "remove",
      render: (_, record) => (
        <Popconfirm
          title={
            record.isRemoved === 1
              ? "Bạn có muốn hiển thị lại bài đăng này?"
              : "Bạn có chắc chắn muốn xóa bài đăng này?"
          }
          onConfirm={() => toggleRemove(record)}
          okText="Có"
          cancelText="Không"
        >
          <Button
            size="small"
            danger={record.isRemoved === 0}
            type={record.isRemoved === 1 ? "default" : "primary"}
          >
            {record.isRemoved === 1 ? "Đã xóa" : "Xóa"}
          </Button>
        </Popconfirm>
      ),
    },
    {
      title: "Hành động",
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
  console.log(data);
  return (
    <>
      {contextHolder}
      <Table
        columns={columns}
        dataSource={data?.rooms}
        rowKey="id"
        loading={isLoading}
        pagination={{
          pageSize,
          current: page + 1,
          total: data?.totalRecords || 0,
          onChange: (p) => setPage(p - 1),
        }}
        onChange={(_pagination, _filters, sorter) => {
          // AntD Table passes sorter.field as the dataIndex, but our approval column has key only
          let field = undefined;
          if (!Array.isArray(sorter) && sorter && sorter.order) {
            field = sorter.field || sorter.columnKey;
            setSortField(field as string);
            setSortOrder(sorter.order === "ascend" ? "asc" : "desc");
          } else {
            setSortField(undefined);
            setSortOrder(undefined);
          }
        }}
      />
      {/* ...existing code for modals... */}
      <SendMailModal
        open={isModalOpen}
        onCancel={() => setModalOpen(false)}
        landlordEmail={selectedRoom?.landlordEmail ?? ""}
        onSend={async (formData) => {
          await sendAdminEmailToLandlordWithFile(formData);
        }}
        isDark={isDark}
      />
      <RoomDetailModal
        roomId={selectedRoom?.id}
        open={isInfoModalOpen}
        onCancel={() => setInfoModalOpen(false)}
      />
    </>
  );
};

export default TableManageRoom;
