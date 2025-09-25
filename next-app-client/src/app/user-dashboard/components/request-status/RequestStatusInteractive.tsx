/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { getRequestsByUser, updateRequest, uploadRequirementImage } from "@/services/Requirements";
import {
  PaginatedResponse,
  RequirementDetail,
  UpdateRequestRoomDto,
} from "@/types/types";
import { Button, Form, Input, message, Modal, Space, Table, Tag, Image, Upload } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useSession } from "next-auth/react";
import React, { useCallback, useEffect, useState } from "react";
import { AiOutlineEdit } from "react-icons/ai";
import { UploadOutlined, EyeOutlined } from "@ant-design/icons";

export type RequestFormValues = {
  roomName: string;
  requestDescription: string;
};

const RequestEditModalContent: React.FC<{
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: RequestFormValues) => void;
  editingRequest: RequirementDetail | null;
  setData: React.Dispatch<React.SetStateAction<PaginatedResponse<RequirementDetail>>>;
}> = ({ open, onCancel, onSubmit, editingRequest, setData }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);

  useEffect(() => {
    if (open && editingRequest) {
      form.setFieldsValue(editingRequest);
    } else if (open && !editingRequest) {
      form.resetFields();
    }
  }, [editingRequest, form, open]);

  const handleFinish = (values: RequestFormValues) => {
    onSubmit(values);
  };

  const handleUpload = async (file: File) => {
    if (!editingRequest) return;
    await uploadRequirementImage(editingRequest.id, file);
    setData((prev) => ({
      ...prev,
      data: prev.data.map((item) =>
        item.id === editingRequest.id
          ? { ...item, imageUrl: `/dmvvs0ags/image/upload/...${file.name}` }
          : item
      ),
    }));
    message.success("Image updated!");
  };

  return (
    <Modal
      title={"Edit Request"}
      open={open}
      onCancel={onCancel}
      footer={null}
      destroyOnHidden={true}
      width={600}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <div className="max-h-[400px] overflow-y-auto pr-4">
          <Form.Item label="Room Name" name="roomName">
            <Input
              disabled
              placeholder={
                editingRequest ? editingRequest.roomTitle : "Room name"
              }
            />
          </Form.Item>

          <Form.Item
            label="Request Description"
            name="requestDescription"
            rules={[
              { required: true, message: "Please enter request description!" },
              { min: 5, message: "Request description must be at least 5 characters." },
              { max: 500, message: "Request description cannot exceed 500 characters." },
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder={
                editingRequest
                  ? editingRequest.description
                  : "e.g., Request description"
              }
            />
          </Form.Item>

          <Form.Item label="Update Image">
            <Upload
              beforeUpload={(file) => {
                handleUpload(file);
                return false; 
              }}
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              accept="image/*"
              maxCount={1}
              showUploadList={true}
            >
              <Button icon={<UploadOutlined />}>Select Image</Button>
            </Upload>
            {editingRequest?.imageUrl && (
              <img
                src={`https://res.cloudinary.com${editingRequest.imageUrl}`}
                alt="Current"
                style={{ marginTop: 8, maxWidth: 120, borderRadius: 8 }}
              />
            )}
          </Form.Item>
        </div>

        <Form.Item>
          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              Update Request
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

const RequestStatusInteractive: React.FC = () => {
  const { data: session } = useSession();

  // ✅ Fix: khởi tạo mặc định rỗng
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
  const [editingRequest, setEditingRequest] = useState<RequirementDetail | null>(null);
  const [messageApi, contextHolder] = message.useMessage();

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
    const page = pagination.current - 1 || 0; // Convert AntD 1-based to backend 0-based
    const size = pagination.pageSize || 5;
    fetchData(page, size);
  };

  useEffect(() => {
    if (!session?.user) return;
    fetchData(0, 5);
  }, [session?.user, fetchData]);

  const getStatusDisplay = (status: 0 | 1 | 2) => {
    switch (status) {
      case 0:
        return { text: "Not Processed", color: "orange" };
      case 1:
        return { text: "Completed", color: "green" };
      case 2:
        return { text: "Rejected", color: "red" };
      default:
        return { text: "Unknown", color: "default" };
    }
  };

  const handleFormSubmit = async (values: RequestFormValues) => {
    if (editingRequest) {
      const payload: UpdateRequestRoomDto = {
        id: editingRequest.id,
        description: values.requestDescription,
      };
      try {
        await updateRequest(payload);
        const updatedRequests = requests.map((item: RequirementDetail) =>
          item.id === editingRequest.id
            ? { ...item, description: values.requestDescription }
            : item
        );
        setRequests(updatedRequests);
        messageApi.success({
          content: "Request updated successfully!",
          duration: 2,
        });
      } catch (error: any) {
        messageApi.error({
          content: error.message || "Failed to update request.",
          duration: 2,
        });
      }
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
      align: "right",
      width: 80,
      render: (_: any, __: any, index: number) =>
        (data.page ?? 0) * (data.size ?? 5) + index + 1,
    },
    {
      title: "Image",
      dataIndex: "imageUrl",
      key: "imageUrl",
      render: (imageUrl: string | undefined) =>
        imageUrl ? (
          <Image
            src={`https://res.cloudinary.com${imageUrl}`}
            alt="Request"
            width={40}
            height={40}
            style={{ borderRadius: 8, objectFit: "cover" }}
            preview={{
              mask: <EyeOutlined style={{ fontSize: 22, color: "#fff" }} />,
            }}
            placeholder={
              <div
                style={{
                  width: 40,
                  height: 40,
                  background: "#eee",
                  borderRadius: 8,
                }}
              />
            }
          />
        ) : (
          <span style={{ color: "#ffffff" }}>No image</span>
        ),
      width: 100,
    },
    {
      title: "Room Name",
      dataIndex: "roomTitle",
      key: "roomTitle",
    },
    {
      title: "Customer Name",
      dataIndex: "userName",
      key: "userName",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Request Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Created Date",
      dataIndex: "createdDate",
      key: "createdDate",
      width: 130,
      render: (date: string) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      },
      sorter: (a, b) =>
        new Date(a.createdDate || "").getTime() -
        new Date(b.createdDate || "").getTime(),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: 0 | 1 | 2) => {
        const { text, color } = getStatusDisplay(status);
        return <Tag color={color}>{text}</Tag>;
      },
      sorter: (a, b) => a.status - b.status,
      width: 120,
    },
    {
      title: "Actions",
      key: "actions",
      width: 80,
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<AiOutlineEdit size={18} />}
            onClick={() => handleEditRequest(record)}
            title="Edit Request"
            disabled={record.status === 1 || record.status === 2}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="flex flex-col flex-1 p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
      {contextHolder}
      <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-white">
        Request Management
      </h2>


      <Table
        columns={columns}
        dataSource={requests || []}
        rowKey="id"
        loading={loading}
        pagination={{
          current: (data.page ?? 0) + 1,
          pageSize: data.size ?? 5,
          total: data.totalRecords ?? 0,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} items`,
        }}
        onChange={handleTableChange}
        className="mt-4 mb-8 border border-gray-200 rounded-md dark:border-gray-700"
      />

      {isFormModalOpen && (
        <RequestEditModalContent
          open={isFormModalOpen}
          onCancel={handleCancelModal}
          onSubmit={handleFormSubmit}
          editingRequest={editingRequest}
          setData={setData}
        />
      )}
    </div>
  );
};

export default RequestStatusInteractive;
