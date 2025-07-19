// src/app/landlord/ManageMaintain/components/MaintenanceFormModal.tsx
"use client"; // Đây là Client Component

import React, { useEffect, useCallback } from "react";
import { Modal, Button, Input, Select, Form } from "antd"; // Đã xóa 'message'
import { ThemeContext } from "@/app/context/ThemeContext";
import { useContext } from "react";

const { Option } = Select;

// Định nghĩa kiểu dữ liệu cho một phòng
type Room = {
  name: string;
  address: string;
};

// Định nghĩa kiểu dữ liệu cho các giá trị từ Form
type FormValues = {
  roomName: string;
  address: string;
  issue: string;
  cost: number;
  status?: "Pending" | "Completed" | "In Progress";
};

type MaintainData = {
  key: string;
  roomName: string;
  address: string;
  issue: string;
  cost: number;
  date: string;
  status: "Pending" | "Completed" | "In Progress";
};

// Danh sách các phòng có sẵn (dữ liệu giả định) - Đặt ở ngoài để tránh re-render không cần thiết
const availableRooms: Room[] = [
  { name: "Mr. Nam's Room 1", address: "Thanh Xuan, Hanoi" },
  { name: "Mr. Nam's Room 2", address: "Dong Da, Hanoi" },
  { name: "Room 506", address: "Cau Giay, Hanoi" },
  { name: "Ms. Lan's Room 1", address: "Hoan Kiem, Hanoi" },
  { name: "Ms. Lan's Room 2", address: "Ba Dinh, Hanoi" },
];

interface MaintenanceFormModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: FormValues) => void;
  editingMaintain: MaintainData | null;
  availableRooms: Room[]; // THÊM DÒNG NÀY
}

// Component con chứa Form và useForm()
const MaintenanceFormContent: React.FC<{
  editingMaintain: MaintainData | null;
  onSubmit: (values: FormValues) => void;
  availableRooms: Room[];
}> = ({ editingMaintain, onSubmit, availableRooms }) => {
  const [form] = Form.useForm(); // useForm() chỉ được gọi khi component này được render
  const { isDark } = useContext(ThemeContext); // 'isDark' được sử dụng trong className của Modal, nên giữ lại

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


const MaintenanceFormModal: React.FC<MaintenanceFormModalProps> = ({
  open,
  onCancel,
  onSubmit,
  editingMaintain,
  availableRooms, // NHẬN PROP NÀY
}) => {
  const { isDark } = useContext(ThemeContext);

  return (
    <Modal
      title={editingMaintain ? "Edit Maintenance Voucher" : "Add New Maintenance Voucher"}
      open={open}
      onCancel={onCancel}
      footer={null}
      className={isDark ? "dark" : ""}
      destroyOnHidden={true}
    >
      {/* Chỉ render MaintenanceFormContent khi modal mở */}
      {open && (
        <MaintenanceFormContent
          editingMaintain={editingMaintain}
          onSubmit={onSubmit}
          availableRooms={availableRooms} // TRUYỀN PROP NÀY XUỐNG
        />
      )}
    </Modal>
  );
};

export default MaintenanceFormModal;
