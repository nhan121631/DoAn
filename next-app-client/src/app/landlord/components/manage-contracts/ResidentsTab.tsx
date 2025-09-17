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
      messageApi.error("Failed to load residents!");
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

      messageApi.success("Resident added successfully!");
      setAddResidentOpen(false);
      resetForm();
      loadResidents(); // Reload data
    } catch (error) {
      console.error("Failed to add resident:", error);
      messageApi.error("Failed to add resident!");
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

      messageApi.success("Resident updated successfully!");
      setEditResident(null);
      resetForm();
      loadResidents(); // Reload data
    } catch (error) {
      console.error("Failed to update resident:", error);
      messageApi.error("Failed to update resident!");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResident = async (residentId: string) => {
    try {
      setLoading(true);
      await ResidentService.deleteResident(contract.id, residentId);
      messageApi.success("Resident deleted successfully!");
      loadResidents(); // Reload data
    } catch (error) {
      console.error("Failed to delete resident:", error);
      messageApi.error("Failed to delete resident!");
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
      messageApi.error("Failed to process image!");
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
      messageApi.error("Failed to process image!");
    }
    return false; // Prevent auto upload
  };

  // Date validation for add form
  const validateEndDateAdd = (_: any, value: any) => {
    const startDate = addForm.getFieldValue("startDate");
    if (value && startDate && value.isBefore(startDate)) {
      return Promise.reject(new Error("End date must be after start date!"));
    }
    return Promise.resolve();
  };

  const validateStartDateAdd = (_: any, value: any) => {
    const endDate = addForm.getFieldValue("endDate");
    if (value && endDate && value.isAfter(endDate)) {
      return Promise.reject(new Error("Start date must be before end date!"));
    }
    return Promise.resolve();
  };

  // Date validation for edit form
  const validateEndDateEdit = (_: any, value: any) => {
    const startDate = editForm.getFieldValue("startDate");
    if (value && startDate && value.isBefore(startDate)) {
      return Promise.reject(new Error("End date must be after start date!"));
    }
    return Promise.resolve();
  };

  const validateStartDateEdit = (_: any, value: any) => {
    const endDate = editForm.getFieldValue("endDate");
    if (value && endDate && value.isAfter(endDate)) {
      return Promise.reject(new Error("Start date must be before end date!"));
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
      title: "Full Name",
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
      title: "ID Number",
      dataIndex: "idNumber",
      key: "idNumber",
    },
    {
      title: "Relationship",
      dataIndex: "relationship",
      key: "relationship",
      render: (relationship: string) => <Tag color="blue">{relationship}</Tag>,
    },
    {
      title: "Period",
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
      title: "Note",
      dataIndex: "note",
      key: "note",
      ellipsis: true,
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: ResidentData) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="default"
              icon={<EyeOutlined />}
              onClick={() => setSelectedResident(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              icon={<EditOutlined />}
              onClick={() => setEditResident(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Are you sure you want to delete this resident?"
              onConfirm={() => handleDeleteResident(record.id)}
              okText="Delete"
              cancelText="Cancel"
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
          Residents Management
        </h3>
      }
      className="shadow-sm bg-white dark:bg-[#17223b] border-gray-200 dark:border-gray-600 transition-colors duration-300"
      extra={
        <div className="flex items-center gap-3">
          <Input
            placeholder="Search residents..."
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
                <span>Relationship</span>
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
              Clear filters
            </Button>
          )}
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setAddResidentOpen(true)}
          >
            Add Resident
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
        title="Resident Details"
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
                  <strong className="dark:text-white">Full Name:</strong>{" "}
                  {selectedResident.fullName}
                </div>
                <div className="dark:text-gray-300 transition-colors duration-300">
                  <strong className="dark:text-white">ID Number:</strong>{" "}
                  {selectedResident.idNumber}
                </div>
                <div className="dark:text-gray-300 transition-colors duration-300">
                  <strong className="dark:text-white">Relationship:</strong>
                  <Tag color="blue" className="ml-2">
                    {selectedResident.relationship}
                  </Tag>
                </div>
                <div className="dark:text-gray-300 transition-colors duration-300">
                  <strong className="dark:text-white">Start Date:</strong>{" "}
                  {new Date(selectedResident.startDate).toLocaleDateString()}
                </div>
                <div className="dark:text-gray-300 transition-colors duration-300">
                  <strong className="dark:text-white">End Date:</strong>{" "}
                  {new Date(selectedResident.endDate).toLocaleDateString()}
                </div>
                <div className="col-span-2 dark:text-gray-300 transition-colors duration-300">
                  <strong className="dark:text-white">Note:</strong>{" "}
                  {selectedResident.note}
                </div>
              </div>
            </Card>

            {(selectedResident.idCardFrontUrl ||
              selectedResident.idCardBackUrl) && (
              <Card
                title={
                  <span className="dark:text-white transition-colors duration-300">
                    ID Card Images
                  </span>
                }
                className="bg-white dark:bg-[#22304a] border-gray-200 dark:border-gray-600 transition-colors duration-300"
              >
                <div className="flex gap-4">
                  {selectedResident.idCardFrontUrl && (
                    <div>
                      <p className="mb-2 font-medium dark:text-white transition-colors duration-300">
                        Front
                      </p>
                      <Image
                        src={getCloudinaryUrl(selectedResident.idCardFrontUrl)}
                        alt="ID Card Front"
                        width={200}
                        height={120}
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  )}
                  {selectedResident.idCardBackUrl && (
                    <div>
                      <p className="mb-2 font-medium dark:text-white transition-colors duration-300">
                        Back
                      </p>
                      <Image
                        src={getCloudinaryUrl(selectedResident.idCardBackUrl)}
                        alt="ID Card Back"
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
        title={editResident ? "Edit Resident" : "Add Resident"}
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
            label="Full Name"
            name="fullName"
            rules={[{ required: true, message: "Please enter full name!" }]}
          >
            <Input placeholder="Enter full name" />
          </Form.Item>

          <Form.Item
            label="ID Number"
            name="idNumber"
            rules={[
              { required: true, message: "Please enter ID number!" },
              { len: 12, message: "ID number must be 12 digits!" },
            ]}
          >
            <Input placeholder="Enter 12-digit ID number" maxLength={12} />
          </Form.Item>

          <Form.Item
            label="Relationship"
            name="relationship"
            rules={[{ required: true, message: "Please select relationship!" }]}
          >
            <Select
              placeholder="Select relationship"
              options={relationshipOptions}
            />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label="Start Date"
              name="startDate"
              rules={[
                { required: true, message: "Please select start date!" },
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
              label="End Date"
              name="endDate"
              rules={[
                { required: true, message: "Please select end date!" },
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

          <Form.Item label="Note" name="note">
            <Input.TextArea placeholder="Enter additional notes" rows={3} />
          </Form.Item>

          {/* ID Card Images Upload */}
          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="ID Card Front Image">
              <Upload
                beforeUpload={handleFrontImageChange}
                showUploadList={false}
                accept="image/*"
              >
                <Button icon={<UploadOutlined />}>Select Front Image</Button>
              </Upload>
              {frontImagePreview && (
                <div className="mt-2">
                  <Image
                    src={frontImagePreview}
                    alt="Front Preview"
                    width={100}
                    height={60}
                    style={{ objectFit: "cover" }}
                  />
                </div>
              )}
            </Form.Item>

            <Form.Item label="ID Card Back Image">
              <Upload
                beforeUpload={handleBackImageChange}
                showUploadList={false}
                accept="image/*"
              >
                <Button icon={<UploadOutlined />}>Select Back Image</Button>
              </Upload>
              {backImagePreview && (
                <div className="mt-2">
                  <Image
                    src={backImagePreview}
                    alt="Back Preview"
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
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editResident ? "Update" : "Add"} Resident
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
