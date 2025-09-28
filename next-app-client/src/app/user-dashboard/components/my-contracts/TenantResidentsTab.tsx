/* eslint-disable @typescript-eslint/no-explicit-any */

import { createResidentNotification } from "@/services/NotificationService";
import { ResidentService } from "@/services/ResidentService";
import { ContractData, ResidentData } from "@/types/types";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FilterOutlined,
  InboxOutlined,
  PlusOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  DatePicker,
  Form,
  Image,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Upload,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

// Helper function để convert relative path thành full Cloudinary URL
const getCloudinaryImageUrl = (relativePath: string) => {
  if (!relativePath) return "";
  if (relativePath.startsWith("http")) return relativePath; // Đã là full URL
  return `https://res.cloudinary.com${relativePath}`;
};

interface TenantResidentsTabProps {
  contract: ContractData;
  onContractUpdate?: (contract: ContractData) => void;
}

const relationshipOptions = [
  { value: "Bản thân", label: "Bản thân" },
  { value: "Vợ/Chồng", label: "Vợ/Chồng" },
  { value: "Con", label: "Con" },
  { value: "Bố/Mẹ", label: "Bố/Mẹ" },
  { value: "Anh/Em", label: "Anh/Em" },
  { value: "Bạn bè", label: "Bạn" },
  { value: "Khác", label: "Khác" },
];

