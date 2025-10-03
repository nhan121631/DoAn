/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect, useCallback } from "react";
import {
  Descriptions,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  InputNumber,
  Select,
  message,
  Space,
  Upload,
  Image,
} from "antd";
import { EditOutlined, CloudUploadOutlined } from "@ant-design/icons";
import { ContractData } from "@/types/types";
import { ContractService } from "@/services/ContractService";
import { formatCloudinaryUrl, formatCloudinaryThumbnail } from "@/utils/cloudinaryUtils";
import dayjs from "dayjs";

interface ContractOverviewProps {
  contract: ContractData;
  onContractUpdate?: (contract: ContractData) => void;
  autoEdit?: boolean;
  messageApi: any;
}

const statusMap: Record<number, { text: string; color: string }> = {
  0: { text: "Active", color: "green" },
  1: { text: "Terminated", color: "red" },
  2: { text: "Expired", color: "orange" },
  3: { text: "Pending", color: "blue" },
};

export default function ContractOverview({
  contract,
  onContractUpdate,
  autoEdit,
  messageApi,
}: ContractOverviewProps) {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [form] = Form.useForm();

  const handleEdit = useCallback(() => {
    form.setFieldsValue({
      contractName: contract.contractName,
      tenantName: contract.tenantName,
      tenantPhone: contract.tenantPhone,
      startDate: dayjs(contract.startDate),
      endDate: dayjs(contract.endDate),
      depositAmount: contract.depositAmount,
      monthlyRent: contract.monthlyRent,
      status: contract.status,
    });
    setEditModalOpen(true);
  }, [form, contract]);

  useEffect(() => {
    if (autoEdit) {
      handleEdit();
    }
  }, [autoEdit, handleEdit]);

  const handleImageUpload = async (file: File) => {
    try {
      setUploadLoading(true);
      const updatedContract = await ContractService.uploadContractImage(
        contract.id,
        file
      );
      
      if (onContractUpdate) {
        onContractUpdate(updatedContract);
      }
      
      messageApi.success("Contract image uploaded successfully!");
    } catch (error) {
      console.error("Upload image error:", error);
      messageApi.error("Failed to upload contract image!");
    } finally {
      setUploadLoading(false);
    }
    return false; // Prevent default upload
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      // Prepare update data - only send editable fields
      const updateData = {
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
        depositAmount: values.depositAmount,
        monthlyRent: values.monthlyRent,
        status: values.status,
      };
      console.log("Updating contract with data:", updateData);
      // Call API to update contract
      const updatedContract = await ContractService.updateContract(
        contract.id,
        updateData
      );

      // Call parent update function with the response from API
      if (onContractUpdate) {
        onContractUpdate(updatedContract);
      }

      messageApi.success("Contract updated successfully!");
      setEditModalOpen(false);
    } catch (error) {
      console.error("Update contract error:", error);
      messageApi.error("Failed to update contract!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-transparent transition-colors duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Contract Information
        </h3>
        <Upload
          accept="image/*"
          showUploadList={false}
          beforeUpload={handleImageUpload}
          disabled={uploadLoading}
        >
          <Button 
            type="primary" 
            icon={<CloudUploadOutlined />} 
            loading={uploadLoading}
          >
            Upload Contract Image
          </Button>
        </Upload>
      </div>

      <Descriptions bordered column={2} size="middle">
        <Descriptions.Item label="Contract Name">
          {contract.contractName}
        </Descriptions.Item>
        <Descriptions.Item label="Room">{contract.roomTitle}</Descriptions.Item>
        <Descriptions.Item label="Tenant">
          {contract.tenantName}
        </Descriptions.Item>
        <Descriptions.Item label="Phone">
          {contract.tenantPhone}
        </Descriptions.Item>
        <Descriptions.Item label="Landlord">
          {contract.landlordName}
        </Descriptions.Item>
        <Descriptions.Item label="Start Date">
          {new Date(contract.startDate).toLocaleDateString()}
        </Descriptions.Item>
        <Descriptions.Item label="End Date">
          {new Date(contract.endDate).toLocaleDateString()}
        </Descriptions.Item>
        <Descriptions.Item label="Deposit">
          {contract.depositAmount?.toLocaleString()} đ
        </Descriptions.Item>
        <Descriptions.Item label="Rent">
          {contract.monthlyRent?.toLocaleString()} đ / month
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          <Tag color={statusMap[contract.status]?.color}>
            {statusMap[contract.status]?.text}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Contract Image" span={2}>
          {contract.contractImage ? (
            <div className="flex items-center gap-2">
              <Image
                src={formatCloudinaryThumbnail(contract.contractImage, 150, 100) || undefined}
                alt="Contract Image"
                width={150}
                height={100}
                style={{ objectFit: 'cover', borderRadius: '4px' }}
                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dm3jaMgAAAABwSURBVHhe7cHBDQAACAwCoNGPAnOwQBE8tATFHIAAAABwSURBVHhe7cHBDQAACAwCoNGPAnOwQBE8tATFHIAAAABwSURBVHhe7cHBDQAACAwCoNGPAnOwQBE8tATFHI="
              />
              <a 
                href={formatCloudinaryUrl(contract.contractImage) || '#'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700"
              >
                View Full Image
              </a>
            </div>
          ) : (
            <span className="text-gray-500">No image uploaded</span>
          )}
        </Descriptions.Item>
      </Descriptions>

      {/* Edit Contract Modal */}
      <Modal
        title="Edit Contract"
        open={editModalOpen}
        onCancel={() => {
          setEditModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        destroyOnHidden
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <div className="mb-4 p-3 bg-blue-50 dark:bg-[#22304a] border-l-4 border-blue-400 dark:border-blue-300 rounded transition-colors duration-300">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Note:</strong> Only Status, Start Date, End Date, Deposit
              Amount, and Monthly Rent can be edited. Other fields are read-only
              for data integrity.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Contract Name" name="contractName">
              <Input placeholder="Enter contract name" disabled />
            </Form.Item>

            <Form.Item
              label="Status"
              name="status"
              rules={[{ required: true, message: "Please select status!" }]}
            >
              <Select placeholder="Select status" disabled>
                <Select.Option value={0}>Active</Select.Option>
                <Select.Option value={1}>Terminated</Select.Option>
                <Select.Option value={2}>Expired</Select.Option>
                <Select.Option value={3}>Pending</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label="Tenant Name" name="tenantName">
              <Input placeholder="Enter tenant name" disabled />
            </Form.Item>

            <Form.Item label="Phone" name="tenantPhone">
              <Input placeholder="Enter phone number" maxLength={11} disabled />
            </Form.Item>

            <Form.Item
              label="Start Date"
              name="startDate"
              rules={[{ required: true, message: "Please select start date!" }]}
            >
              <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" disabled />
            </Form.Item>

            <Form.Item
              label="End Date"
              name="endDate"
              rules={[{ required: true, message: "Please select end date!" }]}
            >
              <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" disabled />
            </Form.Item>

            <Form.Item
              label="Deposit Amount"
              name="depositAmount"
              rules={[
                { required: true, message: "Please enter deposit amount!" },
                {
                  type: "number",
                  min: 0,
                  message: "Deposit must be positive!",
                },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="Enter deposit amount"
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
                addonAfter="đ"
                disabled
              />
            </Form.Item>

            <Form.Item
              label="Monthly Rent"
              name="monthlyRent"
              rules={[
                { required: true, message: "Please enter monthly rent!" },
                { type: "number", min: 0, message: "Rent must be positive!" },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="Enter monthly rent"
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
                addonAfter="đ"
                disabled
              />
            </Form.Item>
          </div>

          <Form.Item className="mb-0 text-right mt-6">
            <Space>
              <Button
                onClick={() => {
                  setEditModalOpen(false);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Update Contract
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
