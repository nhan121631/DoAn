/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";
import {
  Card,
  Table,
  Space,
  Button,
  Typography,
  Tag,
  Modal,
  Form,
  Input,
  DatePicker,
  Upload,
  Select,
  Image,
  Tooltip,
  Popconfirm,
  message,
} from "antd";
import {
  UserOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  UploadOutlined,
  SearchOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { useSession } from "next-auth/react";
import { ResidentService } from "@/services/ResidentService";
import { ContractService } from "@/services/ContractService";
import { ResidentData, ContractData } from "@/types/types";
import dayjs from "dayjs";

// Extended resident data with contract info
interface ExtendedResidentData extends ResidentData {
  contractInfo?: ContractData;
}

const { Title } = Typography;
const { TextArea } = Input;

const relationshipOptions = [
  { value: "Vợ/Chồng", label: "Vợ/Chồng" },
  { value: "Con", label: "Con" },
  { value: "Bố/Mẹ", label: "Bố/Mẹ" },
  { value: "Anh/Em", label: "Anh/Em" },
  { value: "Khác", label: "Khác" },
];

const statusOptions = [
  { value: "PENDING", label: "PENDING" },
  { value: "DONE", label: "DONE" },
];

// Helper function to convert Cloudinary relative path to full URL
const getCloudinaryUrl = (relativePath: string): string => {
  if (!relativePath) return "";
  if (relativePath.startsWith("http")) return relativePath;
  return `https://res.cloudinary.com${relativePath}`;
};

export default function ManageResidentsPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const { data: session } = useSession();
  const [residents, setResidents] = useState<ExtendedResidentData[]>([]);
  const [selectedResident, setSelectedResident] =
    useState<ExtendedResidentData | null>(null);
  const [editResident, setEditResident] = useState<ExtendedResidentData | null>(
    null
  );
  const [addResidentOpen, setAddResidentOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Initialize forms only once
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
  const [availableContracts, setAvailableContracts] = useState<any[]>([]);
  const [loadingContracts, setLoadingContracts] = useState(false);

  // Load residents from API
  useEffect(() => {
    loadResidents();
  }, [session?.user?.id]);

  // Cleanup forms on unmount
  useEffect(() => {
    return () => {
      // Only attempt cleanup if forms exist and have the resetFields method
      if (addForm && typeof addForm.resetFields === "function") {
        try {
          addForm.resetFields();
        } catch (error) {
          // Ignore cleanup errors
        }
      }
      if (editForm && typeof editForm.resetFields === "function") {
        try {
          editForm.resetFields();
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    };
  }, [addForm, editForm]);

  const loadResidents = async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);
      const data = await ResidentService.getByLandlord(session.user.id);
      console.log("Loaded residents data:", data); // Debug log

      // Fetch contract info for each resident
      const residentsWithContracts = await Promise.all(
        (data || []).map(async (resident) => {
          try {
            if (resident.contractId) {
              const contractInfo = await ContractService.getById(
                resident.contractId
              );
              return { ...resident, contractInfo };
            }
            return resident;
          } catch (error) {
            console.error(
              `Failed to load contract for resident ${resident.id}:`,
              error
            );
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
      // Load contracts by landlord using ContractService
      const response = await ContractService.getByLandlord(
        session.user.id,
        0,
        100
      );
      console.log("Available contracts:", response);
      setAvailableContracts(response.content || []);
    } catch (error) {
      console.error("Failed to load contracts:", error);
    } finally {
      setLoadingContracts(false);
    }
  };

  // Handle form reset and image cleanup
  const resetForm = () => {
    // Only reset forms if they exist and are connected
    if (addForm && typeof addForm.resetFields === "function") {
      try {
        addForm.resetFields();
      } catch (error) {
        // Ignore form reset errors when forms are not connected
      }
    }
    if (editForm && typeof editForm.resetFields === "function") {
      try {
        editForm.resetFields();
      } catch (error) {
        // Ignore form reset errors when forms are not connected
      }
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

  // Handle add resident modal opening - reset form and load contracts
  useEffect(() => {
    if (addResidentOpen && !editResident) {
      resetForm();
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

      console.log("Form values received:", values); // Debug log to see what form sends

      // Format dates to YYYY-MM-DD format for backend
      const formattedData = {
        fullName: values.fullName,
        idNumber: values.idNumber,
        relationship: values.relationship,
        startDate: values.startDate.format("YYYY-MM-DD"),
        endDate: values.endDate.format("YYYY-MM-DD"),
        note: values.note,
        status: values.status, // Ensure status is included
        contractId: editResident.contractId,
      };

      console.log("Updating resident with data:", formattedData); // Debug log

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

  const handleDeleteResident = async (
    residentId: string,
    contractId: string
  ) => {
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
    if (!addForm || typeof addForm.getFieldValue !== "function") {
      return Promise.resolve();
    }
    try {
      const startDate = addForm.getFieldValue("startDate");
      if (value && startDate && value.isBefore(startDate)) {
        return Promise.reject(new Error("End date must be after start date!"));
      }
    } catch (error) {
      // Form not ready, skip validation
    }
    return Promise.resolve();
  };

  const validateStartDateAdd = (_: any, value: any) => {
    if (!addForm || typeof addForm.getFieldValue !== "function") {
      return Promise.resolve();
    }
    try {
      const endDate = addForm.getFieldValue("endDate");
      if (value && endDate && value.isAfter(endDate)) {
        return Promise.reject(new Error("Start date must be before end date!"));
      }
    } catch (error) {
      // Form not ready, skip validation
    }
    return Promise.resolve();
  };

  // Date validation for edit form
  const validateEndDateEdit = (_: any, value: any) => {
    if (!editForm || typeof editForm.getFieldValue !== "function") {
      return Promise.resolve();
    }
    try {
      const startDate = editForm.getFieldValue("startDate");
      if (value && startDate && value.isBefore(startDate)) {
        return Promise.reject(new Error("End date must be after start date!"));
      }
    } catch (error) {
      // Form not ready, skip validation
    }
    return Promise.resolve();
  };

  const validateStartDateEdit = (_: any, value: any) => {
    if (!editForm || typeof editForm.getFieldValue !== "function") {
      return Promise.resolve();
    }
    try {
      const endDate = editForm.getFieldValue("endDate");
      if (value && endDate && value.isAfter(endDate)) {
        return Promise.reject(new Error("Start date must be before end date!"));
      }
    } catch (error) {
      // Form not ready, skip validation
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
      resident.contractInfo?.roomTitle
        ?.toLowerCase()
        .includes(searchText.toLowerCase()) ||
      resident.contractInfo?.contractName
        ?.toLowerCase()
        .includes(searchText.toLowerCase());

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
                console.log("Edit button clicked for resident:", record);
                setEditResident(record);
              }}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Are you sure you want to delete this resident?"
              onConfirm={() =>
                handleDeleteResident(record.id, record.contractId!)
              }
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
    <div style={{ padding: "24px" }}>
      <Card
        title={
          <h3 className="m-0 text-lg font-semibold text-gray-900 transition-colors duration-300 dark:text-white">
            Residents Management
          </h3>
        }
        className="shadow-sm bg-white dark:bg-[#17223b] border-gray-200 dark:border-gray-600 transition-colors duration-300"
        extra={
          <div className="flex items-center gap-3">
            <Input
              placeholder="Search by name, ID, room..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 220 }}
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
            <Card className="bg-white dark:bg-[#22304a] border-gray-200 dark:border-gray-600 transition-colors duration-300">
              <div className="grid grid-cols-2 gap-4">
                <div className="transition-colors duration-300 dark:text-gray-300">
                  <strong className="dark:text-white">Full Name:</strong>{" "}
                  {selectedResident.fullName}
                </div>
                <div className="transition-colors duration-300 dark:text-gray-300">
                  <strong className="dark:text-white">ID Number:</strong>{" "}
                  {selectedResident.idNumber}
                </div>
                <div className="transition-colors duration-300 dark:text-gray-300">
                  <strong className="dark:text-white">Relationship:</strong>
                  <Tag color="blue" className="ml-2">
                    {selectedResident.relationship}
                  </Tag>
                </div>
                <div className="transition-colors duration-300 dark:text-gray-300">
                  <strong className="dark:text-white">Status:</strong>
                  <Tag
                    color={
                      selectedResident.status === "DONE" ? "green" : "orange"
                    }
                    className="ml-2"
                  >
                    {selectedResident.status || "PENDING"}
                  </Tag>
                </div>
                <div className="transition-colors duration-300 dark:text-gray-300">
                  <strong className="dark:text-white">Start Date:</strong>{" "}
                  {new Date(selectedResident.startDate).toLocaleDateString()}
                </div>
                <div className="transition-colors duration-300 dark:text-gray-300">
                  <strong className="dark:text-white">End Date:</strong>{" "}
                  {new Date(selectedResident.endDate).toLocaleDateString()}
                </div>
                {(selectedResident as ExtendedResidentData).contractInfo && (
                  <div className="transition-colors duration-300 dark:text-gray-300">
                    <strong className="dark:text-white">Room Title:</strong>{" "}
                    {
                      (selectedResident as ExtendedResidentData).contractInfo
                        ?.roomTitle
                    }
                  </div>
                )}
                <div className="col-span-2 transition-colors duration-300 dark:text-gray-300">
                  <strong className="dark:text-white">Note:</strong>{" "}
                  {selectedResident.note}
                </div>
              </div>
            </Card>

            {(selectedResident.idCardFrontUrl ||
              selectedResident.idCardBackUrl) && (
              <Card
                title={
                  <span className="transition-colors duration-300 dark:text-white">
                    ID Card Images
                  </span>
                }
                className="bg-white dark:bg-[#22304a] border-gray-200 dark:border-gray-600 transition-colors duration-300"
              >
                <div className="flex gap-4">
                  {selectedResident.idCardFrontUrl && (
                    <div>
                      <p className="mb-2 font-medium transition-colors duration-300 dark:text-white">
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
                      <p className="mb-2 font-medium transition-colors duration-300 dark:text-white">
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
      {contextHolder}
      {/* Add Resident Modal */}
      <Modal
        title="Add Resident"
        open={addResidentOpen}
        onCancel={() => {
          setAddResidentOpen(false);
          resetForm();
        }}
        footer={null}
        destroyOnHidden={true}
      >
        <Form
          form={addForm}
          layout="vertical"
          onFinish={handleAddResident}
          preserve={false}
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

          <Form.Item
            label="Contract"
            name="contractId"
            rules={[{ required: true, message: "Please select a contract!" }]}
          >
            <Select
              placeholder="Select contract"
              loading={loadingContracts}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={availableContracts.map((contract) => ({
                value: contract.id,
                label: `${contract.contractName || "Contract"} - ${
                  contract.roomTitle || "Room"
                }`,
              }))}
            />
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
              <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
            </Form.Item>

            <Form.Item
              label="End Date"
              name="endDate"
              rules={[
                { required: true, message: "Please select end date!" },
                { validator: validateEndDateAdd },
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

          <div className="flex justify-end gap-2 pt-4">
            <Button onClick={() => setAddResidentOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Add Resident
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Edit Resident Modal */}
      <Modal
        title="Edit Resident"
        open={!!editResident}
        onCancel={() => {
          setEditResident(null);
          resetForm();
        }}
        footer={null}
        destroyOnHidden={true}
        key={editResident?.id || "edit-modal"}
      >
        {editResident && (
          <Form
            form={editForm}
            layout="vertical"
            onFinish={handleEditResident}
            preserve={false}
            key={editResident.id}
            initialValues={{
              fullName: editResident.fullName,
              idNumber: editResident.idNumber,
              relationship: editResident.relationship,
              startDate: editResident.startDate
                ? dayjs(editResident.startDate)
                : null,
              endDate: editResident.endDate
                ? dayjs(editResident.endDate)
                : null,
              note: editResident.note,
              status: editResident.status || "PENDING",
            }}
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
              rules={[
                { required: true, message: "Please select relationship!" },
              ]}
            >
              <Select
                placeholder="Select relationship"
                options={relationshipOptions}
              />
            </Form.Item>

            <Form.Item
              label="Status"
              name="status"
              rules={[{ required: true, message: "Please select status!" }]}
            >
              <Select placeholder="Select status" options={statusOptions} />
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
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
              </Form.Item>

              <Form.Item
                label="End Date"
                name="endDate"
                rules={[
                  { required: true, message: "Please select end date!" },
                  { validator: validateEndDateEdit },
                ]}
              >
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
              </Form.Item>
            </div>

            <Form.Item label="Note" name="note">
              <Input.TextArea placeholder="Enter additional notes" rows={3} />
            </Form.Item>

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

            <div className="flex justify-end gap-2 pt-4">
              <Button
                onClick={() => {
                  setEditResident(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Update Resident
              </Button>
            </div>
          </Form>
        )}
      </Modal>
    </div>
  );
}