export default function TenantResidentsTab({
  contract,
}: TenantResidentsTabProps) {
  const [residents, setResidents] = useState<ResidentData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedResident, setSelectedResident] = useState<ResidentData | null>(
    null
  );
  const [editResident, setEditResident] = useState<ResidentData | null>(null);
  const [addResidentOpen, setAddResidentOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [frontIdFileList, setFrontIdFileList] = useState<any[]>([]);
  const [backIdFileList, setBackIdFileList] = useState<any[]>([]);
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [relationshipFilter, setRelationshipFilter] = useState<string | null>(
    null
  );

  const [messageApi, contextHolder] = message.useMessage();

  // Helper to get current active form - với safety check
  const getCurrentForm = () => {
    if (editResident && editForm) return editForm;
    if (!editResident && addForm) return addForm;
    return null; // fallback
  };

  useEffect(() => {
    const fetchResidents = async () => {
      try {
        setLoading(true);
        const fetchedResidents = await ResidentService.getByContract(
          contract.id
        );
        setResidents(fetchedResidents);
      } catch (error) {
        console.error("Error fetching residents:", error);
        messageApi.error("Failed to load residents");
        // Set empty array when API fails, no mock data
        setResidents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResidents();
  }, [contract.id]);

  // Handle edit resident data loading
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

      // Load existing images with proper URL handling
      const frontImageList: any[] = [];
      const backImageList: any[] = [];

      if (editResident.idCardFrontUrl) {
        const frontUrl = getCloudinaryImageUrl(editResident.idCardFrontUrl);
        frontImageList.push({
          uid: "-1",
          name: "Front ID",
          status: "done",
          url: frontUrl,
        });
      }

      if (editResident.idCardBackUrl) {
        const backUrl = getCloudinaryImageUrl(editResident.idCardBackUrl);
        backImageList.push({
          uid: "-1",
          name: "Back ID",
          status: "done",
          url: backUrl,
        });
      }

      setFrontIdFileList(frontImageList);
      setBackIdFileList(backImageList);
    } else {
      // Only reset file lists when not editing, not forms
      setFrontIdFileList([]);
      setBackIdFileList([]);
    }
  }, [editResident]);

  // Handle file upload for ID card images
  const handleUpload = (file: File, type: "front" | "back") => {
    // In real app, upload to server and get URL
    const reader = new FileReader();
    reader.onload = () => {
      if (type === "front") {
        setFrontIdFileList([
          {
            uid: "-1",
            name: file.name,
            status: "done",
            url: reader.result as string,
            originFileObj: file, // Keep original file for API upload
          },
        ]);
      } else {
        setBackIdFileList([
          {
            uid: "-1",
            name: file.name,
            status: "done",
            url: reader.result as string,
            originFileObj: file, // Keep original file for API upload
          },
        ]);
      }
    };
    reader.readAsDataURL(file);
    return false; // Prevent default upload
  };

  const beforeUpload = (file: File) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      messageApi.error("You can only upload JPG/PNG file!");
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      messageApi.error("Image must smaller than 2MB!");
      return false;
    }
    return true;
  };

  const handleViewDetail = (resident: ResidentData) => {
    setSelectedResident(resident);
    setDetailModalOpen(true);
  };

  const handleAddResident = async (values: any) => {
    try {
      setLoading(true);

      // Convert file list to actual files
      const frontImageFile = frontIdFileList[0]?.originFileObj || null;
      const backImageFile = backIdFileList[0]?.originFileObj || null;

      // Create resident data
      const residentData = {
        fullName: values.fullName,
        idNumber: values.idNumber,
        relationship: values.relationship,
        startDate: values.startDate.format("YYYY-MM-DD"), // Format như backend mong đợi
        endDate: values.endDate.format("YYYY-MM-DD"), // Format như backend mong đợi
        note: values.note || "",
        contractId: contract.id,
      };

      // Call API to create resident
      const newResident = await ResidentService.createResident(
        contract.id,
        residentData,
        frontImageFile,
        backImageFile
      );
      await createResidentNotification(contract.landlordId, contract.tenantId, contract.id, "A new resident has been added to your contract by the tenant: " + values.fullName);
      console.log("Created resident:", newResident);

      setResidents((prev) => [...prev, newResident]);
      messageApi.success("Resident added successfully!");
      setAddResidentOpen(false);
      addForm.resetFields();
      setFrontIdFileList([]);
      setBackIdFileList([]);
    } catch (error) {
      console.error("Add resident error:", error);
      messageApi.error("Failed to add resident!");
    } finally {
      setLoading(false);
    }
  };

  const handleEditResident = async (values: any) => {
    if (!editResident) return;

    try {
      setLoading(true);

      // Convert file list to actual files (only if new files were uploaded)
      const frontImageFile = frontIdFileList[0]?.originFileObj || null;
      const backImageFile = backIdFileList[0]?.originFileObj || null;

      // Create resident data
      const residentData = {
        fullName: values.fullName,
        idNumber: values.idNumber,
        relationship: values.relationship,
        startDate: values.startDate.format("YYYY-MM-DD"), // Format như backend mong đợi
        endDate: values.endDate.format("YYYY-MM-DD"), // Format như backend mong đợi
        note: values.note || "",
        contractId: contract.id,
      };

      // Call API to update resident
      const updatedResident = await ResidentService.updateResident(
        contract.id,
        editResident.id,
        residentData,
        frontImageFile,
        backImageFile
      );

      setResidents((prev) =>
        prev.map((r) => (r.id === editResident.id ? updatedResident : r))
      );
      messageApi.success("Resident updated successfully!");
      setEditResident(null);
      // editForm and fileList will be reset in useEffect when editResident becomes null
    } catch (error) {
      console.error("Update resident error:", error);
      messageApi.error("Failed to update resident!");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResident = async (residentId: string) => {
    try {
      setLoading(true);

      // Call API to delete resident
      await ResidentService.deleteResident(contract.id, residentId);

      setResidents((prev) => prev.filter((r) => r.id !== residentId));
      messageApi.success("Resident deleted successfully!");
    } catch (error) {
      console.error("Delete resident error:", error);
      messageApi.error("Failed to delete resident!");
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<ResidentData> = [
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
      render: (name: string) => (
        <div className="flex items-center gap-2">
          <UserOutlined />
          <span className="font-medium">{name}</span>
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
          <div>{new Date(record.startDate).toLocaleDateString()}</div>
          <div className="text-gray-500 text-sm">
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
              onClick={() => handleViewDetail(record)}
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

  // Filter residents based on search and relationship - similar to MyContract
  const filteredResidents = residents.filter((resident: ResidentData) => {
    const matchesSearch =
      resident.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
      resident.idNumber.includes(searchText) ||
      (resident.note &&
        resident.note.toLowerCase().includes(searchText.toLowerCase()));

    const matchesRelationship =
      !relationshipFilter || resident.relationship === relationshipFilter;

    return matchesSearch && matchesRelationship;
  });

  return (
    <div className="p-6">
      {contextHolder}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Residents Management</h3>
        <Space>
          <Input
            placeholder="Search residents..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 200 }}
            allowClear
          />
          <Select
            placeholder="Filter by relationship"
            value={relationshipFilter}
            onChange={setRelationshipFilter}
            style={{ width: 180 }}
            allowClear
            suffixIcon={<FilterOutlined />}
          >
            {relationshipOptions.map((option) => (
              <Select.Option key={option.value} value={option.value}>
                <Tag color="blue">{option.label}</Tag>
              </Select.Option>
            ))}
          </Select>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setAddResidentOpen(true)}
          >
            Add Resident
          </Button>
        </Space>
      </div>

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
        locale={{
          emptyText: (
            <div className="text-center py-8">
              <UserOutlined className="text-4xl text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">
                {residents.length === 0
                  ? "No residents found"
                  : "No residents match your search criteria"}
              </p>
              <p className="text-gray-400 text-sm">
                {residents.length === 0
                  ? "Add residents to this contract to get started"
                  : "Try adjusting your search or filter"}
              </p>
            </div>
          ),
        }}
      />

      {/* Resident Detail Modal */}
      <Modal
        title="Resident Details"
        open={detailModalOpen}
        onCancel={() => {
          setDetailModalOpen(false);
          setSelectedResident(null);
        }}
        footer={null}
        width={800}
      >
        {selectedResident && (
          <div className="space-y-4">
            <Card>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Full Name:</strong> {selectedResident.fullName}
                </div>
                <div>
                  <strong>ID Number:</strong> {selectedResident.idNumber}
                </div>
                <div>
                  <strong>Relationship:</strong>
                  <Tag color="blue" className="ml-2">
                    {selectedResident.relationship}
                  </Tag>
                </div>
                <div>
                  <strong>Start Date:</strong>{" "}
                  {new Date(selectedResident.startDate).toLocaleDateString()}
                </div>
                <div>
                  <strong>End Date:</strong>{" "}
                  {new Date(selectedResident.endDate).toLocaleDateString()}
                </div>
                <div className="col-span-2">
                  <strong>Note:</strong> {selectedResident.note}
                </div>
              </div>
            </Card>

            {(selectedResident.idCardFrontUrl ||
              selectedResident.idCardBackUrl) && (
              <Card title="ID Card Images">
                <div className="flex gap-4">
                  {selectedResident.idCardFrontUrl && (
                    <div>
                      <p className="mb-2 font-medium">Front</p>
                      <Image
                        src={getCloudinaryImageUrl(
                          selectedResident.idCardFrontUrl
                        )}
                        alt="ID Card Front"
                        width={200}
                        height={120}
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  )}
                  {selectedResident.idCardBackUrl && (
                    <div>
                      <p className="mb-2 font-medium">Back</p>
                      <Image
                        src={getCloudinaryImageUrl(
                          selectedResident.idCardBackUrl
                        )}
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
          // Reset only the forms that were being used
          if (editResident) {
            editForm.resetFields();
          } else {
            addForm.resetFields();
          }
          setFrontIdFileList([]);
          setBackIdFileList([]);
        }}
        footer={null}
        width={600}
      >
        <Form
          key={editResident ? `edit-${editResident.id}` : "add-new"}
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
                // Removed restriction: dates can be in the future
              ]}
            >
              <DatePicker
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                onChange={() => {
                  // Trigger validation for end date when start date changes
                  const currentForm = getCurrentForm();
                  if (currentForm) {
                    currentForm.validateFields(["endDate"]);
                  }
                }}
                // Allow all dates including future dates
                disabledDate={() => false}
              />
            </Form.Item>

            <Form.Item
              label="End Date"
              name="endDate"
              rules={[
                { required: true, message: "Please select end date!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const startDate = getFieldValue("startDate");
                    if (!value || !startDate) {
                      return Promise.resolve();
                    }
                    if (value.isBefore(startDate, "day")) {
                      return Promise.reject(
                        new Error("End date must be after start date!")
                      );
                    }
                    if (value.isSame(startDate, "day")) {
                      return Promise.reject(
                        new Error("End date must be different from start date!")
                      );
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <DatePicker
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                disabledDate={(current) => {
                  const currentForm = getCurrentForm();
                  if (!currentForm) return false;
                  const startDate = currentForm.getFieldValue("startDate");
                  if (!startDate) return false;
                  // Only disable dates before or equal to start date
                  // Allow future dates for both start and end
                  return (
                    current &&
                    (current.isBefore(startDate, "day") ||
                      current.isSame(startDate, "day"))
                  );
                }}
              />
            </Form.Item>
          </div>

          <Form.Item label="Note" name="note">
            <Input.TextArea placeholder="Enter additional notes" rows={3} />
          </Form.Item>

          {/* ID Card Images Upload */}
          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="ID Card Front Image">
              <Upload
                listType="picture-card"
                fileList={frontIdFileList}
                beforeUpload={(file) => {
                  if (beforeUpload(file)) {
                    handleUpload(file, "front");
                  }
                  return false;
                }}
                onRemove={() => setFrontIdFileList([])}
                maxCount={1}
              >
                {frontIdFileList.length < 1 && (
                  <div>
                    <InboxOutlined />
                    <div style={{ marginTop: 8 }}>Upload Front</div>
                  </div>
                )}
              </Upload>
            </Form.Item>

            <Form.Item label="ID Card Back Image">
              <Upload
                listType="picture-card"
                fileList={backIdFileList}
                beforeUpload={(file) => {
                  if (beforeUpload(file)) {
                    handleUpload(file, "back");
                  }
                  return false;
                }}
                onRemove={() => setBackIdFileList([])}
                maxCount={1}
              >
                {backIdFileList.length < 1 && (
                  <div>
                    <InboxOutlined />
                    <div style={{ marginTop: 8 }}>Upload Back</div>
                  </div>
                )}
              </Upload>
            </Form.Item>
          </div>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button
                onClick={() => {
                  setAddResidentOpen(false);
                  setEditResident(null);
                  // Reset only the forms that were being used
                  if (editResident) {
                    editForm.resetFields();
                  } else {
                    addForm.resetFields();
                  }
                  setFrontIdFileList([]);
                  setBackIdFileList([]);
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
    </div>
  );
}
