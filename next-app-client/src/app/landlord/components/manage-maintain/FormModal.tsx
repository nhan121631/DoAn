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
      title={initialData ? "Edit Maintenance" : "Add New Maintenance"}
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
            label="Room Name"
            name="roomId"
            rules={[{ required: true, message: "Please select a room!" }]}
          >
            <Select
              placeholder="Select a room"
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
            label="Problem"
            name="problem"
            rules={[
              {
                required: true,
                message: "Please enter a problem description!",
              },
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder="For example: Broken faucet, power outage..."
            />
          </Form.Item>

          <Form.Item
            label="Cost"
            name="cost"
            rules={[{ required: true, message: "Please enter a cost!" }]}
          >
            <Input type="number" placeholder="For example: 150000" />
          </Form.Item>

          {initialData && (
            <Form.Item
              label="Status"
              name="status"
              rules={[{ required: true, message: "Please select a status!" }]}
            >
              <Select placeholder="Select a status">
                <Option value={RequestStatus.PENDING}>Pending</Option>
                <Option value={RequestStatus.IN_PROGRESS}>In Progress</Option>
                <Option value={RequestStatus.COMPLETED}>Completed</Option>
              </Select>
            </Form.Item>
          )}
        </div>

        <Form.Item>
          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {initialData ? "Update" : "Create"}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};
