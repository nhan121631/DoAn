/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FilterOutlined,
  PlusOutlined,
  SearchOutlined,
  UploadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  DatePicker,
  Form,
  Image,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Upload,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { ResidentService } from "../../../../services/ResidentService";
import { ContractData, ResidentData } from "../../../../types/types";

interface ResidentsTabProps {
  contract: ContractData;
  onContractUpdate: (contract: ContractData) => void;
  messageApi: any;
}

const relationshipOptions = [
  { value: "Vợ/Chồng", label: "Vợ/Chồng" },
  { value: "Con", label: "Con" },
  { value: "Bố/Mẹ", label: "Bố/Mẹ" },
  { value: "Anh/Em", label: "Anh/Em" },
  { value: "Khác", label: "Khác" },
];

// Helper function to convert Cloudinary relative path to full URL
const getCloudinaryUrl = (relativePath: string): string => {
  if (!relativePath) return "";
  if (relativePath.startsWith("http")) return relativePath;
  return `https://res.cloudinary.com${relativePath}`;
};

export default function ResidentsTab({
  contract,
  onContractUpdate,
  messageApi,
}: ResidentsTabProps) {
  const [residents, setResidents] = useState<ResidentData[]>([]);
  const [selectedResident, setSelectedResident] = useState<ResidentData | null>(
    null
  );
  const [editResident, setEditResident] = useState<ResidentData | null>(null);
  const [addResidentOpen, setAddResidentOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [frontImageFile, setFrontImageFile] = useState<File | null>(null);
  const [backImageFile, setBackImageFile] = useState<File | null>(null);
  const [frontImagePreview, setFrontImagePreview] = useState<string>("");
  const [backImagePreview, setBackImagePreview] = useState<string>("");
  const [searchText, setSearchText] = useState("");
  const [relationshipFilter, setRelationshipFilter] = useState<string | null>(
    null
  );

  // Load residents from API
  useEffect(() => {
    loadResidents();
  }, [contract.id]);

  const loadResidents = async () => {
    try {
      setLoading(true);
      const data = await ResidentService.getByContract(contract.id);
      setResidents(data);
    } catch (error) {
      console.error("Failed to load residents:", error);
      messageApi.error("Lỗi tải danh sách tạm trú!");
    } finally {
      setLoading(false);
    }
  };

  // Handle form reset and image cleanup
  const resetForm = () => {
    addForm.resetFields();
    editForm.resetFields();
    setFrontImageFile(null);
    setBackImageFile(null);
    setFrontImagePreview("");
    setBackImagePreview("");
  };

  // Handle edit resident setup
  useEffect(() => {
    if (editResident) {
      editForm.setFieldsValue({
        fullName: editResident.fullName,
        idNumber: editResident.idNumber,
        relationship: editResident.relationship,
        startDate: dayjs(editResident.startDate),
        endDate: dayjs(editResident.endDate),
        note: editResident.note,
      });

      // Set existing image previews
      if (editResident.idCardFrontUrl) {
        setFrontImagePreview(getCloudinaryUrl(editResident.idCardFrontUrl));
      }
      if (editResident.idCardBackUrl) {
        setBackImagePreview(getCloudinaryUrl(editResident.idCardBackUrl));
      }
    }
  }, [editResident, editForm]);

  // Handle add resident modal opening - reset form
  useEffect(() => {
    if (addResidentOpen && !editResident) {
      resetForm();
    }
  }, [addResidentOpen, editResident]);

  const handleAddResident = async (values: any) => {
    try {
      setLoading(true);

      // Format dates to YYYY-MM-DD format for backend
      const formattedData = {
        ...values,
        startDate: values.startDate.format("YYYY-MM-DD"),
        endDate: values.endDate.format("YYYY-MM-DD"),
        contractId: contract.id,
      };

      await ResidentService.createResident(
        contract.id,
        formattedData,
        frontImageFile || undefined,
        backImageFile || undefined
      );

      messageApi.success("Thêm tạm trú thành công!");
      setAddResidentOpen(false);
      resetForm();
      loadResidents(); // Reload data
    } catch (error) {
      console.error("Lỗi khi thêm tạm trú:", error);
      messageApi.error("Lỗi khi thêm tạm trú!");
    } finally {
      setLoading(false);
    }
  };

  const handleEditResident = async (values: any) => {
    if (!editResident) return;

    try {
      setLoading(true);

      // Format dates to YYYY-MM-DD format for backend
      const formattedData = {
        ...values,
        startDate: values.startDate.format("YYYY-MM-DD"),
        endDate: values.endDate.format("YYYY-MM-DD"),
        contractId: contract.id,
      };

      await ResidentService.updateResident(
        contract.id,
        editResident.id,
        formattedData,
        frontImageFile || undefined,
        backImageFile || undefined
      );

      messageApi.success("Cập nhật tạm trú thành công!");
      setEditResident(null);
      resetForm();
      loadResidents(); // Reload data
    } catch (error) {
      console.error("Lỗi khi cập nhật tạm trú:", error);
      messageApi.error("Lỗi khi cập nhật tạm trú!");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResident = async (residentId: string) => {
    try {
      setLoading(true);
      await ResidentService.deleteResident(contract.id, residentId);
      messageApi.success("Xóa tạm trú thành công!");
      loadResidents(); // Reload data
    } catch (error) {
      console.error("Lỗi khi xóa tạm trú:", error);
      messageApi.error("Lỗi khi xóa tạm trú!");
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload for front image
  const handleFrontImageChange = async (file: File) => {
    setFrontImageFile(file);
    try {
      const preview = await ResidentService.fileToBase64(file);
      setFrontImagePreview(preview);
    } catch (error) {
      messageApi.error("Lỗi khi xử lý ảnh!");
    }
    return false; // Prevent auto upload
  };

  // Handle file upload for back image
  const handleBackImageChange = async (file: File) => {
    setBackImageFile(file);
    try {
      const preview = await ResidentService.fileToBase64(file);
      setBackImagePreview(preview);
    } catch (error) {
      messageApi.error("Lỗi khi xử lý ảnh!");
    }
    return false; // Prevent auto upload
  };

  // Date validation for add form
  const validateEndDateAdd = (_: any, value: any) => {
    const startDate = addForm.getFieldValue("startDate");
    if (value && startDate && value.isBefore(startDate)) {
      return Promise.reject(new Error("Ngày kết thúc phải sau ngày bắt đầu!"));
    }
    return Promise.resolve();
  };

  const validateStartDateAdd = (_: any, value: any) => {
    const endDate = addForm.getFieldValue("endDate");
    if (value && endDate && value.isAfter(endDate)) {
      return Promise.reject(
        new Error("Ngày bắt đầu phải trước ngày kết thúc!")
      );
    }
    return Promise.resolve();
  };

  // Date validation for edit form
  const validateEndDateEdit = (_: any, value: any) => {
    const startDate = editForm.getFieldValue("startDate");
    if (value && startDate && value.isBefore(startDate)) {
      return Promise.reject(new Error("Ngày kết thúc phải sau ngày bắt đầu!"));
    }
    return Promise.resolve();
  };

  const validateStartDateEdit = (_: any, value: any) => {
    const endDate = editForm.getFieldValue("endDate");
    if (value && endDate && value.isAfter(endDate)) {
      return Promise.reject(
        new Error("Ngày bắt đầu phải trước ngày kết thúc!")
      );
    }
    return Promise.resolve();
  };

  // Filter residents based on search and filter criteria
  const filteredResidents = residents.filter((resident) => {
    const matchesSearch =
      !searchText ||
      resident.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
      resident.idNumber?.toLowerCase().includes(searchText.toLowerCase()) ||
      resident.note?.toLowerCase().includes(searchText.toLowerCase());

    const matchesRelationship =
      !relationshipFilter || resident.relationship === relationshipFilter;

    return matchesSearch && matchesRelationship;
  });

  // Clear all filters
  const clearFilters = () => {
    setSearchText("");
    setRelationshipFilter(null);
  };

  const columns = [
    {
      title: "Họ và tên",
      dataIndex: "fullName",
      key: "fullName",
      render: (name: string) => (
        <div className="flex items-center gap-2">
          <UserOutlined className="dark:text-gray-300" />
          <span className="font-medium dark:text-white transition-colors duration-300">
            {name}
          </span>
        </div>
      ),
    },
    {
      title: "Số CMND/CCCD",
      dataIndex: "idNumber",
      key: "idNumber",
    },
    {
      title: "Mối quan hệ",
      dataIndex: "relationship",
      key: "relationship",
      render: (relationship: string) => <Tag color="blue">{relationship}</Tag>,
    },
    {
      title: "Thời gian",
      key: "period",
      render: (_: any, record: ResidentData) => (
        <div>
          <div className="dark:text-white transition-colors duration-300">
            {new Date(record.startDate).toLocaleDateString()}
          </div>
          <div className="text-gray-500 dark:text-gray-400 text-sm transition-colors duration-300">
            to {new Date(record.endDate).toLocaleDateString()}
          </div>
        </div>
      ),
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
      ellipsis: true,
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: ResidentData) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="default"
              icon={<EyeOutlined />}
              onClick={() => setSelectedResident(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              icon={<EditOutlined />}
              onClick={() => setEditResident(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa người cư trú này?"
              onConfirm={() => handleDeleteResident(record.id)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <Button danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title={
        <h3 className="text-lg font-semibold m-0 text-gray-900 dark:text-white transition-colors duration-300">
          Quản lý tạm trú
        </h3>
      }
      className="shadow-sm bg-white dark:bg-[#17223b] border-gray-200 dark:border-gray-600 transition-colors duration-300"
      extra={
        <div className="flex items-center gap-3">
          <Input
            placeholder="Tìm kiếm tạm trú..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 200 }}
            allowClear
          />
          <Select
            placeholder={
              <div className="flex items-center gap-1">
                <FilterOutlined />
                <span>Mối quan hệ</span>
              </div>
            }
            value={relationshipFilter}
            onChange={setRelationshipFilter}
            options={relationshipOptions}
            style={{ width: 150 }}
            allowClear
          />
          {(searchText || relationshipFilter) && (
            <Button onClick={clearFilters} size="small">
              Xóa bộ lọc
            </Button>
          )}
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setAddResidentOpen(true)}
          >
            Thêm tạm trú
          </Button>
        </div>
      }
    >
      <Table
        columns={columns}
        dataSource={filteredResidents}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} residents`,
          pageSizeOptions: ["5", "10", "20", "50"],
        }}
        loading={loading}
        size="middle"
      />

      {/* Resident Detail Modal */}
      <Modal
        title="Chi tiết người cư trú"
        open={!!selectedResident}
        onCancel={() => setSelectedResident(null)}
        footer={null}
        width={800}
      >
        {selectedResident && (
          <div className="space-y-4">
            <Card className="bg-white dark:bg-[#22304a] border-gray-200 dark:border-gray-600 transition-colors duration-300">
              <div className="grid grid-cols-2 gap-4">
                <div className="dark:text-gray-300 transition-colors duration-300">
                  <strong className="dark:text-white">Họ và tên:</strong>{" "}
                  {selectedResident.fullName}
                </div>
                <div className="dark:text-gray-300 transition-colors duration-300">
                  <strong className="dark:text-white">Số CMND/CCCD:</strong>{" "}
                  {selectedResident.idNumber}
                </div>
                <div className="dark:text-gray-300 transition-colors duration-300">
                  <strong className="dark:text-white">Mối quan hệ:</strong>
                  <Tag color="blue" className="ml-2">
                    {selectedResident.relationship}
                  </Tag>
                </div>
                <div className="dark:text-gray-300 transition-colors duration-300">
                  <strong className="dark:text-white">Ngày bắt đầu:</strong>{" "}
                  {new Date(selectedResident.startDate).toLocaleDateString()}
                </div>
                <div className="dark:text-gray-300 transition-colors duration-300">
                  <strong className="dark:text-white">Ngày kết thúc:</strong>{" "}
                  {new Date(selectedResident.endDate).toLocaleDateString()}
                </div>
                <div className="col-span-2 dark:text-gray-300 transition-colors duration-300">
                  <strong className="dark:text-white">Ghi chú:</strong>{" "}
                  {selectedResident.note}
                </div>
              </div>
            </Card>

            {(selectedResident.idCardFrontUrl ||
              selectedResident.idCardBackUrl) && (
              <Card
                title={
                  <span className="dark:text-white transition-colors duration-300">
                    Hình ảnh CMND/CCCD
                  </span>
                }
                className="bg-white dark:bg-[#22304a] border-gray-200 dark:border-gray-600 transition-colors duration-300"
              >
                <div className="flex gap-4">
                  {selectedResident.idCardFrontUrl && (
                    <div>
                      <p className="mb-2 font-medium dark:text-white transition-colors duration-300">
                        Mặt trước
                      </p>
                      <Image
                        src={getCloudinaryUrl(selectedResident.idCardFrontUrl)}
                        alt="Mặt trước CMND/CCCD"
                        width={200}
                        height={120}
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  )}
                  {selectedResident.idCardBackUrl && (
                    <div>
                      <p className="mb-2 font-medium dark:text-white transition-colors duration-300">
                        Mặt sau
                      </p>
                      <Image
                        src={getCloudinaryUrl(selectedResident.idCardBackUrl)}
                        alt="Mặt sau CMND/CCCD"
                        width={200}
                        height={120}
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        )}
      </Modal>

      {/* Add/Edit Resident Modal */}
      <Modal
        key={editResident ? `edit-${editResident.id}` : "add-new"}
        title={
          editResident
            ? "Chỉnh sửa thông tin tạm trú"
            : "Thêm người thông tin tạm trú"
        }
        open={addResidentOpen || !!editResident}
        onCancel={() => {
          setAddResidentOpen(false);
          setEditResident(null);
          resetForm();
        }}
        footer={null}
        destroyOnHidden
      >
        <Form
          form={editResident ? editForm : addForm}
          layout="vertical"
          onFinish={editResident ? handleEditResident : handleAddResident}
        >
          <Form.Item
            label="Họ và tên"
            name="fullName"
            rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
          >
            <Input placeholder="Nhập họ và tên" />
          </Form.Item>

          <Form.Item
            label="Số CMND/CCCD"
            name="idNumber"
            rules={[
              { required: true, message: "Vui lòng nhập số CMND/CCCD!" },
              { len: 12, message: "Số CMND/CCCD phải có 12 chữ số!" },
            ]}
          >
            <Input
              placeholder="Nhập số CMND/CCCD gồm 12 chữ số"
              maxLength={12}
            />
          </Form.Item>

          <Form.Item
            label="Mối quan hệ"
            name="relationship"
            rules={[{ required: true, message: "Vui lòng chọn mối quan hệ!" }]}
          >
            <Select
              placeholder="Chọn mối quan hệ"
              options={relationshipOptions}
            />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label="Ngày bắt đầu"
              name="startDate"
              rules={[
                { required: true, message: "Vui lòng chọn ngày bắt đầu!" },
                {
                  validator: editResident
                    ? validateStartDateEdit
                    : validateStartDateAdd,
                },
              ]}
            >
              <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
            </Form.Item>

            <Form.Item
              label="Ngày kết thúc"
              name="endDate"
              rules={[
                { required: true, message: "Vui lòng chọn ngày kết thúc!" },
                {
                  validator: editResident
                    ? validateEndDateEdit
                    : validateEndDateAdd,
                },
              ]}
            >
              <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
            </Form.Item>
          </div>

          <Form.Item label="Ghi chú" name="note">
            <Input.TextArea placeholder="Nhập ghi chú bổ sung" rows={3} />
          </Form.Item>

          {/* ID Card Images Upload */}
          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Ảnh mặt trước CMND/CCCD">
              <Upload
                beforeUpload={handleFrontImageChange}
                showUploadList={false}
                accept="image/*"
              >
                <Button icon={<UploadOutlined />}>Chọn ảnh mặt trước</Button>
              </Upload>
              {frontImagePreview && (
                <div className="mt-2">
                  <Image
                    src={frontImagePreview}
                    alt="Ảnh mặt trước"
                    width={100}
                    height={60}
                    style={{ objectFit: "cover" }}
                  />
                </div>
              )}
            </Form.Item>

            <Form.Item label="Ảnh mặt sau CMND/CCCD">
              <Upload
                beforeUpload={handleBackImageChange}
                showUploadList={false}
                accept="image/*"
              >
                <Button icon={<UploadOutlined />}>Chọn ảnh mặt sau</Button>
              </Upload>
              {backImagePreview && (
                <div className="mt-2">
                  <Image
                    src={backImagePreview}
                    alt="Ảnh mặt sau"
                    width={100}
                    height={60}
                    style={{ objectFit: "cover" }}
                  />
                </div>
              )}
            </Form.Item>
          </div>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button
                onClick={() => {
                  setAddResidentOpen(false);
                  setEditResident(null);
                  resetForm();
                }}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editResident ? "Cập nhật" : "Thêm"} Người cư trú
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
