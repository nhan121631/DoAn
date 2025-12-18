/* eslint-disable @typescript-eslint/no-explicit-any */

import { ContractService } from "@/services/ContractService";
import { ContractData } from "@/types/types";
import {
  formatCloudinaryThumbnail,
  formatCloudinaryUrl,
  resolveCloudinaryUrl,
} from "@/utils/cloudinaryUtils";
import { CloudUploadOutlined, FileOutlined } from "@ant-design/icons";
import {
  Button,
  DatePicker,
  Descriptions,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Tag,
  Upload,
} from "antd";
import dayjs from "dayjs";
import { useCallback, useEffect, useState } from "react";

interface ContractOverviewProps {
  contract: ContractData;
  onContractUpdate?: (contract: ContractData) => void;
  autoEdit?: boolean;
  messageApi: any;
}

const statusMap: Record<number, { text: string; color: string }> = {
  0: { text: "Hoạt động", color: "green" },
  1: { text: "Đã chấm dứt", color: "red" },
  2: { text: "Hết hạn", color: "orange" },
  3: { text: "Đang chờ", color: "blue" },
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
        messageApi.error("Chỉ cho phép các tệp PDF, DOC và DOCX!");
        return false;
      }

      // Validate file size (optional - max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        messageApi.error("Kích thước tệp phải nhỏ hơn 10MB!");
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

      messageApi.success("Tệp hợp đồng đã được tải lên thành công!");
    } catch (error) {
      console.error("Upload file error:", error);
      messageApi.error("Không thể tải lên tệp hợp đồng!");
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

      messageApi.success("Cập nhật hợp đồng thành công!");
      setEditModalOpen(false);
    } catch (error) {
      console.error("Update contract error:", error);
      messageApi.error("Không thể cập nhật hợp đồng!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-transparent transition-colors duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Thông tin hợp đồng
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
            Tải lên tệp hợp đồng (PDF, DOC, DOCX)
          </Button>
        </Upload>
      </div>

      <Descriptions bordered column={2} size="middle">
        <Descriptions.Item label="Tên hợp đồng">
          {contract.contractName}
        </Descriptions.Item>
        <Descriptions.Item label="Phòng">
          {contract.roomTitle}
        </Descriptions.Item>
        <Descriptions.Item label="Người thuê">
          {contract.tenantName}
        </Descriptions.Item>
        <Descriptions.Item label="Số điện thoại">
          {contract.tenantPhone}
        </Descriptions.Item>
        <Descriptions.Item label="Chủ nhà">
          {contract.landlordName}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày bắt đầu">
          {new Date(contract.startDate).toLocaleDateString()}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày kết thúc">
          {new Date(contract.endDate).toLocaleDateString()}
        </Descriptions.Item>
        <Descriptions.Item label="Tiền đặt cọc">
          {contract.depositAmount?.toLocaleString()} đ
        </Descriptions.Item>
        <Descriptions.Item label="Tiền thuê hàng tháng">
          {contract.monthlyRent?.toLocaleString()} đ / tháng
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          <Tag color={statusMap[contract.status]?.color}>
            {statusMap[contract.status]?.text}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Tệp hợp đồng" span={2}>
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
                        const filename = decodeURIComponent(
                          urlPath.split("/").pop() || "contract-file"
                        );
                        return filename;
                      } catch {
                        return "contract-file";
                      }
                    })()}
                  </a>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Nhấp để xem tệp trong tab mới
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <span className="text-gray-500">Chưa tải tệp lên</span>
          )}
        </Descriptions.Item>
      </Descriptions>

      {/* Edit Contract Modal */}
      <Modal
        title="Chỉnh sửa hợp đồng"
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
              <strong>Note:</strong> Chỉ các trường Ngày bắt đầu, Ngày kết thúc,
              Tiền đặt cọc, Tiền thuê hàng tháng và Trạng thái có thể được chỉnh
              sửa. Các trường khác là chỉ đọc.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Tên hợp đồng" name="contractName">
              <Input placeholder="Nhập tên hợp đồng" disabled />
            </Form.Item>

            <Form.Item
              label="Trạng thái"
              name="status"
              rules={[{ required: true, message: "Hãy chọn trạng thái!" }]}
            >
              <Select placeholder="Select status" disabled>
                <Select.Option value={0}>Đang hoạt động</Select.Option>
                <Select.Option value={1}>Chấm dứt</Select.Option>
                <Select.Option value={2}>Hết hạn</Select.Option>
                <Select.Option value={3}>Đang chờ xử lý</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label="Tên người thuê" name="tenantName">
              <Input placeholder="Nhập tên người thuê" disabled />
            </Form.Item>

            <Form.Item label="Số điện thoại" name="tenantPhone">
              <Input placeholder="Nhập số điện thoại" maxLength={11} disabled />
            </Form.Item>

            <Form.Item
              label="Ngày bắt đầu"
              name="startDate"
              rules={[
                { required: true, message: "Vui lòng chọn ngày bắt đầu!" },
              ]}
            >
              <DatePicker
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                disabled
              />
            </Form.Item>

            <Form.Item
              label="Ngày kết thúc"
              name="endDate"
              rules={[
                { required: true, message: "Vui lòng chọn ngày kết thúc!" },
              ]}
            >
              <DatePicker
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                disabled
              />
            </Form.Item>

            <Form.Item
              label="Tiền đặt cọc"
              name="depositAmount"
              rules={[
                { required: true, message: "Vui lòng nhập tiền đặt cọc!" },
                {
                  type: "number",
                  min: 0,
                  message: "Tiền đặt cọc phải là số dương!",
                },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="Nhập tiền đặt cọc"
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
                addonAfter="đ"
                disabled
              />
            </Form.Item>

            <Form.Item
              label="Tiền thuê hàng tháng"
              name="monthlyRent"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập tiền thuê hàng tháng!",
                },
                {
                  type: "number",
                  min: 0,
                  message: "Tiền thuê phải là số dương!",
                },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="Nhập tiền thuê hàng tháng"
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
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Cập nhật hợp đồng
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* PDF Preview Modal */}
      <Modal
        title="Xem trước PDF"
        open={pdfPreviewOpen}
        onCancel={() => setPdfPreviewOpen(false)}
        footer={null}
        width={900}
      >
        {fileUrl ? (
          <iframe
            src={fileUrl}
            title="Xem trước PDF"
            style={{ width: "100%", height: "80vh", border: "none" }}
          />
        ) : (
          <div className="p-4">Không có bản xem trước</div>
        )}
      </Modal>
    </div>
  );
}
