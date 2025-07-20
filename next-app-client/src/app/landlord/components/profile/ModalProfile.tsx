/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from "react";
import { Modal, Form, Input, Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import Image from "next/image";
import { FaUser, FaMapMarkerAlt } from "react-icons/fa";
import { IoIosPhonePortrait } from "react-icons/io";
import { MdOutlineMail } from "react-icons/md";
import type { UploadChangeParam } from "antd/es/upload";
import type { UploadFile } from "antd/es/upload/interface";
import type { FormInstance } from "antd/es/form";

interface ModalProfileProps {
  open: boolean;
  onCancel: () => void;
  onSave: (values: {
    name: string;
    phone: string;
    email: string;
    address: string;
  }) => void;
  avatarUrl: string;
  onAvatarChange: (info: UploadChangeParam<UploadFile<any>>) => void;
  form: FormInstance;
}

export default function ModalProfile({
  open,
  onCancel,
  onSave,
  avatarUrl,
  onAvatarChange,
  form,
}: ModalProfileProps) {
  return (
    <Modal
      title={
        <span className="font-bold text-lg">Edit Personal Information</span>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      centered
      width={480}
      styles={{ body: { paddingTop: 24, paddingBottom: 8 } }}
    >
      <div className="flex flex-col items-center mb-4">
        <Image
          src={avatarUrl}
          alt="Avatar"
          width={100}
          height={100}
          className="rounded-full border-2 border-blue-500 mb-2"
        />
      </div>
      <Form form={form} layout="vertical" onFinish={onSave}>
        <Form.Item
          name="avatar"
          label="Avatar"
          valuePropName="fileList"
          getValueFromEvent={(e) => (Array.isArray(e) ? e : e && e.fileList)}
        >
          <Upload
            showUploadList={false}
            beforeUpload={() => false}
            maxCount={1}
            accept="image/*"
          >
            <Button icon={<UploadOutlined />}>Upload Image</Button>
          </Upload>
        </Form.Item>
        <Form.Item
          name="name"
          label="Full Name"
          rules={[{ required: true, message: "Please enter your name" }]}
        >
          <Input prefix={<FaUser />} placeholder="Full Name" />
        </Form.Item>
        <Form.Item
          name="phone"
          label="Phone Number"
          rules={[
            { required: true, message: "Please enter your phone number" },
          ]}
        >
          <Input prefix={<IoIosPhonePortrait />} placeholder="Phone Number" />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email"
          rules={[
            {
              required: true,
              type: "email",
              message: "Please enter a valid email",
            },
          ]}
        >
          <Input prefix={<MdOutlineMail />} placeholder="Email" />
        </Form.Item>
        <Form.Item
          name="address"
          label="Address"
          rules={[{ required: true, message: "Please enter your address" }]}
        >
          <Input prefix={<FaMapMarkerAlt />} placeholder="Address" />
        </Form.Item>

        <Form.Item
          name="bank"
          label="Bank"
          rules={[{ required: true, message: "Please select your bank" }]}
        >
          <select className="ant-input w-full rounded border px-3 py-2">
            <option value="">Select Bank</option>
            <option value="Vietcombank">Vietcombank</option>
            <option value="VietinBank">VietinBank</option>
            <option value="BIDV">BIDV</option>
            <option value="MB Bank">MB Bank</option>
            <option value="Techcombank">Techcombank</option>
            <option value="ACB">ACB</option>
            <option value="Sacombank">Sacombank</option>
            <option value="Agribank">Agribank</option>
            <option value="TPBank">TPBank</option>
            <option value="VPBank">VPBank</option>
          </select>
        </Form.Item>
        <Form.Item
          name="accountNumber"
          label="Account Number"
          rules={[
            { required: true, message: "Please enter your account number" },
          ]}
        >
          <Input placeholder="Account Number" />
        </Form.Item>
        <Form.Item
          name="accountHolder"
          label="Account Holder Name"
          rules={[
            {
              required: true,
              message: "Please enter the account holder's name",
            },
          ]}
        >
          <Input placeholder="Account Holder Name" />
        </Form.Item>
        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit">
            Save
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
