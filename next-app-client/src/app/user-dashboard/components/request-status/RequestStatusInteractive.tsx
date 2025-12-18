/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  getRequestsByUser,
  updateRequest,
  updateRequirementWithImage,
  uploadRequirementImage,
} from "@/services/Requirements";
import {
  PaginatedResponse,
  RequirementDetail,
  UpdateRequestRoomDto,
} from "@/types/types";
import {
  Button,
  Form,
  Input,
  message,
  Modal,
  Space,
  Table,
  Tag,
  Image,
  Upload,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useSession } from "next-auth/react";
import React, { useCallback, useEffect, useState } from "react";
import { AiOutlineEdit } from "react-icons/ai";
import { UploadOutlined, EyeOutlined, EditOutlined } from "@ant-design/icons";
import CompletionViewModal from "./CompletionViewModal";

export type RequestFormValues = {
  roomName: string;
  requestDescription: string;
};
const RequestEditModalContent: React.FC<{
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: RequestFormValues, imageFile?: File) => void;
  editingRequest: RequirementDetail | null;
  setData: React.Dispatch<
    React.SetStateAction<PaginatedResponse<RequirementDetail>>
  >;
}> = ({ open, onCancel, onSubmit, editingRequest, setData }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (open && editingRequest) {
      form.setFieldsValue({
        roomName: editingRequest.roomTitle,
        requestDescription: editingRequest.description,
      });
      setFileList([]);
      setSelectedFile(null);
    } else if (open && !editingRequest) {
      form.resetFields();
    }
  }, [editingRequest, form, open]);

  const handleFinish = (values: RequestFormValues) => {
    onSubmit(values, selectedFile || undefined);
  };

  const uploadProps = {
    beforeUpload: (file: File) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        message.error("Bạn chỉ có thể tải lên các tệp hình ảnh!");
        return false;
      }
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error("Hình ảnh phải nhỏ hơn 10MB!");
        return false;
      }

      setSelectedFile(file);
      return false; // Prevent auto upload
    },
    onChange: ({ fileList }: any) => {
      setFileList(fileList);
    },
    fileList,
    maxCount: 1,
    accept: "image/*",
  };

  return (
    <Modal
      title={"Chỉnh sửa yêu cầu"}
      open={open}
      onCancel={onCancel}
      footer={null}
      destroyOnHidden={true}
      width={600}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <div className="max-h-[400px] overflow-y-auto pr-4">
          <Form.Item label="Tên phòng" name="roomName">
            <Input
              disabled
              placeholder={
                editingRequest ? editingRequest.roomTitle : "Tên phòng"
              }
            />
          </Form.Item>

          <Form.Item
            label="Mô tả yêu cầu"
            name="requestDescription"
            rules={[
              { required: true, message: "Vui lòng nhập mô tả yêu cầu!" },
              { min: 5, message: "Mô tả yêu cầu phải có ít nhất 5 ký tự." },
              { max: 500, message: "Mô tả yêu cầu không vượt quá 500 ký tự." },
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Nhập mô tả yêu cầu"
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item label="Cập nhật ảnh (Không bắt buộc)">
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>Chọn ảnh mới</Button>
            </Upload>
            {editingRequest?.imageUrl && !selectedFile && (
              <div style={{ marginTop: 8 }}>
                <p style={{ fontSize: 12, color: "#666" }}>Ảnh hiện tại:</p>
                <img
                  src={`https://res.cloudinary.com${editingRequest.imageUrl}`}
                  alt="Current"
                  style={{ maxWidth: 120, borderRadius: 8 }}
                />
              </div>
            )}
            {selectedFile && (
              <div style={{ marginTop: 8 }}>
                <p style={{ fontSize: 12, color: "#666" }}>Ảnh mới đã chọn:</p>
                <p style={{ fontSize: 12, color: "#1890ff" }}>
                  {selectedFile.name}
                </p>
              </div>
            )}
          </Form.Item>
        </div>

        <Form.Item>
          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={onCancel}>Hủy</Button>
            <Button type="primary" htmlType="submit">
              Cập nhật yêu cầu
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

const RequestStatusInteractive: React.FC = () => {
  const { data: session } = useSession();

  const [data, setData] = useState<PaginatedResponse<RequirementDetail>>({
    data: [],
    page: 0,
    size: 5,
    totalElements: 0,
    totalRecords: 0,
    totalPages: 0,
  });

  const [requests, setRequests] = useState<RequirementDetail[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] =
    useState<RequirementDetail | null>(null);
  const [messageApi, contextHolder] = message.useMessage();

  const [completionViewModalOpen, setCompletionViewModalOpen] = useState(false);
  const [viewingRequest, setViewingRequest] =
    useState<RequirementDetail | null>(null);

  const fetchData = useCallback(
    async (page = 0, size = 5) => {
      if (!session) return;

      setLoading(true);
      try {
        const res = await getRequestsByUser(session, page, size);
        setRequests(res?.data || []);
        setData(res);
        console.log("User Requests Paging:", {
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
    },
    [session, messageApi]
  );

  const handleTableChange = (pagination: any) => {
    const page = pagination.current - 1 || 0;
    const size = pagination.pageSize || 5;
    fetchData(page, size);
  };

  useEffect(() => {
    if (!session?.user) return;
    fetchData(0, 5);
  }, [session?.user, fetchData]);

  const handleViewCompletion = (record: RequirementDetail) => {
    setViewingRequest(record);
    setCompletionViewModalOpen(true);
  };

  // const getStatusDisplay = (status: 0 | 1 | 2) => {
  //   switch (status) {
  //     case 0:
  //       return { text: "Not Processed", color: "orange" };
  //     case 1:
  //       return { text: "Completed", color: "green" };
  //     case 2:
  //       return { text: "Rejected", color: "red" };
  //     default:
  //       return { text: "Unknown", color: "default" };
  //   }
  // };
  const getStatusDisplay = (status: 0 | 1 | 2, record: RequirementDetail) => {
    switch (status) {
      case 0:
        return <Tag color="orange">Chưa xử lý</Tag>;
      case 1:
        return (
          <div className="flex items-center gap-2">
            <Tag color="green">Đã hoàn thành</Tag>
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleViewCompletion(record)}
              className="text-blue-500 hover:text-blue-700"
              title="Xem chi tiết hoàn thành"
            />
          </div>
        );
      case 2:
        return <Tag color="red">Từ chối</Tag>;
      default:
        return <Tag color="default">Không xác định</Tag>;
    }
  };

  const handleFormSubmit = async (
    values: RequestFormValues,
    imageFile?: File
  ) => {
    if (!editingRequest) return;

    try {
      await updateRequirementWithImage(
        editingRequest.id,
        values.requestDescription,
        imageFile
      );
      await fetchData(data.page || 0, data.size || 5);

      messageApi.success("Cập nhật yêu cầu thành công!");
    } catch (error: any) {
      messageApi.error("Cập nhật yêu cầu thất bại.");
    }

    setIsFormModalOpen(false);
    setEditingRequest(null);
  };

  const handleEditRequest = (record: RequirementDetail) => {
    setEditingRequest(record);
    setIsFormModalOpen(true);
  };

  const handleCancelModal = () => {
    setIsFormModalOpen(false);
    setEditingRequest(null);
  };

  const columns: ColumnsType<RequirementDetail> = [
    {
      title: "STT",
      key: "stt",
      align: "right" as const,
      width: 80,
      render: (_: any, __: any, index: number) =>
        (data?.page ?? 0) * (data?.size ?? 5) + index + 1,
    },
    {
      title: "Ảnh",
      dataIndex: "imageUrl",
      key: "imageUrl",
      width: 100,
      render: (imageUrl: string) => {
        const getImageUrl = (imageUrl?: string): string => {
          if (!imageUrl) return "";
          if (imageUrl.startsWith("http")) {
            return imageUrl;
          }
          return `https://res.cloudinary.com${imageUrl}`;
        };

        return imageUrl ? (
          <Image
            src={getImageUrl(imageUrl)}
            alt="Ảnh yêu cầu"
            width={60}
            height={60}
            style={{ objectFit: "cover", borderRadius: "4px" }}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
          />
        ) : (
          <div className="w-[60px] h-[60px] bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
            Không có ảnh
          </div>
        );
      },
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
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: 0 | 1 | 2, record: RequirementDetail) => {
        switch (status) {
          case 0:
            return <Tag color="orange">Chưa xử lý</Tag>;
          case 1:
            return (
              <div className="flex items-center gap-2">
                <Tag color="green">Đã hoàn thành</Tag>
                <Button
                  type="text"
                  icon={<EyeOutlined />}
                  size="small"
                  onClick={() => handleViewCompletion(record)}
                  className="text-blue-500 hover:text-blue-700"
                  title="Xem chi tiết hoàn thành"
                />
              </div>
            );
          case 2:
            return <Tag color="red">Từ chối</Tag>;
          default:
            return <Tag color="default">Không xác định</Tag>;
        }
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record: RequirementDetail) => (
        <Button
          type="text"
          icon={<EditOutlined />}
          onClick={() => handleEditRequest(record)}
          className="text-blue-500 hover:text-blue-700"
          disabled={record.status !== 0}
          title={
            record.status !== 0
              ? "Không thể sửa yêu cầu đã xử lý"
              : "Chỉnh sửa yêu cầu"
          }
        />
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
      </div>

      <Table<RequirementDetail>
        columns={columns}
        dataSource={requests}
        rowKey="id"
        loading={loading}
        pagination={{
          current: (data?.page ?? 0) + 1,
          pageSize: data?.size ?? 5,
          total: data?.totalRecords ?? 0,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} trong tổng số ${total} mục`,
        }}
        onChange={handleTableChange}
      />

      {/* Edit Modal - Bỏ Modal wrapper */}
      <RequestEditModalContent
        open={isFormModalOpen}
        onCancel={() => {
          setIsFormModalOpen(false);
          setEditingRequest(null);
        }}
        onSubmit={handleFormSubmit}
        editingRequest={editingRequest}
        setData={setData}
      />

      {/* Completion View Modal */}
      <CompletionViewModal
        open={completionViewModalOpen}
        onCancel={() => {
          setCompletionViewModalOpen(false);
          setViewingRequest(null);
        }}
        description={viewingRequest?.description}
        imageUrl={viewingRequest?.imageUrl}
        roomTitle={viewingRequest?.roomTitle}
      />
    </div>
  );
};

export default RequestStatusInteractive;
