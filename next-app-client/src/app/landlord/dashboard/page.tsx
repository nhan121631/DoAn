/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { landlordFetchBookings } from "@/services/BookingService";
import { listenForUnreadCount } from "@/services/ChatService";
import { ContractService } from "@/services/ContractService";
import { LandlordTaskService } from "@/services/LandlordTaskService";
import { getRequestsByLandlordId } from "@/services/Requirements";
import {
  LandlordTaskCreateDto,
  LandlordTaskResponseDto,
  LandlordTaskUpdateDto,
} from "@/types/types";
import {
  ArrowRightOutlined,
  BellOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  DollarOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  FileTextOutlined,
  FlagOutlined,
  HomeOutlined,
  MessageOutlined,
  MoreOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Drawer,
  Dropdown,
  Empty,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Progress,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import dayjs from "dayjs";
import "dayjs/locale/en";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// Priority and Status configurations
const priorityConfig = {
  LOW: { color: "blue", label: "Low" },
  MEDIUM: { color: "orange", label: "Medium" },
  HIGH: { color: "red", label: "High" },
};

const statusConfig = {
  PENDING: {
    color: "default",
    label: "Đang chờ",
    icon: <ClockCircleOutlined />,
  },
  IN_PROGRESS: {
    color: "processing",
    label: "Đang tiến hành",
    icon: <PlayCircleOutlined />,
  },
  COMPLETED: {
    color: "success",
    label: "Hoàn thành",
    icon: <CheckCircleOutlined />,
  },
  CANCELLED: {
    color: "error",
    label: "Đã hủy",
    icon: <ExclamationCircleOutlined />,
  },
};

interface TaskStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
}

interface NotificationStats {
  newBookings: number;
  newRequirements: number;
  confirmingBills: number;
  newMessages: number;
}

