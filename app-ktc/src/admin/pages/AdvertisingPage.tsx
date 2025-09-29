import { useState, useEffect, useCallback } from "react";
import {
  useGetAllAds,
  useCreateAds,
  useUpdateAds,
  useDeleteAds,
  useToggleAdsStatus,
  useCheckConflicts,
} from "../service/ReactQueryAds";
import type {
  AdsResponse,
  CreateAdsRequest,
  UpdateAdsRequest,
  AdsPosition,
} from "../service/ReactQueryAds";
import {
  Button,
  Table,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Upload,
  Switch,
  Space,
  Popconfirm,
  message,
  Card,
  Row,
  Col,
  Tag,
  InputNumber,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { UploadFile } from "antd/es/upload/interface";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

export default function AdvertisingPage() {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAds, setEditingAds] = useState<AdsResponse | null>(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [conflictWarning, setConflictWarning] = useState<string>("");
  const [isCheckingConflicts, setIsCheckingConflicts] = useState(false);

  // React Query hooks
  const { data: adsData, isLoading, refetch } = useGetAllAds({ page, size });
  const createAdsMutation = useCreateAds();
  const updateAdsMutation = useUpdateAds();
  const deleteAdsMutation = useDeleteAds();
  const toggleStatusMutation = useToggleAdsStatus();
  const checkConflictsMutation = useCheckConflicts();

  const handleCreate = () => {
    setEditingAds(null);
    setIsModalVisible(true);
    form.resetFields();
    setFileList([]);
    setConflictWarning("");
  };

  const handleEdit = (record: AdsResponse) => {
    setEditingAds(record);
    setIsModalVisible(true);
    setConflictWarning("");

    // Fill form with existing data
    form.setFieldsValue({
      title: record.title,
      description: record.description,
      linkUrl: record.linkUrl,
      position: record.position,
      dateRange: [dayjs(record.startDate), dayjs(record.endDate)],
      isActive: record.isActive,
      priority: record.priority,
    });

    // Set existing image in file list
    if (record.imageUrl) {
      setFileList([
        {
          uid: "-1",
          name: "current-image.jpg",
          status: "done",
          url: record.imageUrl.startsWith("http")
            ? record.imageUrl
            : `https://res.cloudinary.com${record.imageUrl}`,
        },
      ]);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAdsMutation.mutateAsync(id);
      messageApi.success("Advertisement deleted successfully");
      refetch();
    } catch (error) {
      console.error("Delete error:", error);
      messageApi.error("Failed to delete advertisement");
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleStatusMutation.mutateAsync(id);
      messageApi.success("Advertisement status updated");
      refetch();
    } catch (error) {
      console.error("Toggle status error:", error);
      messageApi.error("Failed to update advertisement status");
    }
  };

  interface FormValues {
    title: string;
    description?: string;
    linkUrl?: string;
    position: AdsPosition;
    dateRange: [Dayjs, Dayjs];
    isActive?: boolean;
    priority?: number;
  }

  const handleSubmit = async (values: FormValues) => {
    try {
      const imageFile = fileList.find((file) => file.originFileObj)
        ?.originFileObj as File;

      if (!editingAds && !imageFile) {
        messageApi.error("Please upload an image");
        return;
      }

      const adsData = {
        title: values.title,
        description: values.description,
        linkUrl: values.linkUrl,
        position: values.position,
        startDate: values.dateRange[0].toISOString(),
        endDate: values.dateRange[1].toISOString(),
        isActive: values.isActive ?? true,
        priority: values.priority ?? 0,
      };

      // Check for conflicts before submitting
      try {
        const conflicts = await checkConflictsMutation.mutateAsync({
          position: adsData.position,
          startDate: adsData.startDate,
          endDate: adsData.endDate,
          excludeId: editingAds?.id,
        });

        if (conflicts.length > 0) {
          const conflictMessages = conflicts
            .map(
              (conflict) =>
                `"${conflict.title}" (Priority: ${
                  conflict.priority
                }, ${new Date(
                  conflict.startDate
                ).toLocaleDateString()} - ${new Date(
                  conflict.endDate
                ).toLocaleDateString()})`
            )
            .join(", ");

          messageApi.warning(
            `⚠️ Conflict detected! This banner conflicts with: ${conflictMessages}. 
            💡 Tip: Higher priority banners display first. Current priority: ${adsData.priority}`,
            6 // Show for 6 seconds
          );

          // Allow user to continue after warning
        }
      } catch (conflictError) {
        console.warn("Could not check conflicts:", conflictError);
      }

      if (editingAds) {
        // Update
        const updateData: UpdateAdsRequest = {
          ...adsData,
          id: editingAds.id,
        };
        await updateAdsMutation.mutateAsync({
          data: updateData,
          imageFile: imageFile,
        });
        messageApi.success("Advertisement updated successfully");
      } else {
        // Create
        const createData: CreateAdsRequest = adsData;
        await createAdsMutation.mutateAsync({
          data: createData,
          imageFile: imageFile!,
        });
        messageApi.success("Advertisement created successfully");
      }

      setIsModalVisible(false);
      form.resetFields();
      setFileList([]);
      setConflictWarning("");
      refetch();
    } catch (error) {
      console.error("Submit error:", error);
      messageApi.error(
        "Failed to save advertisement. Please check all required fields."
      );
    }
  };

  const uploadProps = {
    fileList,
    onChange: ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
      setFileList(newFileList);
    },
    beforeUpload: () => false, // Prevent auto upload
    accept: "image/*",
    maxCount: 1,
  };

  const columns: ColumnsType<AdsResponse> = [
    {
      title: "Image",
      dataIndex: "imageUrl",
      key: "imageUrl",
      width: 100,
      render: (imageUrl: string) => (
        <img
          src={
            imageUrl.startsWith("http")
              ? imageUrl
              : `https://res.cloudinary.com${imageUrl}`
          }
          alt="Ad"
          style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 4 }}
        />
      ),
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      width: 200,
    },
    {
      title: "Position",
      dataIndex: "position",
      key: "position",
      width: 100,
      render: (position: string) => <Tag color="blue">{position}</Tag>,
    },
    {
      title: "Date Range",
      key: "dateRange",
      width: 200,
      render: (record: AdsResponse) => (
        <div>
          <div>{dayjs(record.startDate).format("DD/MM/YYYY")}</div>
          <div>{dayjs(record.endDate).format("DD/MM/YYYY")}</div>
        </div>
      ),
    },
    {
      title: "Status",
      key: "status",
      width: 120,
      render: (record: AdsResponse) => (
        <Space direction="vertical" size="small">
          <Tag color={record.isActive ? "green" : "red"}>
            {record.isActive ? "Active" : "Inactive"}
          </Tag>
          <Tag color={record.isCurrentlyActive ? "cyan" : "orange"}>
            {record.isCurrentlyActive ? "Live" : "Scheduled"}
          </Tag>
        </Space>
      ),
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      width: 100,
      sorter: true,
      render: (priority: number) => (
        <div style={{ textAlign: "center" }}>
          <Tag
            color={
              priority >= 500 ? "red" : priority >= 100 ? "orange" : "green"
            }
          >
            {priority}
          </Tag>
          <div style={{ fontSize: 10, color: "#666" }}>
            {priority >= 500 ? "High" : priority >= 100 ? "Medium" : "Low"}
          </div>
        </div>
      ),
    },
    {
      // title: "Actions",
      key: "actions",
      width: 200,
      render: (record: AdsResponse) => (
        <Space>
          <Button
            type="primary"
            size="small"
            // icon={<EyeInvisibleOutlined />}
            onClick={() => handleToggleStatus(record.id)}
          >
            {record.isActive ? <EyeOutlined /> : <EyeInvisibleOutlined />}{" "}
            {record.isActive ? "Deactivate" : "Activate"}
          </Button>
          <Button
            type="default"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this advertisement?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="primary"
              danger
              size="small"
              icon={<DeleteOutlined />}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Real-time conflict checking với debounce
  const checkConflictsRealTime = useCallback(
    async (
      position: AdsPosition,
      dateRange: [Dayjs | null, Dayjs | null] | null
    ) => {
      console.log("🔍 Checking conflicts:", { position, dateRange });

      if (!position || !dateRange || !dateRange[0] || !dateRange[1]) {
        setConflictWarning("");
        return;
      }

      setIsCheckingConflicts(true);
      try {
        // Tạo request object
        const conflictRequest = {
          position: position,
          startDate: dateRange[0].toISOString(),
          endDate: dateRange[1].toISOString(),
          excludeId: editingAds?.id,
        };

        // Gọi API thông qua mutation
        const conflicts = await new Promise<AdsResponse[]>(
          (resolve, reject) => {
            checkConflictsMutation.mutate(conflictRequest, {
              onSuccess: (data) => resolve(data),
              onError: (error) => reject(error),
            });
          }
        );

        console.log("🔍 Conflicts found:", conflicts);

        if (conflicts.length > 0) {
          const conflictMessages = conflicts
            .map(
              (conflict: AdsResponse) =>
                `"${conflict.title}" (Priority: ${conflict.priority}, ${dayjs(
                  conflict.startDate
                ).format("DD/MM/YYYY")} - ${dayjs(conflict.endDate).format(
                  "DD/MM/YYYY"
                )})`
            )
            .join(", ");

          setConflictWarning(`⚠️ Conflicts detected with: ${conflictMessages}`);
        } else {
          setConflictWarning("");
        }
      } catch (error) {
        console.warn("Could not check conflicts:", error);
        setConflictWarning("");
      } finally {
        setIsCheckingConflicts(false);
      }
    },
    [editingAds?.id, checkConflictsMutation]
  );

  // Watch form changes (chỉ để debug, không dùng để trigger check conflicts)
  const position = Form.useWatch("position", form);
  const dateRange = Form.useWatch("dateRange", form);

  // Debug log
  useEffect(() => {
    console.log("📝 Form values changed:", {
      position,
      dateRange,
      isModalVisible,
    });
  }, [position, dateRange, isModalVisible]);

  return (
    <div style={{ padding: 24 }}>
      {contextHolder}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <div
              style={{
                marginBottom: 16,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h2 className="text-2xl font-semibold dark:text-white">
                Advertisement Management
              </h2>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
              >
                Create Advertisement
              </Button>
            </div>

            <Table
              columns={columns}
              dataSource={adsData?.content || []}
              loading={isLoading}
              rowKey="id"
              pagination={{
                current: page + 1,
                pageSize: size,
                total: adsData?.totalElements || 0,
                onChange: (newPage, newSize) => {
                  setPage(newPage - 1);
                  setSize(newSize || 10);
                },
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} items`,
              }}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title={editingAds ? "Edit Advertisement" : "Create Advertisement"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setConflictWarning("");
        }}
        onOk={() => {
          form
            .validateFields()
            .then((values) => {
              handleSubmit(values);
            })
            .catch((info) => {
              console.log("Validate Failed:", info);
              const firstErrorField = info.errorFields?.[0];
              if (firstErrorField) {
                messageApi.error(
                  `Please fill in required field: ${firstErrorField.name[0]}`
                );
              }
            });
        }}
        width={600}
        confirmLoading={
          createAdsMutation.isPending || updateAdsMutation.isPending
        }
      >
        <div
          style={{
            background: "#f0f9ff",
            border: "1px solid #0ea5e9",
            borderRadius: 4,
            padding: 12,
            marginBottom: 16,
            fontSize: 12,
          }}
        >
          <div style={{ fontWeight: "bold", marginBottom: 4 }}>
            📋 How Priority Works:
          </div>
          <div>
            • When multiple banners compete for the same position and time,{" "}
            <strong>higher priority wins</strong>
          </div>
          <div>• Priority 999 = displays first, Priority 0 = displays last</div>
          <div>• If priorities are equal, newer banners display first</div>
        </div>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            isActive: true,
            priority: 0,
            position: "LEFT",
          }}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[
              { required: true, message: "Title is required" },
              { min: 3, message: "Title must be at least 3 characters" },
              { max: 100, message: "Title must not exceed 100 characters" },
            ]}
          >
            <Input placeholder="Enter advertisement title" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[
              {
                max: 500,
                message: "Description must not exceed 500 characters",
              },
            ]}
          >
            <TextArea rows={3} placeholder="Enter advertisement description" />
          </Form.Item>

          <Form.Item
            name="linkUrl"
            label="Link URL"
            rules={[{ type: "url", message: "Please enter a valid URL" }]}
            tooltip="Optional: When users click on the banner, they will be redirected to this URL"
          >
            <Input placeholder="Enter target URL (optional)" />
          </Form.Item>

          <Form.Item
            name="position"
            label="Position"
            rules={[{ required: true, message: "Position is required" }]}
            tooltip="Choose where the banner will appear on the page. Multiple banners in the same position and time range will compete for display."
          >
            <Select
              placeholder="Select position"
              onChange={(value) => {
                // Check conflicts khi thay đổi position (nếu đã có dateRange)
                const currentDateRange = form.getFieldValue("dateRange");
                if (
                  value &&
                  currentDateRange &&
                  currentDateRange.length === 2
                ) {
                  console.log("✅ Position changed, checking conflicts...");
                  checkConflictsRealTime(value, currentDateRange);
                }
              }}
            >
              <Option value="LEFT">Left Sidebar</Option>
              <Option value="RIGHT">Right Sidebar</Option>
              {/* <Option value="TOP">Top Banner</Option>
              <Option value="BOTTOM">Bottom Banner</Option>
              <Option value="CENTER">Center</Option> */}
            </Select>
          </Form.Item>

          <Form.Item
            name="dateRange"
            label="Date Range"
            rules={[{ required: true, message: "Date range is required" }]}
          >
            <RangePicker
              style={{ width: "100%" }}
              showTime
              format="DD/MM/YYYY HH:mm"
              placeholder={["Start date", "End date"]}
              onOk={(dates) => {
                // Chỉ check conflicts khi user click OK trên date picker
                if (dates && dates.length === 2 && dates[0] && dates[1]) {
                  const currentPosition = form.getFieldValue("position");
                  if (currentPosition) {
                    console.log(
                      "✅ User finished selecting dates, checking conflicts..."
                    );
                    checkConflictsRealTime(
                      currentPosition,
                      dates as [Dayjs, Dayjs]
                    );
                  }
                }
              }}
              onChange={(dates) => {
                // Clear warning khi user đang thay đổi
                if (!dates || dates.length !== 2 || !dates[0] || !dates[1]) {
                  setConflictWarning("");
                }
              }}
            />
          </Form.Item>

          {/* Real-time conflict checking indicators */}
          {isCheckingConflicts && (
            <div
              style={{
                background: "#f0f9ff",
                border: "1px solid #91caff",
                borderRadius: 4,
                padding: 8,
                marginBottom: 16,
                fontSize: 12,
                textAlign: "center",
                color: "#1677ff",
              }}
            >
              🔍 Checking for conflicts...
            </div>
          )}

          {/* Real-time conflict warning */}
          {conflictWarning && (
            <div
              style={{
                background: "#fff7e6",
                border: "1px solid #ffa940",
                borderRadius: 4,
                padding: 12,
                marginBottom: 16,
                fontSize: 12,
              }}
            >
              <div
                style={{
                  fontWeight: "bold",
                  color: "#d48806",
                  marginBottom: 4,
                }}
              >
                ⚠️ Scheduling Conflict Detected
              </div>
              <div style={{ color: "#8c5803" }}>{conflictWarning}</div>
              <div style={{ color: "#8c5803", marginTop: 4 }}>
                � Tip: Consider adjusting the priority or time range to avoid
                conflicts.
              </div>
            </div>
          )}

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="priority"
                label="Priority"
                tooltip="Higher priority numbers display first when multiple banners compete for the same position and time. Range: 0-999 (999 = highest priority)"
                rules={[
                  {
                    type: "number",
                    min: 0,
                    max: 999,
                    message: "Priority must be between 0-999",
                  },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="0 = lowest, 999 = highest"
                  min={0}
                  max={999}
                  addonAfter="priority"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="isActive" label="Active" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Image"
            required={!editingAds}
            tooltip="Upload an image for the banner. If you also provide a Link URL, clicking the image will redirect to that URL."
            rules={[
              {
                validator: () => {
                  if (!editingAds && fileList.length === 0) {
                    return Promise.reject(new Error("Image is required"));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>
                {editingAds ? "Change Image" : "Upload Image"}
              </Button>
            </Upload>
            {fileList.length > 0 && (
              <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
                💡 Tip: The uploaded image will be displayed as a clickable
                banner
                {form.getFieldValue("linkUrl")
                  ? " that redirects to your specified URL"
                  : ""}
                .
              </div>
            )}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
