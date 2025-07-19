"use client";

import React, { useEffect, useCallback, useContext } from "react";
import { Modal, Button, Input, Select, Form } from "antd";
import { ThemeContext } from "@/app/context/ThemeContext";
import { Room, MaintainData, FormValues } from "@/types/maintenance";

const { Option } = Select;

interface FormModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: FormValues) => void;
  editingMaintain: MaintainData | null;
  availableRooms: Room[]; // Vẫn nhận từ props
}

// Component con chứa Form và useForm()
const FormContent: React.FC<{
  editingMaintain: MaintainData | null;
  onSubmit: (values: FormValues) => void;
  availableRooms: Room[];
}> = ({ editingMaintain, onSubmit, availableRooms }) => {
  const [form] = Form.useForm();
  const { isDark } = useContext(ThemeContext);

  useEffect(() => {
    if (editingMaintain) {
      form.setFieldsValue(editingMaintain);
    } else {
      form.resetFields();
    }
  }, [editingMaintain, form]);

  const handleRoomNameChange = useCallback((value: string) => {
    const selectedRoom = availableRooms.find(room => room.name === value);
    if (selectedRoom) {
      form.setFieldsValue({ address: selectedRoom.address });
    } else {
      form.setFieldsValue({ address: "" });
    }
  }, [form, availableRooms]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onSubmit}
    >
      <Form.Item
        label="Room Name"
        name="roomName"
        rules={[{ required: true, message: "Please select a room name!" }]}
      >
        <Select
          placeholder="Select a room"
          onChange={handleRoomNameChange}
          showSearch
          optionFilterProp="children"
          filterOption={(input, option) =>
            String(option?.children).toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {availableRooms.map((room) => (
            <Option key={room.name} value={room.name}>
              {room.name}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        label="Address"
        name="address"
        rules={[{ required: true, message: "Please enter address!" }]}
      >
        <Input
          value={form.getFieldValue('address')}
          onChange={(e) => form.setFieldsValue({ address: e.target.value })}
        />
      </Form.Item>
      <Form.Item
        label="Description"
        name="issue"
        rules={[{ required: true, message: "Please describe the issue!" }]}
      >
        <Input.TextArea rows={3} />
      </Form.Item>
      <Form.Item
        label="Estimated costs (₫)"
        name="cost"
        rules={[{ pattern: /^\d+(\.\d{1,2})?$/, message: 'Please enter a valid number!' }]}
      >
        <Input type="number" />
      </Form.Item>
      {editingMaintain && (
        <Form.Item
          label="Status"
          name="status"
          rules={[{ required: true, message: "Please select a status!" }]}
        >
          <Select>
            <Option value="Pending">Pending</Option>
            <Option value="In Progress">In Progress</Option>
            <Option value="Completed">Completed</Option>
          </Select>
        </Form.Item>
      )}
      <Form.Item>
        <Button type="primary" htmlType="submit" className="w-full">
          {editingMaintain ? "Update" : "Add"}
        </Button>
      </Form.Item>
    </Form>
  );
};

const FormModal: React.FC<FormModalProps> = ({
  open,
  onCancel,
  onSubmit,
  editingMaintain,
  availableRooms,
}) => {
  const { isDark } = useContext(ThemeContext);

  return (
    <Modal
      title={editingMaintain ? "Edit Maintenance" : "Add New Maintenance"}
      open={open}
      onCancel={onCancel}
      footer={null}
      className={isDark ? "dark" : ""}
      destroyOnHidden={true}
    >
      {/* Chỉ render FormContent khi modal mở */}
      {open && (
        <FormContent
          editingMaintain={editingMaintain}
          onSubmit={onSubmit}
          availableRooms={availableRooms}
        />
      )}
    </Modal>
  );
};

export default FormModal;
