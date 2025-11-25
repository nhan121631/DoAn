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
import {
  EditOutlined,
  CloudUploadOutlined,
  FileOutlined,
} from "@ant-design/icons";
import { ContractData } from "@/types/types";
import { ContractService } from "@/services/ContractService";
import {
  formatCloudinaryUrl,
  formatCloudinaryThumbnail,
  resolveCloudinaryUrl,
} from "@/utils/cloudinaryUtils";
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
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const [isPdfResolved, setIsPdfResolved] = useState<boolean>(false);
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);

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

  // Resolve cloudinary URL (raw vs image) so links/thumbnails work when backend stores raw PDF paths
  useEffect(() => {
    let mounted = true;
    const doResolve = async () => {
      if (!contract.contractImage) {
        if (mounted) {
          setResolvedUrl(null);
          setIsPdfResolved(false);
        }
        return;
      }
      try {
        const url = await resolveCloudinaryUrl(contract.contractImage);
        if (!mounted) return;
        setResolvedUrl(url);
        setIsPdfResolved(!!url && /\.pdf($|\?)/i.test(url));
      } catch (e) {
        if (!mounted) return;
        // fallback to formatted URL
        const url = formatCloudinaryUrl(contract.contractImage);
        setResolvedUrl(url);
        setIsPdfResolved(!!url && /\.pdf($|\?)/i.test(url));
      }
    };
    void doResolve();
    return () => {
      mounted = false;
    };
  }, [contract.contractImage]);

  // Use resolvedUrl/isPdfResolved in UI
  const fileUrl =
    resolvedUrl ||
    (contract.contractImage
      ? formatCloudinaryUrl(contract.contractImage)
      : null);
  // Also check the original stored path/public id for .pdf since backend may store raw paths
  const rawPath = contract.contractImage || "";
  const isPdf =
    isPdfResolved ||
    (!!fileUrl && /\.pdf($|\?)/i.test(fileUrl)) ||
    /\.pdf($|\?)/i.test(rawPath);
  const isRaw =
    rawPath.includes("/raw/upload/") ||
    (!!resolvedUrl && resolvedUrl?.includes("/raw/upload/"));
  const isDocument = isPdf || isRaw;
  const thumbnailUrl = formatCloudinaryThumbnail(
    resolvedUrl || contract.contractImage,
    150,
    100
  );

  const handleImageUpload = async (file: File) => {
    try {
      // Validate file type - accept PDF, DOC, DOCX
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (!allowedTypes.includes(file.type)) {
        messageApi.error("Only PDF, DOC, and DOCX files are allowed!");
        return false;
      }

      // Validate file size (optional - max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        messageApi.error("File size must be less than 10MB!");
        return false;
      }

      setUploadLoading(true);
      const updatedContract = await ContractService.uploadContractImage(
        contract.id,
        file
      );

      if (onContractUpdate) {
        onContractUpdate(updatedContract);
      }

      messageApi.success("Contract file uploaded successfully!");
    } catch (error) {
      console.error("Upload file error:", error);
      messageApi.error("Failed to upload contract file!");
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
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          showUploadList={false}
          beforeUpload={handleImageUpload}
          disabled={uploadLoading}
        >
          <Button
            type="primary"
            icon={<CloudUploadOutlined />}
            loading={uploadLoading}
            disabled={contract.status !== 0} // Only allow uploading if contract status is Active
          >
            Upload Contract File (PDF, DOC, DOCX)
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
        <Descriptions.Item label="Contract File" span={2}>
          {contract.contractImage ? (
            <div className="flex flex-col gap-3">
              {/* File info - click to open in Google Docs Viewer */}
              <div className="flex items-center gap-3">
                <a
                  href={`https://docs.google.com/viewer?url=${encodeURIComponent(
                    fileUrl || ""
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-[60px] h-[60px] flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  title="Click to view file"
                >
                  <FileOutlined
                    style={{ fontSize: "32px", color: "#2563eb" }}
                  />
                </a>

                <div className="flex-1">
                  <a
                    href={`https://docs.google.com/viewer?url=${encodeURIComponent(
                      fileUrl || ""
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                  >
                    {(() => {
                      if (!fileUrl) return "contract-file";
                      try {
                        const urlPath = new URL(fileUrl).pathname;
                        let filename = decodeURIComponent(
                          urlPath.split("/").pop() || "contract-file"
                        );
                        return filename;
                      } catch {
                        return "contract-file";
                      }
                    })()}
                  </a>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Click to view file in new tab
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <span className="text-gray-500">No file uploaded</span>
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
              <DatePicker
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                disabled
              />
            </Form.Item>

            <Form.Item
              label="End Date"
              name="endDate"
              rules={[{ required: true, message: "Please select end date!" }]}
            >
              <DatePicker
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                disabled
              />
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

      {/* PDF Preview Modal */}
      <Modal
        title="PDF Preview"
        open={pdfPreviewOpen}
        onCancel={() => setPdfPreviewOpen(false)}
        footer={null}
        width={900}
      >
        {fileUrl ? (
          <iframe
            src={fileUrl}
            title="PDF Preview"
            style={{ width: "100%", height: "80vh", border: "none" }}
          />
        ) : (
          <div className="p-4">No preview available</div>
        )}
      </Modal>
    </div>
  );
}
