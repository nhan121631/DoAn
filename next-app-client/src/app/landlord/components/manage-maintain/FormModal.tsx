/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import {
  CreateMaintenanceFormValues,
  Maintenance,
  RequestStatus,
  Room,
  UpdateMaintenanceFormValues,
} from "@/types/types";
import { Button, Form, Input, Modal, Select } from "antd";
import React, { useEffect } from "react";

const { Option } = Select;

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: Maintenance | null;
  availableRooms: Room[];
  onSubmit: (
    values: CreateMaintenanceFormValues | UpdateMaintenanceFormValues
  ) => void;
  loading: boolean;
}

export const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  onClose,
  initialData,
  availableRooms,
  onSubmit,
  loading,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        form.setFieldsValue({
          ...initialData,
          roomId: initialData.room.id,
        });
      } else {
        form.resetFields();
      }
    }
  }, [isOpen, initialData, form]);

  const handleFinish = (values: any) => {
    onSubmit(values);
  };

  return (
    <Modal
      title={initialData ? "Sửa yêu cầu bảo trì" : "Thêm yêu cầu bảo trì"}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={
          initialData ? { ...initialData, roomId: initialData.room.id } : {}
        }
      >
        <div className="max-h-[400px] overflow-y-auto pr-4">
          <Form.Item
            label="Tên phòng"
            name="roomId"
            rules={[{ required: true, message: "Vui lòng chọn phòng!" }]}
          >
            <Select
              placeholder="Chọn phòng"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                String(option?.children)
                  .toLowerCase()
                  .indexOf(input.toLowerCase()) >= 0
              }
              disabled={!!initialData}
            >
              {availableRooms.map((room) => (
                <Option key={room.id} value={room.id}>
                  {room.title}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Vấn đề"
            name="problem"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập mô tả vấn đề!",
              },
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Ví dụ: Vòi nước hỏng, mất điện..."
            />
          </Form.Item>

          <Form.Item
            label="Chi phí"
            name="cost"
            rules={[{ required: true, message: "Vui lòng nhập chi phí!" }]}
          >
            <Input type="number" placeholder="Ví dụ: 150000" />
          </Form.Item>

          {initialData && (
            <Form.Item
              label="Trạng thái"
              name="status"
              rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
            >
              <Select placeholder="Chọn trạng thái">
                <Option value={RequestStatus.PENDING}>Đang chờ</Option>
                <Option value={RequestStatus.IN_PROGRESS}>
                  Đang tiến hành
                </Option>
                <Option value={RequestStatus.COMPLETED}>Hoàn thành</Option>
              </Select>
            </Form.Item>
          )}
        </div>

        <Form.Item>
          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={onClose} disabled={loading}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {initialData ? "Cập nhật" : "Thêm"}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};
