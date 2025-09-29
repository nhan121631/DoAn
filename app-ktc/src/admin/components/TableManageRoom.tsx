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
          content: "You updated the room approval status successfully!",
          duration: 3,
        });
      },
      onError: (error: any) => {
        messageApi.error({
          content:
            error?.response?.data?.message?.join(", ") ||
            "An error has occurred!",
          duration: 3,
        });
      },
    },
  });
  const updateApproval = (record: RoomResponseDto, value: 1 | 2) => {
    console.log("Updating approval for room:", record.id, "to status:", value);
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
              ? "Post is now recovered."
              : "You removed the room successfully!",
          duration: 3,
        });
      },
      onError: (error: any) => {
        messageApi.error({
          content:
            error?.response?.data?.message?.join(", ") ||
            "An error has occurred!",
          duration: 3,
        });
      },
    },
  });
  const toggleRemove = (record: RoomResponseDto) => {
    console.log("Removing room:", record.id);
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
      title: "Room Name",
      dataIndex: "title",
      key: "title",
      sorter: true,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: 250,
      render: (text: string) => (
        <div className="line-clamp-5 break-words">{text}</div>
      ),
    },
    {
      title: "Owner Name",
      dataIndex: "landlordFullName",
      key: "landlordFullName",
      render: (text) => <span>{text}</span>,
    },
    {
      title: "Address",
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
      title: "Price/month",
      dataIndex: "priceMonth",
      key: "priceMonth",
      sorter: true,
      render: (priceMonth) =>
        priceMonth ? priceMonth.toLocaleString() + " ₫" : "N/A",
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
      sorter: true,
    },
    {
      title: "Approval",
      key: "approval",
      sorter: true,
      render: (_, record) => {
        if (record.isRemoved === 1) {
          return <Tag color="red">Post Removed</Tag>;
        } else if (record.approval === 0) {
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
          onConfirm={() => toggleRemove(record)}
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
