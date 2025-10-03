/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Tooltip,
  Input,
  Select,
  message,
  Modal,
  Form,
  DatePicker,
  Upload,
  Image,
  Typography,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { ResidentData, ContractData } from "@/types/types";
import { ResidentService } from "@/services/ResidentService";
import { ContractService } from "@/services/ContractService";
import dayjs from "dayjs";

// Extended resident data with contract info
interface ExtendedResidentData extends ResidentData {
  contractInfo?: ContractData;
}

const { Title } = Typography;
const { TextArea } = Input;

const relationshipOptions = [
  { value: "Bản thân", label: "Bản thân" },
  { value: "Vợ/Chồng", label: "Vợ/Chồng" },
  { value: "Con", label: "Con" },
  { value: "Bố/Mẹ", label: "Bố/Mẹ" },
  { value: "Anh/Em", label: "Anh/Em" },
  { value: "Bạn bè", label: "Bạn" },
  { value: "Khác", label: "Khác" },
];



// Helper function to convert Cloudinary relative path to full URL
const getCloudinaryUrl = (relativePath: string): string => {
  if (!relativePath) return "";
  if (relativePath.startsWith("http")) return relativePath;
  return `https://res.cloudinary.com${relativePath}`;
};

export default function TenantResidentsPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const { data: session } = useSession();
  const [residents, setResidents] = useState<ExtendedResidentData[]>([]);
  const [selectedResident, setSelectedResident] = useState<ExtendedResidentData | null>(null);
  const [editResident, setEditResident] = useState<ExtendedResidentData | null>(null);
  const [addResidentOpen, setAddResidentOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [frontImageFile, setFrontImageFile] = useState<File | null>(null);
  const [backImageFile, setBackImageFile] = useState<File | null>(null);
  const [frontImagePreview, setFrontImagePreview] = useState<string>("");
  const [backImagePreview, setBackImagePreview] = useState<string>("");
  const [searchText, setSearchText] = useState("");
  const [relationshipFilter, setRelationshipFilter] = useState<string | null>(null);
  const [availableContracts, setAvailableContracts] = useState<ContractData[]>([]);
  const [loadingContracts, setLoadingContracts] = useState(false);

  // Load residents from API
  useEffect(() => {
    loadResidents();
  }, [session?.user?.id]);

  const loadResidents = async () => {
    if (!session?.user?.id) return;
    
    try {
      setLoading(true);
      const data = await ResidentService.getByTenant(session.user.id);
      console.log('Loaded residents data:', data); // Debug log
      
      // Fetch contract info for each resident
      const residentsWithContracts = await Promise.all(
        (data || []).map(async (resident) => {
          try {
            if (resident.contractId) {
              const contractInfo = await ContractService.getById(resident.contractId);
              return { ...resident, contractInfo };
            }
            return resident;
          } catch (error) {
            console.error(`Failed to load contract for resident ${resident.id}:`, error);
            return resident;
          }
        })
      );
      
      setResidents(residentsWithContracts);
    } catch (error) {
      console.error("Failed to load residents:", error);
      messageApi.error("Failed to load residents!");
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableContracts = async () => {
    if (!session?.user?.id) return;
    
    try {
      setLoadingContracts(true);
      // Load contracts by tenant using ContractService
      const response = await ContractService.getByTenant(session.user.id);
      console.log('Available contracts:', response);
      setAvailableContracts(response || []);
    } catch (error) {
      console.error("Failed to load contracts:", error);
    } finally {
      setLoadingContracts(false);
    }
  };

  // Handle form reset and image cleanup
  const resetForm = () => {
    try {
      addForm.resetFields();
      editForm.resetFields();
    } catch (error) {
      // Ignore form reset errors if forms are destroyed
    }
    setFrontImageFile(null);
    setBackImageFile(null);
    setFrontImagePreview("");
    setBackImagePreview("");
  };

  // Handle edit resident setup for image previews
  useEffect(() => {
    if (editResident) {
      // Set existing image previews
      if (editResident.idCardFrontUrl) {
        setFrontImagePreview(getCloudinaryUrl(editResident.idCardFrontUrl));
      }
      if (editResident.idCardBackUrl) {
        setBackImagePreview(getCloudinaryUrl(editResident.idCardBackUrl));
      }
    } else {
      setFrontImagePreview("");
      setBackImagePreview("");
    }
  }, [editResident]);

  // Handle add resident modal opening - load contracts
  useEffect(() => {
    if (addResidentOpen && !editResident) {
      loadAvailableContracts();
    }
  }, [addResidentOpen, editResident]);

  const handleAddResident = async (values: any) => {
    try {
      setLoading(true);

      if (!values.contractId) {
        messageApi.error("Please select a contract!");
        return;
      }

      // Format dates to YYYY-MM-DD format for backend
      const formattedData = {
        ...values,
        startDate: values.startDate.format("YYYY-MM-DD"),
        endDate: values.endDate.format("YYYY-MM-DD"),
        contractId: values.contractId,
      };

      await ResidentService.createResident(
        values.contractId,
        formattedData,
        frontImageFile || undefined,
        backImageFile || undefined
      );

      message.success("Resident added successfully!");
      setAddResidentOpen(false);
      // Form will be reset by destroyOnClose, just reset images
      setFrontImageFile(null);
      setBackImageFile(null);
      setFrontImagePreview("");
      setBackImagePreview("");
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
        contractId: editResident.contractId,
      };

      console.log('Updating resident with data:', formattedData); // Debug log
      
      await ResidentService.updateResident(
        editResident.contractId!,
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

  const handleDeleteResident = async (residentId: string, contractId: string) => {
    try {
      setLoading(true);
      await ResidentService.deleteResident(contractId, residentId);
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
      resident.note?.toLowerCase().includes(searchText.toLowerCase()) ||
      resident.contractInfo?.roomTitle?.toLowerCase().includes(searchText.toLowerCase()) ||
      resident.contractInfo?.contractName?.toLowerCase().includes(searchText.toLowerCase());

    const matchesRelationship =
      !relationshipFilter || resident.relationship === relationshipFilter;

    return matchesSearch && matchesRelationship;
  });

  // Clear all filters
  const clearFilters = () => {
    setSearchText("");
    setRelationshipFilter(null);
  };

  const columns: ColumnsType<ExtendedResidentData> = [
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
      render: (name: string) => (
        <div className="flex items-center gap-2">
          <UserOutlined className="dark:text-gray-300" />
          <span className="font-medium transition-colors duration-300 dark:text-white">
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
      title: "Room Title",
      key: "roomTitle",
      render: (_: any, record: ExtendedResidentData) => (
        <div className="max-w-xs">
          <span className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
            {record.contractInfo?.roomTitle || "N/A"}
          </span>
        </div>
      ),
      ellipsis: true,
    },
    {
      title: "Period",
      key: "period",
      render: (_: any, record: ExtendedResidentData) => (
        <div>
          <div className="transition-colors duration-300 dark:text-white">
            {new Date(record.startDate).toLocaleDateString()}
          </div>
          <div className="text-sm text-gray-500 transition-colors duration-300 dark:text-gray-400">
            to {new Date(record.endDate).toLocaleDateString()}
          </div>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const getStatusColor = (status: string) => {
          switch (status) {
            case "DONE":
              return "green";
            case "PENDING":
              return "orange";
            default:
              return "orange";
          }
        };
        return <Tag color={getStatusColor(status)}>{status || "PENDING"}</Tag>;
      },
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
      render: (_: any, record: ExtendedResidentData) => (
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
              onClick={() => {
                setEditResident(record);
                editForm.setFieldsValue({
                  fullName: record.fullName,
                  idNumber: record.idNumber,
                  relationship: record.relationship,
                  startDate: dayjs(record.startDate),
                  endDate: dayjs(record.endDate),
                  note: record.note,
                });
              }}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Delete resident"
              description="Are you sure you want to delete this resident?"
              onConfirm={() => handleDeleteResident(record.id, record.contractId!)}
              okText="Yes"
              cancelText="No"
            >
              <Button icon={<DeleteOutlined />} danger />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Card
        title={
          <div className="flex items-center justify-between">
            <Title level={3} style={{ margin: 0 }}>
              My Residents
            </Title>
          </div>
        }
        className="shadow-sm bg-white dark:bg-[#17223b] border-gray-200 dark:border-gray-600 transition-colors duration-300"
        extra={
          <div className="flex items-center gap-3">
            {/* Search */}
            <Input
              placeholder="Search by name, ID, room..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 220 }}
              allowClear
            />
            
            {/* Relationship Filter */}
            <Select
              placeholder="Filter by relationship"
              value={relationshipFilter}
              onChange={setRelationshipFilter}
              style={{ width: 180 }}
              allowClear
              suffixIcon={<FilterOutlined />}
              options={relationshipOptions}
            />
            
            {/* Clear Filters */}
            {(searchText || relationshipFilter) && (
              <Button onClick={clearFilters}>Clear Filters</Button>
            )}
            
            {/* Add Button */}
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
      </Card>

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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Full Name</label>
                <p className="text-base">{selectedResident.fullName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">ID Number</label>
                <p className="text-base">{selectedResident.idNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Relationship</label>
                <p className="text-base">
                  <Tag color="blue">{selectedResident.relationship}</Tag>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <p className="text-base">
                  <Tag color={selectedResident.status === "DONE" ? "green" : "orange"}>
                    {selectedResident.status || "PENDING"}
                  </Tag>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Start Date</label>
                <p className="text-base">{new Date(selectedResident.startDate).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">End Date</label>
                <p className="text-base">{new Date(selectedResident.endDate).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Contract Information */}
            {selectedResident.contractInfo && (
              <div className="pt-4 border-t">
                <h4 className="mb-3 text-base font-medium text-gray-700">Contract Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Contract Name</label>
                    <p className="text-base">{selectedResident.contractInfo.contractName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Room Title</label>
                    <p className="text-base line-clamp-2">{selectedResident.contractInfo.roomTitle}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Landlord</label>
                    <p className="text-base">{selectedResident.contractInfo.landlordName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Monthly Rent</label>
                    <p className="text-base">${selectedResident.contractInfo.monthlyRent}</p>
                  </div>
                </div>
              </div>
            )}
            
            {selectedResident.note && (
              <div className="pt-4 border-t">
                <label className="text-sm font-medium text-gray-500">Note</label>
                <p className="text-base">{selectedResident.note}</p>
              </div>
            )}

            {/* ID Card Images */}
            <div className="grid grid-cols-2 gap-4">
              {selectedResident.idCardFrontUrl && (
                <div>
                  <label className="text-sm font-medium text-gray-500">ID Card Front</label>
                  <Image
                    src={getCloudinaryUrl(selectedResident.idCardFrontUrl)}
                    alt="ID Card Front"
                    width="100%"
                    height={200}
                    style={{ objectFit: "cover" }}
                  />
                </div>
              )}
              {selectedResident.idCardBackUrl && (
                <div>
                  <label className="text-sm font-medium text-gray-500">ID Card Back</label>
                  <Image
                    src={getCloudinaryUrl(selectedResident.idCardBackUrl)}
                    alt="ID Card Back"
                    width="100%"
                    height={200}
                    style={{ objectFit: "cover" }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {contextHolder}
      
      {/* Add Resident Modal */}
      <Modal
        title="Add Resident"
        open={addResidentOpen}
        onCancel={() => {
          setAddResidentOpen(false);
          // Form will be reset by destroyOnClose
        }}
        footer={null}
        destroyOnHidden={true}
      >
        <Form
          form={addForm}
          layout="vertical"
          onFinish={handleAddResident}
          initialValues={{
            relationship: "Bản thân",
          }}
        >
          <Form.Item
            label="Contract"
            name="contractId"
            rules={[{ required: true, message: "Please select a contract!" }]}
          >
            <Select
              placeholder="Select contract"
              loading={loadingContracts}
              options={availableContracts.map((contract) => ({
                value: contract.id,
                label: `${contract.roomTitle || 'Unknown Room'} - ${contract.contractName || 'No Contract Name'}`,
              }))}
            />
          </Form.Item>

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
            rules={[{ required: true, message: "Please enter ID number!" }]}
          >
            <Input placeholder="Enter ID number" />
          </Form.Item>

          <Form.Item
            label="Relationship"
            name="relationship"
            rules={[{ required: true, message: "Please select relationship!" }]}
          >
            <Select options={relationshipOptions} />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label="Start Date"
              name="startDate"
              rules={[
                { required: true, message: "Please select start date!" },
                { validator: validateStartDateAdd },
              ]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              label="End Date"
              name="endDate"
              rules={[
                { required: true, message: "Please select end date!" },
                { validator: validateEndDateAdd },
              ]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </div>

          {/* ID Card Upload */}
          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="ID Card Front">
              <Upload.Dragger
                name="frontImage"
                multiple={false}
                beforeUpload={handleFrontImageChange}
                showUploadList={false}
                accept="image/*"
              >
                {frontImagePreview ? (
                  <Image
                    src={frontImagePreview}
                    alt="Front ID Preview"
                    width="100%"
                    height={120}
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <div className="p-4">
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">Upload ID Front</p>
                  </div>
                )}
              </Upload.Dragger>
            </Form.Item>

            <Form.Item label="ID Card Back">
              <Upload.Dragger
                name="backImage"
                multiple={false}
                beforeUpload={handleBackImageChange}
                showUploadList={false}
                accept="image/*"
              >
                {backImagePreview ? (
                  <Image
                    src={backImagePreview}
                    alt="Back ID Preview"
                    width="100%"
                    height={120}
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <div className="p-4">
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">Upload ID Back</p>
                  </div>
                )}
              </Upload.Dragger>
            </Form.Item>
          </div>

          <Form.Item label="Note" name="note">
            <TextArea rows={3} placeholder="Enter any additional notes..." />
          </Form.Item>

          <Form.Item>
            <div className="flex justify-end gap-2">
              <Button onClick={() => {
                setAddResidentOpen(false);
                // Form will be reset by destroyOnClose
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Add Resident
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Resident Modal */}
      <Modal
        title="Edit Resident"
        open={!!editResident}
        onCancel={() => {
          setEditResident(null);
          // Form will be reset by destroyOnClose
        }}
        footer={null}
        destroyOnHidden={true}
        key={editResident?.id || 'edit-modal'}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditResident}
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
            rules={[{ required: true, message: "Please enter ID number!" }]}
          >
            <Input placeholder="Enter ID number" />
          </Form.Item>

          <Form.Item
            label="Relationship"
            name="relationship"
            rules={[{ required: true, message: "Please select relationship!" }]}
          >
            <Select options={relationshipOptions} />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label="Start Date"
              name="startDate"
              rules={[
                { required: true, message: "Please select start date!" },
                { validator: validateStartDateEdit },
              ]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              label="End Date"
              name="endDate"
              rules={[
                { required: true, message: "Please select end date!" },
                { validator: validateEndDateEdit },
              ]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </div>

          {/* ID Card Upload */}
          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="ID Card Front">
              <Upload.Dragger
                name="frontImage"
                multiple={false}
                beforeUpload={handleFrontImageChange}
                showUploadList={false}
                accept="image/*"
              >
                {frontImagePreview ? (
                  <Image
                    src={frontImagePreview}
                    alt="Front ID Preview"
                    width="100%"
                    height={120}
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <div className="p-4">
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">Upload ID Front</p>
                  </div>
                )}
              </Upload.Dragger>
            </Form.Item>

            <Form.Item label="ID Card Back">
              <Upload.Dragger
                name="backImage"
                multiple={false}
                beforeUpload={handleBackImageChange}
                showUploadList={false}
                accept="image/*"
              >
                {backImagePreview ? (
                  <Image
                    src={backImagePreview}
                    alt="Back ID Preview"
                    width="100%"
                    height={120}
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <div className="p-4">
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">Upload ID Back</p>
                  </div>
                )}
              </Upload.Dragger>
            </Form.Item>
          </div>

          <Form.Item label="Note" name="note">
            <TextArea rows={3} placeholder="Enter any additional notes..." />
          </Form.Item>

          <Form.Item>
            <div className="flex justify-end gap-2">
              <Button onClick={() => {
                setEditResident(null);
                // Form will be reset by destroyOnClose
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Update Resident
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}