/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { EyeOutlined } from "@ant-design/icons";
import { Button, message, Popconfirm, Table, Tag } from "antd";
import { ColumnsType } from "antd/es/table";
import { useEffect } from "react";

import { requestProcessedNotification } from "@/services/NotificationService";
import {
  getRequestsByLandlordId,
  rejectRequirement,
  updateRequirementStatus,
  updateRequirementWithImage,
} from "@/services/Requirements";
import { PaginatedResponse, Requirement } from "@/types/types";
import { useSession } from "next-auth/react";
import { useState } from "react";
import CompletionModal from "../components/manage-requests/CompletionModal";
import RequestDetailModal from "../components/manage-requests/ModalRequest";

export default function ManageRequests() {
  const [requests, setRequests] = useState<Requirement[]>([]);
  const [paging, setPaging] = useState<PaginatedResponse<Requirement>>();
  const [loading, setLoading] = useState<boolean>(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Requirement | null>(
    null
  );
  const [completionModalOpen, setCompletionModalOpen] = useState(false);
  const [completingRequest, setCompletingRequest] =
    useState<Requirement | null>(null);
  const [completionLoading, setCompletionLoading] = useState(false);

  const fetchData = async (page = 0, size = 5) => {
    setLoading(true);
    try {
      const res = await getRequestsByLandlordId(page, size);
      setRequests(res?.data || []);
      setPaging(res);
      console.log("Paging:", {
        page: res.page,
        size: res.size,
        totalRecords: res.totalRecords,
        totalPages: res.totalPages,
      });
    } catch (error: any) {
      messageApi.error({
        content: error.message,
        duration: 2,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (pagination: any) => {
    const page = pagination.current - 1 || 0; // Convert AntD 1-based to backend 0-based
    const size = pagination.pageSize || 5;
    fetchData(page, size);
  };

  const handleStatusChange = async (
    id: string,
    userId: string,
    description: string
  ) => {
    try {
      await updateRequirementStatus(id);
      setRequests((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: (item.status = 1) } : item
        )
      );
      await requestProcessedNotification(
        session?.user.id,
        userId,
        "Yêu cầu " + description + " đã được chủ nhà xử lý thành công."
      );
      // Send notification to tenant
      messageApi.success({
        content: "Cập nhật trạng thái thành công!",
        duration: 2,
      });
    } catch (error: any) {
      messageApi.error({
        content: error.message,
        duration: 2,
      });
    }
  };

  //completed request
  const handleCompleteRequest = (record: Requirement) => {
    setCompletingRequest(record);
    setCompletionModalOpen(true);
  };

  const handleCompletionSubmit = async (imageFile?: File) => {
    if (!completingRequest) return;

    setCompletionLoading(true);
    try {
      await updateRequirementWithImage(
        completingRequest.id,
        completingRequest.description,
        imageFile
      );

      // Update local state
      setRequests((prev) =>
        prev.map((item) =>
          item.id === completingRequest.id ? { ...item, status: 1 } : item
        )
      );

      // Send notification
      await requestProcessedNotification(
        session?.user.id,
        completingRequest.userId,
        `Yêu cầu "${completingRequest.description}" đã được chủ nhà hoàn thành.`
      );

      messageApi.success({
        content: "Yêu cầu đã được hoàn thành thành công!",
        duration: 2,
      });

      setCompletionModalOpen(false);
      setCompletingRequest(null);
    } catch (error: any) {
      messageApi.error({
        content: error.message,
        duration: 2,
      });
    } finally {
      setCompletionLoading(false);
    }
  };
  //
  const handleReject = async (id: string) => {
    try {
      await rejectRequirement(id);
      setRequests((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: (item.status = 2) } : item
        )
      );
      messageApi.success({
        content: "Cập nhật trạng thái thành công!",
        duration: 2,
      });
      const userId = requests.find((req) => req.id === id)?.userId;
      const description = requests.find((req) => req.id === id)?.description;
      await requestProcessedNotification(
        session?.user.id,
        userId,
        "Yêu cầu " + description + " đã bị chủ nhà từ chối."
      );
    } catch (error: any) {
      messageApi.error({
        content: error.message,
        duration: 2,
      });
    }
  };

  const handleViewDetail = (record: Requirement) => {
    setSelectedRequest(record);
    setDetailModalOpen(true);
  };

  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user) return;
    // Initial load: page 0, size 5 (matching backend defaults)
    fetchData(0, 5);
  }, [session?.user]);

  const columns: ColumnsType<Requirement> = [
    {
      title: "STT",
      key: "stt",
      align: "right" as const,
      width: 80,
      render: (_: any, __: any, index: number) =>
        (paging?.page ?? 0) * (paging?.size ?? 5) + index + 1,
    },
    {
      title: "Tên phòng",
      dataIndex: "roomTitle",
      key: "roomTitle",
    },
    {
      title: "Tên khách hàng",
      dataIndex: "userName",
      key: "userName",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Mô tả yêu cầu",
      dataIndex: "description",
      key: "description",
      render: (text: string) => (
        <div className="max-w-xs truncate" title={text}>
          {text}
        </div>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdDate",
      key: "createdDate",
      width: 120,
      render: (date: string) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      },
      sorter: (a, b) =>
        new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime(),
    },
    {
      title: "Chi tiết",
      key: "detail",
      width: 80,
      render: (_, record) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
          className="text-blue-500 hover:text-blue-700"
          title="Xem chi tiết"
        />
      ),
    },
    // {
    //   title: "Status",
    //   dataIndex: "status",
    //   key: "status",
    //   render: (status, record) =>
    //     status === 0 ? (
    //       <Popconfirm
    //         title="Mark as completed?"
    //         onConfirm={() =>
    //           handleStatusChange(record.id, record.userId, record.description)
    //         }
    //         okText="Yes"
    //         cancelText="No"
    //       >
    //         <Button type="primary" size="small">
    //           Not processed
    //         </Button>
    //       </Popconfirm>
    //     ) : status === 1 ? (
    //       <Tag color="green">Completed</Tag>
    //     ) : (
    //       <Tag color="red">Rejected</Tag>
    //     ),
    // },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status, record) =>
        status === 0 ? (
          <Button
            type="primary"
            size="small"
            onClick={() => handleCompleteRequest(record)}
          >
            Chưa xử lý
          </Button>
        ) : status === 1 ? (
          <Tag color="green">Đã hoàn thành</Tag>
        ) : (
          <Tag color="red">Đã từ chối</Tag>
        ),
    },

    {
      title: "Hành động",
      dataIndex: "action",
      key: "action",
      render: (_, record) =>
        record.status === 0 ? (
          <Popconfirm
            title="Bạn có chắc chắn?"
            onConfirm={() => handleReject(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button
              type="default"
              size="small"
              style={{
                backgroundColor: "red",
                color: "white",
                borderColor: "red",
              }}
            >
              Từ chối
            </Button>
          </Popconfirm>
        ) : record.status === 1 ? (
          <Tag color="default">Đã hoàn thành</Tag>
        ) : (
          <Tag color="default">Đã từ chối</Tag>
        ),
    },
  ];

  return (
    <div className="p-4">
      {contextHolder}
      <div className="mb-4">
        <h2 className="text-2xl font-semibold dark:!text-white">
          Quản lý yêu cầu
        </h2>
        <p className="text-lg text-gray-500">Quản lý yêu cầu phòng</p>
      </div>
      <Table
        columns={columns}
        dataSource={requests || []}
        rowKey="id"
        loading={loading}
        pagination={{
          current: (paging?.page ?? 0) + 1, // Convert backend 0-based to AntD 1-based
          pageSize: paging?.size ?? 5,
          total: paging?.totalRecords ?? 0,
          // showSizeChanger: true,
          // showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} items`,
        }}
        onChange={handleTableChange}
      />

      {/* Detail Modal */}
      <RequestDetailModal
        open={detailModalOpen}
        onCancel={() => {
          setDetailModalOpen(false);
          setSelectedRequest(null);
        }}
        request={selectedRequest}
      />

      {/* Completion Modal */}
      <CompletionModal
        open={completionModalOpen}
        onCancel={() => {
          setCompletionModalOpen(false);
          setCompletingRequest(null);
        }}
        onSubmit={handleCompletionSubmit}
        loading={completionLoading}
      />
    </div>
  );
}
