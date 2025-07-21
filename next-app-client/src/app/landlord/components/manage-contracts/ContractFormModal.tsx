"use client";

import React, { useEffect, useCallback, useState } from "react";
import { Modal, Button, Input, Select, Form, DatePicker, Row, Col } from "antd";
import { ContractData, ContractFormValues, Room } from "@/types/types";
import dayjs from 'dayjs'; 

const { Option } = Select;

interface ContractFormModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: ContractFormValues) => void;
  editingContract: ContractData | null;
  availableRooms: Room[];
}

const ContractFormContent: React.FC<{
  editingContract: ContractData | null;
  onSubmit: (values: ContractFormValues) => void;
  availableRooms: Room[];
  onCancel: () => void;
}> = ({ editingContract, onSubmit, availableRooms, onCancel }) => {
  const [form] = Form.useForm();
  const [selectedFileName, setSelectedFileName] = useState<string | undefined>(undefined); // State for selected file name

  useEffect(() => {
    if (editingContract) {
      form.setFieldsValue({
        ...editingContract,
        startDate: dayjs(editingContract.startDate, 'MM/DD/YYYY'), 
        status: editingContract.status,
      });
      setSelectedFileName(editingContract.contractImageUrl ? editingContract.contractImageUrl.split('/').pop() : undefined);
    } else {
      form.resetFields();
      setSelectedFileName(undefined); 
    }
  }, [editingContract, form]);

  const handleRoomNameChange = useCallback((value: string) => {
    const selectedRoom = availableRooms.find(room => room.name === value);
    if (selectedRoom) {
      form.setFieldsValue({ address: selectedRoom.address });
    } else {
      form.setFieldsValue({ address: "" });
    }
  }, [form, availableRooms]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name); 
      form.setFieldsValue({ contractImageFile: file }); 
    } else {
      setSelectedFileName(undefined); 
      form.setFieldsValue({ contractImageFile: undefined });
    }
  };

  const handleFinish = (values: ContractFormValues) => {
    let formattedStartDate: string = '';
    if (values.startDate) {
      if (dayjs.isDayjs(values.startDate)) {
        formattedStartDate = values.startDate.format('MM/DD/YYYY');
      } 
      else if (typeof values.startDate === 'string') {
        formattedStartDate = dayjs(values.startDate, 'MM/DD/YYYY').format('MM/DD/YYYY');
      }
    }

    const formattedValues: ContractFormValues = {
      ...values,
      startDate: formattedStartDate, 
      price: Number(values.price),
      durationMonths: Number(values.durationMonths),
      numberOfPeople: Number(values.numberOfPeople),
      status: values.status !== undefined ? Number(values.status) as (0 | 1) : undefined,
    };
    onSubmit(formattedValues);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
    >
      <div className="max-h-[450px] overflow-y-auto pr-4">
        <Form.Item
          label="Contract Name"
          name="contractName"
          rules={[{ required: true, message: "Please enter contract name!" }]}
        >
          <Input placeholder="e.g., Contract No. 001" />
        </Form.Item>
        <Form.Item
          label="Room Name"
          name="roomName"
          rules={[{ required: true, message: "Please select a room!" }]}
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

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Tenant Name"
              name="tenantName"
              rules={[{ required: true, message: "Please enter tenant name!" }]}
            >
              <Input placeholder="e.g., John Doe" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Phone Number"
              name="phoneNumber"
              rules={[{ required: true, message: "Please enter phone number!" }]}
            >
              <Input placeholder="e.g., 0912345678" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Number of People"
              name="numberOfPeople"
              rules={[{ required: true, message: "Please enter number of people!" }, { pattern: /^\d+$/, message: 'Please enter a valid number!' }]}
            >
              <Input type="number" placeholder="e.g., 2" min={1} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Price (VND)"
              name="price"
              rules={[{ required: true, message: "Please enter price!" }, { pattern: /^\d+$/, message: 'Please enter a valid number!' }]}
            >
              <Input type="number" placeholder="e.g., 3000000" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Duration (Months)"
              name="durationMonths"
              rules={[{ required: true, message: "Please enter duration!" }, { pattern: /^\d+$/, message: 'Please enter a valid number!' }]}
            >
              <Input type="number" placeholder="e.g., 6" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Start Date"
              name="startDate"
              rules={[{ required: true, message: "Please select start date!" }]}
            >
              <DatePicker format="MM/DD/YYYY" className="w-full" />
          </Form.Item>
        </Col>
      </Row>

      {editingContract && (
        <Form.Item
          label="Status"
          name="status"
          rules={[{ required: true, message: "Please select a status!" }]}
        >
          <Select placeholder="Select status">
            <Option value={0}>Rented</Option>
            <Option value={1}>Checked Out</Option>
          </Select>
        </Form.Item>
      )}

      {/* Contract File Upload */}
      <Form.Item label="Contract File (Image)">
        <Input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
        {selectedFileName && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Selected file: <span className="font-semibold">{selectedFileName}</span>
          </p>
        )}
      </Form.Item>
    </div>

      <Form.Item>
        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit">
            {editingContract ? "Update Contract" : "Add Contract"}
          </Button>
        </div>
      </Form.Item>
    </Form>
  );
};

const ContractFormModal: React.FC<ContractFormModalProps> = ({
  open,
  onCancel,
  onSubmit,
  editingContract,
  availableRooms,
}) => {

  return (
    <Modal
      title={editingContract ? "Edit Contract" : "Add New Contract"}
      open={open}
      onCancel={onCancel}
      footer={null}
      destroyOnHidden={true}
      width={600}
    >
      {open && (
        <ContractFormContent
          editingContract={editingContract}
          onSubmit={onSubmit}
          availableRooms={availableRooms}
          onCancel={onCancel}
        />
      )}
    </Modal>
  );
};

export default ContractFormModal;
