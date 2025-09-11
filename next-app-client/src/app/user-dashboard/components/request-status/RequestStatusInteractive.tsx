/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { updateRequest } from "@/services/Requirements";
import {
  PaginatedResponse,
  // Requirement,
  RequirementDetail,
  UpdateRequestRoomDto,
} from "@/types/types";
import { Button, Form, Input, message, Modal, Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import React, { useEffect, useState } from "react";
import { AiOutlineEdit } from "react-icons/ai";

//trường trong bảng
export type RequestFormValues = {
  roomName: string;
  requestDescription: string;
};

interface RequestStatusInteractiveProps {
  initialRequests: PaginatedResponse<RequirementDetail>;
}

// Component con để chứa Modal và Form của nó, quản lý useForm riêng
const RequestEditModalContent: React.FC<{
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: RequestFormValues) => void;
  editingRequest: RequirementDetail | null;
}> = ({ open, onCancel, onSubmit, editingRequest }) => {
  const [form] = Form.useForm();

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

  // const handleRoomNameChange = (value: string) => {};

  return (
    <Modal
      title={"Edit Request"}
      // title={editingRequest ? "Edit Request" : "Add New Request"}

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
              {
                min: 5,
                message: "Request description must be at least 5 characters.",
              },
              {
                max: 500,
                message: "Request description cannot exceed 500 characters.",
              },
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

const RequestStatusInteractive: React.FC<RequestStatusInteractiveProps> = ({
  initialRequests,
}) => {
  const [data, setData] =
    useState<PaginatedResponse<RequirementDetail>>(initialRequests);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] =
    useState<RequirementDetail | null>(null);
  const [messageApi, contextHolder] = message.useMessage();

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
        // Update local state only after successful API call
        const updatedData = data.data.map((item: RequirementDetail) =>
          item.id === editingRequest.id
            ? {
                ...item,
                description: values.requestDescription,
              }
            : item
        );
        setData({ ...data, data: updatedData });
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
      align: "right" as const,
      width: 80,
      render: (_: any, __: any, index: number) => index + 1,
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
      {/* <div className="flex items-center justify-end mb-6">
        <Input.Search
          placeholder="Search requests..."
          style={{ width: 250 }}
          onSearch={(value) => {
            const filteredData = initialRequests.filter(
              (request) =>
                request.roomName.toLowerCase().includes(value.toLowerCase()) ||
                request.customerName
                  .toLowerCase()
                  .includes(value.toLowerCase()) ||
                request.requestDescription
                  .toLowerCase()
                  .includes(value.toLowerCase())
            );
            setData(filteredData);
          }}
          onChange={(e) => {
            if (e.target.value === "") {
              setData(initialRequests);
            }
          }}
        />
      </div> */}

      <Table
        columns={columns}
        dataSource={data.data}
        rowKey="id"
        pagination={{ pageSize: 7 }}
        className="mt-4 mb-8 border border-gray-200 rounded-md dark:border-gray-700"
      />

      {isFormModalOpen && (
        <RequestEditModalContent
          open={isFormModalOpen}
          onCancel={handleCancelModal}
          onSubmit={handleFormSubmit}
          editingRequest={editingRequest}
        />
      )}
    </div>
  );
};

export default RequestStatusInteractive;