export default function LandlordDashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [tasks, setTasks] = useState<LandlordTaskResponseDto[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<LandlordTaskResponseDto[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [taskStats, setTaskStats] = useState<TaskStats>({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
  });
  const [notificationStats, setNotificationStats] = useState<NotificationStats>(
    {
      newBookings: 0,
      newRequirements: 0,
      confirmingBills: 0,
      newMessages: 0,
    }
  );
  const [loadingStats, setLoadingStats] = useState(false);
  const [persistentMessageCount, setPersistentMessageCount] = useState(0);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [selectedTask, setSelectedTask] =
    useState<LandlordTaskResponseDto | null>(null);
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Filter states
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");

  // Forms
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  // Fetch tasks
  const fetchTasks = async () => {
    if (!session?.user?.id) return;

    setLoading(true);
    try {
      const fetchedTasks = await LandlordTaskService.getTasksByLandlord(
        session.user.id
      );
      setTasks(fetchedTasks);
      console.log("Fetched tasks:", fetchedTasks);
      setFilteredTasks(fetchedTasks);
      calculateStats(fetchedTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      messageApi.error("Không thể tải nhiệm vụ");
    } finally {
      setLoading(false);
    }
  };

  // Fetch notification statistics
  const fetchNotificationStats = async () => {
    if (!session?.user?.id) return;

    setLoadingStats(true);
    try {
      let newBookings = 0;
      let newRequirements = 0;
      let confirmingBills = 0;

      // Fetch bookings with status = 0 (pending bookings)
      try {
        const bookingsResponse = await landlordFetchBookings(0, 100);

        // Handle different response structures (bookings array could be in bookings or data property)
        const bookingsArray =
          bookingsResponse.bookings ||
          bookingsResponse.data ||
          bookingsResponse;

        // Filter only bookings with status = 0 (pending bookings showing Accept/Reject buttons)
        const pendingBookings =
          bookingsArray?.filter((booking: any) => {
            return booking.status === 0;
          }) || [];

        newBookings = pendingBookings.length;
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }

      // Fetch requirements with pending status
      try {
        const requirementsResponse = await getRequestsByLandlordId(0, 100);
        newRequirements =
          requirementsResponse.data?.filter((req: any) => {
            return (
              req.status === "PENDING" ||
              req.status === 0 ||
              req.status === false
            );
          })?.length || 0;
      } catch (error) {
        console.error("Error fetching requirements:", error);
      }

      // Fetch confirming bills from contracts
      try {
        const contractsResponse = await ContractService.getByLandlord(
          session.user.id,
          0,
          1000
        );

        let totalConfirmingBills = 0;

        // Only use contract.bills data, no API calls to avoid 500 errors
        for (const contract of contractsResponse.content || []) {
          try {
            if (
              contract.bills &&
              Array.isArray(contract.bills) &&
              contract.bills.length > 0
            ) {
              const confirmingBillsForContract = contract.bills.filter(
                (bill: any) => {
                  return bill.status === "CONFIRMING";
                }
              ).length;
              totalConfirmingBills += confirmingBillsForContract;
            } else {
              console.log(`Hợp đồng ${contract.id}: Không có dữ liệu hóa đơn`);
            }
          } catch (error) {
            console.error(`Lỗi khi xử lý hợp đồng ${contract.id}:`, error);
            // Continue to next contract
          }
        }

        confirmingBills = totalConfirmingBills;
      } catch (error) {
        console.error("Lỗi khi tải hóa đơn đang chờ xác nhận:", error);
        // Set default value if everything fails
        confirmingBills = 0;
      }

      setNotificationStats({
        newBookings,
        newRequirements,
        confirmingBills,
        newMessages: 0, // Will be updated by chat listener
      });
    } catch (error) {
      console.error("Error fetching notification stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  // Calculate statistics
  const calculateStats = (taskList: LandlordTaskResponseDto[]) => {
    const now = dayjs();
    const stats = {
      total: taskList.length,
      pending: taskList.filter((t) => t.status === "PENDING").length,
      inProgress: taskList.filter((t) => t.status === "IN_PROGRESS").length,
      completed: taskList.filter((t) => t.status === "COMPLETED").length,
      overdue: taskList.filter(
        (t) =>
          t.dueDate &&
          dayjs(t.dueDate).isBefore(now) &&
          t.status !== "COMPLETED" &&
          t.status !== "CANCELLED"
      ).length,
    };
    setTaskStats(stats);
  };

  // Filter tasks
  const applyFilters = () => {
    let filtered = tasks;

    // Handle status filtering
    if (!statusFilter || statusFilter === "") {
      // By default, hide completed tasks
      filtered = filtered.filter((task) => task.status !== "COMPLETED");
    } else if (statusFilter === "ALL") {
      // Show all tasks including completed ones
      // No filtering needed, keep all tasks
    } else {
      // Filter by specific status
      filtered = filtered.filter((task) => task.status === statusFilter);
    }

    if (searchText) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchText.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (priorityFilter) {
      filtered = filtered.filter((task) => task.priority === priorityFilter);
    }

    setFilteredTasks(filtered);
  };

  // Handle task creation
  const handleCreateTask = async (values: LandlordTaskCreateDto) => {
    setIsSubmittingCreate(true);
    try {
      // Validate form fields first
      await createForm.validateFields();
    } catch (error) {
      // If validation fails, don't proceed
      setIsSubmittingCreate(false);
      return;
    }

    try {
      // Validate required fields
      if (!values.title?.trim()) {
        messageApi.error("Tiêu đề nhiệm vụ là bắt buộc");
        setIsSubmittingCreate(false);
        return;
      }

      if (!session?.user?.id) {
        messageApi.error("Không tìm thấy phiên người dùng");
        setIsSubmittingCreate(false);
        return;
      }

      // Additional validation for dates
      if (values.startDate && dayjs(values.startDate).isBefore(dayjs())) {
        messageApi.error("Ngày bắt đầu phải là tương lai");
        setIsSubmittingCreate(false);
        return;
      }

      if (values.dueDate && dayjs(values.dueDate).isBefore(dayjs())) {
        messageApi.error("Ngày kết thúc phải là tương lai");
        setIsSubmittingCreate(false);
        return;
      }

      if (
        values.startDate &&
        values.dueDate &&
        dayjs(values.dueDate).isBefore(dayjs(values.startDate))
      ) {
        messageApi.error("Ngày kết thúc phải sau hoặc bằng ngày bắt đầu");
        setIsSubmittingCreate(false);
        return;
      }

      // Format the task data to match API expectations
      const taskData = {
        title: values.title.trim(),
        description: values.description?.trim() || undefined,
        startDate: values.startDate
          ? dayjs(values.startDate).format("YYYY-MM-DDTHH:mm:ss")
          : undefined,
        dueDate: values.dueDate
          ? dayjs(values.dueDate).format("YYYY-MM-DDTHH:mm:ss")
          : undefined,
        status: "PENDING" as const, // Always start with PENDING status
        priority: values.priority || ("MEDIUM" as const), // Default to MEDIUM if not specified
        landlordId: session.user.id, // Add landlordId from session
        roomId: values.roomId || undefined, // Optional roomId
      };

      console.log("Creating task with formatted data:", taskData);

      await LandlordTaskService.createTask(taskData);
      messageApi.success("Tạo nhiệm vụ thành công!");
      setIsCreateModalOpen(false);
      createForm.resetFields();
      fetchTasks();
    } catch (error) {
      console.error("Error creating task:", error);
      let errorMessage = "Không thể tạo nhiệm vụ";
      if (error instanceof Error) {
        errorMessage = error.message;
        // Try to extract more specific error from API response
        if (error.message.includes("400")) {
          errorMessage =
            "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại và thử lại.";
        } else if (error.message.includes("500")) {
          errorMessage = "Lỗi máy chủ xảy ra. Vui lòng thử lại sau.";
        }
      }
      messageApi.error(errorMessage);
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  // Handle task update
  const handleUpdateTask = async (values: LandlordTaskUpdateDto) => {
    if (!selectedTask) {
      messageApi.error("Không có nhiệm vụ nào được chọn để cập nhật");
      return;
    }

    // Validate form first to prevent submission if there are errors
    try {
      await editForm.validateFields();
    } catch (errorInfo) {
      console.log("Xác thực không thành công:", errorInfo);
      return; // Don't proceed if validation fails
    }

    setIsSubmittingEdit(true);
    try {
      // Validate required fields
      if (!values.title?.trim()) {
        messageApi.error("Tiêu đề nhiệm vụ là bắt buộc");
        setIsSubmittingEdit(false);
        return;
      }

      // Additional validation for dates
      if (values.startDate && dayjs(values.startDate).isBefore(dayjs())) {
        messageApi.error("Ngày bắt đầu phải là tương lai");
        setIsSubmittingEdit(false);
        return;
      }

      if (values.dueDate && dayjs(values.dueDate).isBefore(dayjs())) {
        messageApi.error("Ngày kết thúc phải là tương lai");
        setIsSubmittingEdit(false);
        return;
      }

      if (
        values.startDate &&
        values.dueDate &&
        dayjs(values.dueDate).isBefore(dayjs(values.startDate))
      ) {
        messageApi.error("Ngày kết thúc phải sau hoặc bằng ngày bắt đầu");
        setIsSubmittingEdit(false);
        return;
      }

      // Format the update data properly

      const updateData = {
        ...values,
        title: values.title.trim(),
        description: values.description?.trim() || undefined,
        startDate: values.startDate
          ? dayjs(values.startDate).format("YYYY-MM-DDTHH:mm:ss")
          : undefined,
        dueDate: values.dueDate
          ? dayjs(values.dueDate).format("YYYY-MM-DDTHH:mm:ss")
          : undefined,
      };

      console.log("Updating task with formatted data:", updateData);
      console.log("Selected task ID:", selectedTask.id);

      await LandlordTaskService.updateTask(selectedTask.id, updateData);
      messageApi.success("Cập nhật nhiệm vụ thành công!");
      setIsEditModalOpen(false);
      setSelectedTask(null);
      editForm.resetFields();
      fetchTasks();
    } catch (error) {
      console.error("Error updating task:", error);
      let errorMessage = "Không thể cập nhật nhiệm vụ";
      if (error instanceof Error) {
        errorMessage = error.message;
        // Try to extract more specific error from API response
        if (error.message.includes("400")) {
          errorMessage =
            "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại và thử lại.";
        } else if (error.message.includes("500")) {
          errorMessage = "Lỗi máy chủ xảy ra. Vui lòng thử lại sau.";
        } else if (error.message.includes("404")) {
          errorMessage = "Nhiệm vụ không tìm thấy. Có thể đã bị xóa.";
        }
      }
      messageApi.error(errorMessage);
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Handle task deletion
  const handleDeleteTask = async (taskId: string) => {
    try {
      await LandlordTaskService.deleteTask(taskId);
      messageApi.success("Xóa nhiệm vụ thành công!");
      fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
      messageApi.error("Không thể xóa nhiệm vụ");
    }
  };

  // Handle status change
  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await LandlordTaskService.updateTask(taskId, {
        status: newStatus as any,
      });
      messageApi.success("Cập nhật trạng thái nhiệm vụ thành công!");
      fetchTasks();
    } catch (error) {
      console.error("Error updating status:", error);
      messageApi.error("Không thể cập nhật trạng thái nhiệm vụ");
    }
  };

  // Open detail drawer
  const openDetailDrawer = (task: LandlordTaskResponseDto) => {
    setSelectedTask(task);
    setIsDetailDrawerOpen(true);
  };

  // Open edit modal
  const openEditModal = (task: LandlordTaskResponseDto) => {
    console.log("Mở modal chỉnh sửa cho nhiệm vụ:", task);

    if (!task || !task.id) {
      messageApi.error("Dữ liệu nhiệm vụ không hợp lệ");
      return;
    }

    setSelectedTask(task);

    // Safely set form values with fallbacks
    const formValues = {
      title: task.title || "",
      description: task.description || "",
      priority: task.priority || "MEDIUM",
      status: task.status || "PENDING",
      startDate: task.startDate ? dayjs(task.startDate) : null,
      dueDate: task.dueDate ? dayjs(task.dueDate) : null,
    };

    console.log("Đang thiết lập giá trị biểu mẫu:", formValues);
    editForm.setFieldsValue(formValues);
    setIsEditModalOpen(true);
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchTasks();
      fetchNotificationStats();

      // Set up interval to refresh notifications every 30 seconds
      const interval = setInterval(() => {
        fetchNotificationStats();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [session]);

  useEffect(() => {
    applyFilters();
  }, [searchText, statusFilter, priorityFilter, tasks]);

  // Listen for unread message count
  useEffect(() => {
    if (!session?.user?.id) return;

    console.log("Dashboard: Bắt đầu lắng nghe tin nhắn chưa đọc");

    const unsubscribe = listenForUnreadCount(
      session.user.id,
      (totalUnreadMessages) => {
        console.log(
          "Dashboard: Đã nhận được số lượng tin nhắn chưa đọc:",
          totalUnreadMessages
        );

        // Update count based on actual unread messages
        setPersistentMessageCount(totalUnreadMessages);

        // Update notification stats with the current count
        setNotificationStats((prev) => ({
          ...prev,
          newMessages: totalUnreadMessages,
        }));
      }
    );

    return () => {
      console.log("Dashboard: Đang dọn dẹp trình nghe tin nhắn chưa đọc");
      unsubscribe();
    };
  }, [session?.user?.id]);

  // Function to manually reset message count when user visits chat
  // No longer needed as count will be automatically synced with actual unread messages
  const resetMessageCount = () => {
    // Count will be automatically updated by the chat listener
    console.log("Điều hướng đến chat - số lượng sẽ được cập nhật tự động");
  };

  // Table columns
  const columns = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      width: 250,
      render: (title: string, record: LandlordTaskResponseDto) => (
        <div>
          <div className="font-semibold text-gray-900 dark:text-white">
            {title}
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            {record.contract && (
              <Tag className="text-xs" color="blue">
                Hợp đồng: {record.contract.contractName}
              </Tag>
            )}
            {record.room && (
              <Tag className="text-xs" color="green">
                Phòng: {record.room.title}
              </Tag>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      width: 300,
      render: (description: string) =>
        description ? (
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {description.length > 80
              ? `${description.substring(0, 80)}...`
              : description}
          </div>
        ) : (
          <Text type="secondary" className="text-xs">
            Không có mô tả
          </Text>
        ),
    },
    {
      title: "Ưu tiên",
      dataIndex: "priority",
      key: "priority",
      render: (priority: string) => (
        <Tag
          color={priorityConfig[priority as keyof typeof priorityConfig]?.color}
          icon={<FlagOutlined />}
        >
          {priorityConfig[priority as keyof typeof priorityConfig]?.label}
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const config = statusConfig[status as keyof typeof statusConfig];
        return (
          <Tag color={config?.color} icon={config?.icon}>
            {config?.label}
          </Tag>
        );
      },
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "startDate",
      key: "startDate",
      render: (startDate: string) => {
        if (!startDate)
          return <Text type="secondary">Không có ngày bắt đầu</Text>;
        const date = dayjs(startDate);
        return (
          <div>
            <CalendarOutlined className="mr-1" />
            {date.format("MMM DD, YYYY HH:mm")}
          </div>
        );
      },
    },
    {
      title: "Ngày đến hạn",
      dataIndex: "dueDate",
      key: "dueDate",
      render: (dueDate: string) => {
        if (!dueDate)
          return <Text type="secondary">Không có ngày đến hạn</Text>;
        const date = dayjs(dueDate);
        const now = dayjs();
        const isOverdue = date.isBefore(now) && dueDate;

        return (
          <div className={isOverdue ? "text-red-500" : ""}>
            <CalendarOutlined className="mr-1" />
            {date.format("MMM DD, YYYY HH:mm")}
            {isOverdue && (
              <Text type="danger" className="ml-2">
                (Quá hạn)
              </Text>
            )}
          </div>
        );
      },
    },
    {
      title: "Hành động",
      key: "actions",
      render: (record: LandlordTaskResponseDto) => {
        const statusMenuItems = Object.entries(statusConfig)
          .filter(([key]) => key !== record.status)
          .map(([key, config]) => ({
            key,
            label: (
              <span>
                {config.icon} {config.label}
              </span>
            ),
            onClick: () => handleStatusChange(record.id, key),
          }));

        return (
          <Space>
            <Tooltip title="Xem chi tiết">
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined />}
                onClick={() =>
                  record.type == "REQUEST"
                    ? router.push(`/landlord/manage-requests`)
                    : record.type == "BILL"
                    ? router.push(`/landlord/manage-contracts`)
                    : record.type == "BOOKING"
                    ? router.push(`/landlord/rentals`)
                    : record.type == "MAINTENANCE"
                    ? router.push(`/landlord/manage-maintain`)
                    : record.type == "TEMPORARY_RESIDENCE"
                    ? router.push(`/landlord/manage-residents`)
                    : openDetailDrawer(record)
                }
              />
            </Tooltip>

            <Tooltip title="Chỉnh sửa nhiệm vụ">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => openEditModal(record)}
              />
            </Tooltip>

            <Dropdown
              menu={{
                items: [
                  {
                    key: "status",
                    label: "Thay đổi trạng thái",
                    children: statusMenuItems,
                  },
                  {
                    type: "divider",
                  },
                  {
                    key: "delete",
                    label: (
                      <Popconfirm
                        title="Xóa nhiệm vụ"
                        description="Bạn có chắc chắn muốn xóa nhiệm vụ này không?"
                        onConfirm={() => handleDeleteTask(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okType="danger"
                        placement="topRight"
                      >
                        <span className="text-red-500 hover:text-red-700">
                          <DeleteOutlined className="mr-2" />
                          Xóa nhiệm vụ
                        </span>
                      </Popconfirm>
                    ),
                  },
                ],
              }}
              trigger={["click"]}
            >
              <Button type="text" size="small" icon={<MoreOutlined />} />
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  const completionRate =
    taskStats.total > 0 ? (taskStats.completed / taskStats.total) * 100 : 0;
  console.log("Task Stats:", taskStats);
  console.log("Completion Rate:", completionRate);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:bg-gradient-to-br dark:from-[#001529] dark:to-[#002140] p-6">
      {contextHolder}

      {/* Header */}
      <div className="mb-8 text-center">
        <Title
          level={1}
          className="!text-gray-900 dark:!text-white !mb-4 !text-4xl"
        >
          Bảng điều khiển chủ nhà
        </Title>
        <Text className="text-xl text-gray-600 dark:text-gray-300 font-medium">
          Quản lý tài sản, đặt phòng và yêu cầu của người thuê một cách hiệu quả
        </Text>
        <div className="mt-4 h-1 w-24 bg-gradient-to-r from-blue-500 to-green-500 mx-auto rounded-full"></div>

        <div className="mt-4 flex items-center justify-center gap-4">
          {loadingStats && (
            <div>
              <Spin size="small" />
              <Text className="ml-2 text-gray-500 dark:text-gray-400">
                Đang tải thông báo...
              </Text>
            </div>
          )}
          <Button
            icon={<BellOutlined />}
            onClick={() => {
              fetchNotificationStats();
              fetchTasks();
            }}
            disabled={loadingStats}
            className="text-gray-600 dark:text-gray-300"
          >
            Làm mới thông báo
          </Button>
        </div>
      </div>

      {/* Management & Notifications Section */}
      <Row gutter={[24, 24]} className="mb-8">
        <Col span={24}>
          <Card className="shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between mb-6">
              <Title
                level={4}
                className="!text-gray-900 dark:!text-white !mb-0 flex items-center"
              >
                Trung tâm Quản lý
              </Title>
              <Text className="text-gray-500 dark:text-gray-400 text-sm">
                {dayjs().format("dddd, MMMM DD, YYYY")}
              </Text>
            </div>

            <Row gutter={[20, 20]}>
              <Col xs={24} sm={12} lg={6}>
                <div
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 border-l-4 border-l-blue-500"
                  onClick={() => router.push("/landlord/rentals")}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                      <HomeOutlined className="text-2xl text-blue-600 dark:text-blue-400" />
                    </div>
                    {notificationStats.newBookings > 0 && (
                      <div className="bg-red-500 text-white text-xs rounded-full px-2 py-1 font-bold">
                        {notificationStats.newBookings > 99
                          ? "99+"
                          : notificationStats.newBookings}
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Quản lý cho thuê
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    {notificationStats.newBookings > 0
                      ? `${notificationStats.newBookings} pending bookings`
                      : "No pending bookings"}
                  </p>
                  <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium">
                    Quản lý đặt phòng <ArrowRightOutlined className="ml-2" />
                  </div>
                </div>
              </Col>

              <Col xs={24} sm={12} lg={6}>
                <div
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 border-l-4 border-l-orange-500"
                  onClick={() => router.push("/landlord/manage-requests")}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full">
                      <FileTextOutlined className="text-2xl text-orange-600 dark:text-orange-400" />
                    </div>
                    {notificationStats.newRequirements > 0 && (
                      <div className="bg-red-500 text-white text-xs rounded-full px-2 py-1 font-bold">
                        {notificationStats.newRequirements > 99
                          ? "99+"
                          : notificationStats.newRequirements}
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Quản lý yêu cầu
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    {notificationStats.newRequirements > 0
                      ? `${notificationStats.newRequirements} pending requirements`
                      : "No pending requirements"}
                  </p>
                  <div className="flex items-center text-orange-600 dark:text-orange-400 text-sm font-medium">
                    Xem Yêu cầu <ArrowRightOutlined className="ml-2" />
                  </div>
                </div>
              </Col>

              <Col xs={24} sm={12} lg={6}>
                <div
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 border-l-4 border-l-green-500"
                  onClick={() => router.push("/landlord/manage-contracts")}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                      <DollarOutlined className="text-2xl text-green-600 dark:text-green-400" />
                    </div>
                    {notificationStats.confirmingBills > 0 && (
                      <div className="bg-red-500 text-white text-xs rounded-full px-2 py-1 font-bold">
                        {notificationStats.confirmingBills > 99
                          ? "99+"
                          : notificationStats.confirmingBills}
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Xác nhận thanh toán
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    {notificationStats.confirmingBills > 0
                      ? `${notificationStats.confirmingBills} bills awaiting confirmation`
                      : "No bills awaiting confirmation"}
                  </p>
                  <div className="flex items-center text-green-600 dark:text-green-400 text-sm font-medium">
                    Xác nhận thanh toán <ArrowRightOutlined className="ml-2" />
                  </div>
                </div>
              </Col>

              <Col xs={24} sm={12} lg={6}>
                <div
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 border-l-4 border-l-purple-500"
                  onClick={() => {
                    resetMessageCount();
                    router.push("/landlord/manage-chat");
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full">
                      <MessageOutlined className="text-2xl text-purple-600 dark:text-purple-400" />
                    </div>
                    {persistentMessageCount > 0 && (
                      <div className="bg-red-500 text-white text-xs rounded-full px-2 py-1 font-bold">
                        {persistentMessageCount > 99
                          ? "99+"
                          : persistentMessageCount}
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Tin nhắn
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    {persistentMessageCount > 0
                      ? `${persistentMessageCount} unread messages`
                      : "No new messages"}
                  </p>
                  <div className="flex items-center text-purple-600 dark:text-purple-400 text-sm font-medium">
                    Mở Trò chuyện <ArrowRightOutlined className="ml-2" />
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Task Statistics Cards */}
      <Row gutter={[24, 24]} className="mb-8">
        <Col span={24}>
          <Card className="shadow-lg bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border-l-4 border-l-indigo-500">
            <Title level={4} className="!text-gray-900 dark:!text-white !mb-6">
              Tổng quan về công việc
            </Title>
            <Row gutter={[20, 20]}>
              <Col xs={24} sm={12} lg={6}>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-600">
                  <ClockCircleOutlined className="text-3xl text-blue-600 dark:text-blue-400 mb-2" />
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                    {taskStats.total}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Tổng số công việc
                  </div>
                </div>
              </Col>

              <Col xs={24} sm={12} lg={6}>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-600">
                  <ClockCircleOutlined className="text-3xl text-orange-600 dark:text-orange-400 mb-2" />
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                    {taskStats.pending}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Đang chờ xử lý
                  </div>
                </div>
              </Col>

              <Col xs={24} sm={12} lg={6}>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-600">
                  <CheckCircleOutlined className="text-3xl text-green-600 dark:text-green-400 mb-2" />
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                    {taskStats.completed}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Đã hoàn thành
                  </div>
                </div>
              </Col>

              <Col xs={24} sm={12} lg={6}>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-600">
                  <ExclamationCircleOutlined className="text-3xl text-red-600 dark:text-red-400 mb-2" />
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400 mb-1">
                    {taskStats.overdue}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Quá hạn
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Progress Card */}
      <Row gutter={[24, 24]} className="mb-8">
        <Col span={24}>
          <Card className="shadow-lg bg-white dark:bg-[#22304a] border border-gray-200 dark:border-gray-600 min-h-[200px]">
            <Title level={4} className="!text-gray-900 dark:!text-white !mb-6">
              Tiến độ hoàn thành công việc
            </Title>
            <Progress
              percent={Math.round(completionRate)}
              strokeColor={{
                "0%": "#1890ff",
                "100%": "#52c41a",
              }}
              trailColor="#f0f0f0"
              size={{ height: 16 }}
              format={(percent) => (
                <span className="text-gray-900 dark:text-white font-bold">
                  {percent}% Hoàn thành
                </span>
              )}
              className="mb-4"
            />

            {/* Debug info */}
            <div className="text-xs text-gray-500 mb-2">
              Tiến độ: {taskStats.completed} đã hoàn thành trong tổng số{" "}
              {taskStats.total} công việc
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {taskStats.completed}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Đã hoàn thành
                </div>
              </div>
              <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {taskStats.total - taskStats.completed}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Còn lại
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Task Management */}
      <Card
        className="shadow-lg bg-white dark:bg-[#22304a] border border-gray-200 dark:border-gray-600"
        title={
          <div className="flex items-center justify-between py-2">
            <Title
              level={3}
              className="!mb-0 !text-gray-900 dark:!text-white flex items-center"
            >
              Quản lý công việc
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                (Các công việc đã hoàn thành mặc định bị ẩn)
              </span>
            </Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsCreateModalOpen(true)}
              size="large"
              className="shadow-md"
            >
              Tạo công việc mới
            </Button>
          </div>
        }
      >
        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4 justify-end">
          <Input
            placeholder="Tìm kiếm công việc..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
            allowClear
          />

          <Select
            placeholder="Chỉ công việc đang hoạt động"
            value={statusFilter || undefined}
            onChange={(value) => setStatusFilter(value || "")}
            style={{ width: 200 }}
            allowClear
            className="bg-white"
          >
            <Option key="ALL" value="ALL">
              <span className="flex items-center gap-2">
                <span className="text-gray-900">Tất cả công việc</span>
              </span>
            </Option>
            {Object.entries(statusConfig).map(([key, config]) => (
              <Option key={key} value={key}>
                <span className="flex items-center gap-2">
                  {config.icon}
                  <span className="text-gray-900">{config.label}</span>
                </span>
              </Option>
            ))}
          </Select>

          <Select
            placeholder="Tất cả mức độ ưu tiên"
            value={priorityFilter || undefined}
            onChange={(value) => setPriorityFilter(value || "")}
            style={{ width: 180 }}
            allowClear
            className="bg-white"
          >
            {Object.entries(priorityConfig).map(([key, config]) => (
              <Option key={key} value={key}>
                <span className="flex items-center gap-2">
                  <FlagOutlined />
                  <span className="text-gray-900">{config.label}</span>
                </span>
              </Option>
            ))}
          </Select>
        </div>

        {/* Task Table */}
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={filteredTasks}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} trong tổng số ${total} công việc`,
            }}
            locale={{
              emptyText: (
                <Empty
                  description="Không tìm thấy công việc"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ),
            }}
          />
        </Spin>
      </Card>

      {/* Create Task Modal */}
      <Modal
        title="Tạo công việc mới"
        open={isCreateModalOpen}
        onCancel={() => {
          setIsCreateModalOpen(false);
          createForm.resetFields();
          setIsSubmittingCreate(false);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateTask}
          className="mt-4"
          validateTrigger={["onBlur", "onChange"]}
        >
          <Form.Item
            name="title"
            label="Tiêu đề công việc"
            rules={[
              { required: true, message: "Tiêu đề công việc là bắt buộc" },
              {
                min: 3,
                message: "Tiêu đề công việc phải có ít nhất 3 ký tự",
              },
              { max: 100, message: "Tiêu đề công việc không được vượt quá 100 ký tự" },
              {
                whitespace: true,
                message: "Tiêu đề công việc không được để trống",
              },
            ]}
          >
            <Input
              placeholder="Nhập tiêu đề công việc (3-100 ký tự)"
              showCount
              maxLength={100}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[
              { max: 500, message: "Mô tả không được vượt quá 500 ký tự" },
            ]}
          >
            <TextArea
              rows={3}
              placeholder="Nhập mô tả công việc (tùy chọn, tối đa 500 ký tự)"
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="startDate"
                label="Ngày bắt đầu"
                rules={[
                  {
                    validator: (_, value) => {
                      if (value && dayjs(value).isBefore(dayjs())) {
                        return Promise.reject(
                          new Error("Ngày bắt đầu phải là thời gian trong tương lai")
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  placeholder="Chọn ngày bắt đầu (tùy chọn)"
                  showTime={{
                    format: "HH:mm",
                    defaultValue: dayjs().hour(18).minute(0), // Default 18:00
                  }}
                  format="YYYY-MM-DD HH:mm"
                  disabledDate={(current) =>
                    current && current < dayjs().startOf("day")
                  }
                  onChange={() => {
                    // Trigger validation for due date when start date changes
                    createForm.validateFields(["dueDate"]);
                  }}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="dueDate"
                label="Ngày kết thúc"
                rules={[
                  {
                    validator: (_, value) => {
                      if (value && dayjs(value).isBefore(dayjs())) {
                        return Promise.reject(
                          new Error("Ngày kết thúc phải là thời gian trong tương lai")
                        );
                      }
                      const startDate = createForm.getFieldValue("startDate");
                      if (
                        value &&
                        startDate &&
                        dayjs(value).isBefore(dayjs(startDate))
                      ) {
                        return Promise.reject(
                          new Error(
                            "Ngày kết thúc phải sau hoặc bằng ngày bắt đầu"
                          )
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  placeholder="Chọn ngày kết thúc (tùy chọn)"
                  showTime={{
                    format: "HH:mm",
                    defaultValue: dayjs().hour(18).minute(0), // Default 18:00
                  }}
                  format="YYYY-MM-DD HH:mm"
                  disabledDate={(current) => {
                    if (current && current < dayjs().startOf("day")) {
                      return true;
                    }
                    return false;
                  }}
                  onChange={() => {
                    // Trigger validation when due date changes
                    createForm.validateFields(["dueDate"]);
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="priority"
                label="Mức độ ưu tiên"
                initialValue="MEDIUM"
                rules={[
                  { required: true, message: "Vui lòng chọn mức độ ưu tiên" },
                ]}
              >
                <Select placeholder="Chọn mức độ ưu tiên">
                  {Object.entries(priorityConfig).map(([key, config]) => (
                    <Option key={key} value={key}>
                      <span className="flex items-center gap-2">
                        <FlagOutlined />
                        <span className="text-gray-900">{config.label}</span>
                      </span>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={isSubmittingCreate}
                disabled={isSubmittingCreate}
              >
                {isSubmittingCreate ? "Đang tạo..." : "Tạo công việc"}
              </Button>
              <Button
                onClick={() => setIsCreateModalOpen(false)}
                disabled={isSubmittingCreate}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Task Modal */}
      <Modal
        title="Chỉnh sửa công việc"
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          setSelectedTask(null);
          editForm.resetFields();
          setIsSubmittingEdit(false);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleUpdateTask}
          className="mt-4"
          validateTrigger={["onBlur", "onChange"]}
        >
          <Form.Item
            name="title"
            label="Tiêu đề công việc"
            rules={[
              { required: true, message: "Tiêu đề công việc là bắt buộc" },
              {
                min: 3,
                message: "Tiêu đề công việc phải có ít nhất 3 ký tự",
              },
              { max: 100, message: "Tiêu đề công việc không được vượt quá 100 ký tự" },
              {
                whitespace: true,
                message: "Tiêu đề công việc không được để trống",
              },
            ]}
          >
            <Input
              placeholder="Nhập tiêu đề công việc (3-100 ký tự)"
              showCount
              maxLength={100}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[
              { max: 500, message: "Mô tả không được vượt quá 500 ký tự" },
            ]}
          >
            <TextArea
              rows={3}
              placeholder="Nhập mô tả công việc (tùy chọn, tối đa 500 ký tự)"
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="startDate"
                label="Ngày bắt đầu"
                validateTrigger={["onChange", "onBlur"]}
                rules={[
                  {
                    validator: (_, value) => {
                      if (value && dayjs(value).isBefore(dayjs())) {
                        return Promise.reject(
                          new Error("Ngày bắt đầu và thời gian phải là tương lai")
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  placeholder="Chọn ngày bắt đầu (tùy chọn)"
                  showTime={{ format: "HH:mm" }}
                  format="YYYY-MM-DD HH:mm"
                  onChange={(value) => {
                    // Trigger validation immediately when value changes
                    setTimeout(() => {
                      createForm.validateFields(["startDate", "dueDate"]);
                    }, 0);
                  }}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="dueDate"
                label="Ngày kết thúc"
                rules={[
                  {
                    validator: (_, value) => {
                      if (value && dayjs(value).isBefore(dayjs())) {
                        return Promise.reject(
                          new Error("Ngày kết thúc và thời gian phải là tương lai")
                        );
                      }
                      // Validate due date is after start date
                      const startDate = editForm.getFieldValue("startDate");
                      if (
                        startDate &&
                        value &&
                        dayjs(value).isBefore(dayjs(startDate))
                      ) {
                        return Promise.reject(
                          new Error(
                            "Ngày kết thúc phải sau hoặc bằng ngày bắt đầu"
                          )
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  placeholder="Chọn ngày kết thúc (tùy chọn)"
                  showTime={{ format: "HH:mm" }}
                  format="YYYY-MM-DD HH:mm"
                  onChange={() => {
                    // Trigger validation when due date changes
                    editForm.validateFields(["dueDate"]);
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="priority"
                label="Mức độ ưu tiên"
                rules={[
                  { required: true, message: "Vui lòng chọn mức độ ưu tiên" },
                ]}
              >
                <Select placeholder="Chọn mức độ ưu tiên">
                  {Object.entries(priorityConfig).map(([key, config]) => (
                    <Option key={key} value={key}>
                      <Tag color={config.color}>{config.label}</Tag>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
              >
                <Select placeholder="Chọn trạng thái">
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <Option key={key} value={key}>
                      <Tag color={config.color}>{config.label}</Tag>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={isSubmittingEdit}
                disabled={isSubmittingEdit}
              >
                {isSubmittingEdit ? "Đang cập nhật..." : "Cập nhật công việc"}
              </Button>
              <Button
                onClick={() => setIsEditModalOpen(false)}
                disabled={isSubmittingEdit}
              >
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      {/* Task Detail Drawer - Asana Style */}
      <Drawer
        title={
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">Chi tiết công việc</span>
            {selectedTask && (
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => {
                  setIsDetailDrawerOpen(false);
                  openEditModal(selectedTask);
                }}
              >
                Chỉnh sửa
              </Button>
            )}
          </div>
        }
        open={isDetailDrawerOpen}
        onClose={() => {
          setIsDetailDrawerOpen(false);
          setSelectedTask(null);
        }}
        width={480}
        placement="right"
        styles={{
          body: { padding: 0 },
        }}
      >
        {selectedTask && (
          <div className="h-full">
            {/* Task Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-600">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {selectedTask.title}
              </h2>
              <div className="flex items-center gap-3 mb-4">
                <Tag
                  color={
                    priorityConfig[
                      selectedTask.priority as keyof typeof priorityConfig
                    ]?.color
                  }
                  icon={<FlagOutlined />}
                >
                  {
                    priorityConfig[
                      selectedTask.priority as keyof typeof priorityConfig
                    ]?.label
                  }{" "}
                  Priority
                </Tag>
                <Tag
                  color={
                    statusConfig[
                      selectedTask.status as keyof typeof statusConfig
                    ]?.color
                  }
                  icon={
                    statusConfig[
                      selectedTask.status as keyof typeof statusConfig
                    ]?.icon
                  }
                >
                  {
                    statusConfig[
                      selectedTask.status as keyof typeof statusConfig
                    ]?.label
                  }
                </Tag>
              </div>
            </div>

            {/* Task Content */}
            <div className="p-6 space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mô tả
                </h3>
                <div className="text-gray-900 dark:text-white">
                  {selectedTask.description || (
                    <Text type="secondary">Không có mô tả</Text>
                  )}
                </div>
              </div>

              {/* Start Date */}
              {selectedTask.startDate && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ngày bắt đầu
                  </h3>
                  <div className="flex items-center text-gray-900 dark:text-white">
                    <CalendarOutlined className="mr-2" />
                    {dayjs(selectedTask.startDate).format(
                      "MMMM DD, YYYY HH:mm"
                    )}
                  </div>
                </div>
              )}

              {/* Due Date */}
              {selectedTask.dueDate && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ngày kết thúc
                  </h3>
                  <div className="flex items-center text-gray-900 dark:text-white">
                    <CalendarOutlined className="mr-2" />
                    {dayjs(selectedTask.dueDate).format("MMMM DD, YYYY HH:mm")}
                    {dayjs(selectedTask.dueDate).isBefore(dayjs()) &&
                      selectedTask.status !== "COMPLETED" && (
                        <Tag color="red" className="ml-2">
                          Quá hạn
                        </Tag>
                      )}
                  </div>
                </div>
              )}

              {/* Contract & Room Info */}
              {(selectedTask.contract || selectedTask.room) && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Thông tin liên quan
                  </h3>
                  <div className="space-y-2">
                    {selectedTask.contract && (
                      <div className="flex items-center text-gray-900 dark:text-white">
                        <span className="font-medium mr-2">Hợp đồng:</span>
                        <Tag color="blue">
                          {selectedTask.contract.contractName}
                        </Tag>
                      </div>
                    )}
                    {selectedTask.room && (
                      <div className="flex items-center text-gray-900 dark:text-white">
                        <span className="font-medium mr-2">Phòng:</span>
                        <Tag color="green">{selectedTask.room.title}</Tag>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Dòng thời gian
                </h3>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <div>
                    Cập nhật lần cuối:{" "}
                    {dayjs(selectedTask.updatedAt).format("MMM DD, YYYY HH:mm")}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Hành động nhanh
                </h3>

                {/* Status Change Actions */}
                <div className="mb-4">
                  <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                    Thay đổi trạng thái
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(statusConfig)
                      .filter(([key]) => key !== selectedTask.status)
                      .map(([key, config]) => (
                        <div className="mb-2" key={key}>
                          <Button
                            key={key}
                            block
                            size="small"
                            icon={config.icon}
                            onClick={() => {
                              handleStatusChange(selectedTask.id, key);
                              setIsDetailDrawerOpen(false);
                            }}
                          >
                            Đánh dấu là {config.label}
                          </Button>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Danger Zone */}
                <div>
                  <h4 className="text-xs font-medium text-red-500 dark:text-red-400 mb-2 uppercase tracking-wider">
                    Vùng nguy hiểm
                  </h4>
                  <Popconfirm
                    title="Xóa công việc"
                    description="Bạn có chắc chắn muốn xóa công việc này không?"
                    onConfirm={() => {
                      handleDeleteTask(selectedTask.id);
                      setIsDetailDrawerOpen(false);
                    }}
                    okText="Xóa"
                    cancelText="Hủy"
                    okType="danger"
                    placement="topLeft"
                  >
                    <Button block size="small" danger icon={<DeleteOutlined />}>
                      Xóa công việc
                    </Button>
                  </Popconfirm>
                </div>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
