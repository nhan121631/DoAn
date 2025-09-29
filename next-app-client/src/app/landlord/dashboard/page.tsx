/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Button,
  Tag,
  Input,
  Select,
  Modal,
  Form,
  DatePicker,
  message,
  Space,
  Dropdown,
  Tooltip,
  Progress,
  Avatar,
  Typography,
  Empty,
  Spin,
  Drawer,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  CalendarOutlined,
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  PlayCircleOutlined,
  MoreOutlined,
  EyeOutlined,
  FlagOutlined,
  HomeOutlined,
  FileTextOutlined,
  ToolOutlined,
  MessageOutlined,
  BellOutlined,
  ArrowRightOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { useSession } from "next-auth/react";
import dayjs from "dayjs";
import "dayjs/locale/en";
import { LandlordTaskService } from "@/services/LandlordTaskService";
import {
  LandlordTaskCreateDto,
  LandlordTaskResponseDto,
  LandlordTaskUpdateDto,
} from "@/types/types";
import {
  userFetchBookings,
  landlordFetchBookings,
} from "@/services/BookingService";
import { getRequestsByLandlordId } from "@/services/Requirements";
import { ContractService } from "@/services/ContractService";
import { BillService } from "@/services/BillService";
import {
  listenForConversations,
  listenForUnreadCount,
} from "@/services/ChatService";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
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
    label: "Pending",
    icon: <ClockCircleOutlined />,
  },
  IN_PROGRESS: {
    color: "processing",
    label: "In Progress",
    icon: <PlayCircleOutlined />,
  },
  COMPLETED: {
    color: "success",
    label: "Completed",
    icon: <CheckCircleOutlined />,
  },
  CANCELLED: {
    color: "error",
    label: "Cancelled",
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
      messageApi.error("Failed to fetch tasks");
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
              console.log(`Contract ${contract.id}: No bills data available`);
            }
          } catch (error) {
            console.error(`Error processing contract ${contract.id}:`, error);
            // Continue to next contract
          }
        }

        confirmingBills = totalConfirmingBills;
      } catch (error) {
        console.error("Error fetching confirming bills:", error);
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
        messageApi.error("Task title is required");
        setIsSubmittingCreate(false);
        return;
      }

      if (!session?.user?.id) {
        messageApi.error("User session not found");
        setIsSubmittingCreate(false);
        return;
      }

      // Additional validation for dates
      if (values.startDate && dayjs(values.startDate).isBefore(dayjs())) {
        messageApi.error("Start date must be in the future");
        setIsSubmittingCreate(false);
        return;
      }

      if (values.dueDate && dayjs(values.dueDate).isBefore(dayjs())) {
        messageApi.error("Due date must be in the future");
        setIsSubmittingCreate(false);
        return;
      }

      if (
        values.startDate &&
        values.dueDate &&
        dayjs(values.dueDate).isBefore(dayjs(values.startDate))
      ) {
        messageApi.error("Due date must be after or equal to start date");
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
      messageApi.success("Task created successfully!");
      setIsCreateModalOpen(false);
      createForm.resetFields();
      fetchTasks();
    } catch (error) {
      console.error("Error creating task:", error);
      let errorMessage = "Failed to create task";
      if (error instanceof Error) {
        errorMessage = error.message;
        // Try to extract more specific error from API response
        if (error.message.includes("400")) {
          errorMessage =
            "Invalid data provided. Please check your input and try again.";
        } else if (error.message.includes("500")) {
          errorMessage = "Server error occurred. Please try again later.";
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
      messageApi.error("No task selected for update");
      return;
    }

    // Validate form first to prevent submission if there are errors
    try {
      await editForm.validateFields();
    } catch (errorInfo) {
      console.log("Validation failed:", errorInfo);
      return; // Don't proceed if validation fails
    }

    setIsSubmittingEdit(true);
    try {
      // Validate required fields
      if (!values.title?.trim()) {
        messageApi.error("Task title is required");
        setIsSubmittingEdit(false);
        return;
      }

      // Additional validation for dates
      if (values.startDate && dayjs(values.startDate).isBefore(dayjs())) {
        messageApi.error("Start date must be in the future");
        setIsSubmittingEdit(false);
        return;
      }

      if (values.dueDate && dayjs(values.dueDate).isBefore(dayjs())) {
        messageApi.error("Due date must be in the future");
        setIsSubmittingEdit(false);
        return;
      }

      if (
        values.startDate &&
        values.dueDate &&
        dayjs(values.dueDate).isBefore(dayjs(values.startDate))
      ) {
        messageApi.error("Due date must be after or equal to start date");
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
      messageApi.success("Task updated successfully!");
      setIsEditModalOpen(false);
      setSelectedTask(null);
      editForm.resetFields();
      fetchTasks();
    } catch (error) {
      console.error("Error updating task:", error);
      let errorMessage = "Failed to update task";
      if (error instanceof Error) {
        errorMessage = error.message;
        // Try to extract more specific error from API response
        if (error.message.includes("400")) {
          errorMessage =
            "Invalid data provided. Please check your input and try again.";
        } else if (error.message.includes("500")) {
          errorMessage = "Server error occurred. Please try again later.";
        } else if (error.message.includes("404")) {
          errorMessage = "Task not found. It may have been deleted.";
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
      messageApi.success("Task deleted successfully!");
      fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
      messageApi.error("Failed to delete task");
    }
  };

  // Handle status change
  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await LandlordTaskService.updateTask(taskId, {
        status: newStatus as any,
      });
      messageApi.success("Task status updated!");
      fetchTasks();
    } catch (error) {
      console.error("Error updating status:", error);
      messageApi.error("Failed to update status");
    }
  };

  // Open detail drawer
  const openDetailDrawer = (task: LandlordTaskResponseDto) => {
    setSelectedTask(task);
    setIsDetailDrawerOpen(true);
  };

  // Open edit modal
  const openEditModal = (task: LandlordTaskResponseDto) => {
    console.log("Opening edit modal for task:", task);

    if (!task || !task.id) {
      messageApi.error("Invalid task data");
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

    console.log("Setting form values:", formValues);
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

    console.log("Dashboard: Starting to listen for unread messages");

    const unsubscribe = listenForUnreadCount(
      session.user.id,
      (totalUnreadMessages) => {
        console.log("Dashboard: Received unread count:", totalUnreadMessages);

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
      console.log("Dashboard: Cleaning up unread message listener");
      unsubscribe();
    };
  }, [session?.user?.id]);

  // Function to manually reset message count when user visits chat
  // No longer needed as count will be automatically synced with actual unread messages
  const resetMessageCount = () => {
    // Count will be automatically updated by the chat listener
    console.log("Navigating to chat - count will be updated automatically");
  };

  // Table columns
  const columns = [
    {
      title: "Title",
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
                Contract: {record.contract.contractName}
              </Tag>
            )}
            {record.room && (
              <Tag className="text-xs" color="green">
                Room: {record.room.title}
              </Tag>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Description",
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
            No description
          </Text>
        ),
    },
    {
      title: "Priority",
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
      title: "Status",
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
      title: "Start Date",
      dataIndex: "startDate",
      key: "startDate",
      render: (startDate: string) => {
        if (!startDate) return <Text type="secondary">No start date</Text>;

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
      title: "Due Date",
      dataIndex: "dueDate",
      key: "dueDate",
      render: (dueDate: string) => {
        if (!dueDate) return <Text type="secondary">No due date</Text>;

        const date = dayjs(dueDate);
        const now = dayjs();
        const isOverdue = date.isBefore(now) && dueDate;

        return (
          <div className={isOverdue ? "text-red-500" : ""}>
            <CalendarOutlined className="mr-1" />
            {date.format("MMM DD, YYYY HH:mm")}
            {isOverdue && (
              <Text type="danger" className="ml-2">
                (Overdue)
              </Text>
            )}
          </div>
        );
      },
    },
    {
      title: "Actions",
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
            <Tooltip title="View Details">
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

            <Tooltip title="Edit Task">
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
                    label: "Change Status",
                    children: statusMenuItems,
                  },
                  {
                    type: "divider",
                  },
                  {
                    key: "delete",
                    label: (
                      <Popconfirm
                        title="Delete Task"
                        description="Are you sure you want to delete this task?"
                        onConfirm={() => handleDeleteTask(record.id)}
                        okText="Delete"
                        cancelText="Cancel"
                        okType="danger"
                        placement="topRight"
                      >
                        <span className="text-red-500 hover:text-red-700">
                          <DeleteOutlined className="mr-2" />
                          Delete Task
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
          Landlord Dashboard
        </Title>
        <Text className="text-xl text-gray-600 dark:text-gray-300 font-medium">
          Manage your properties, bookings, and tenant requests efficiently
        </Text>
        <div className="mt-4 h-1 w-24 bg-gradient-to-r from-blue-500 to-green-500 mx-auto rounded-full"></div>

        <div className="mt-4 flex items-center justify-center gap-4">
          {loadingStats && (
            <div>
              <Spin size="small" />
              <Text className="ml-2 text-gray-500 dark:text-gray-400">
                Loading notifications...
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
            Refresh Notifications
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
                🏠 Property Management Center
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
                    Rental Management
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    {notificationStats.newBookings > 0
                      ? `${notificationStats.newBookings} pending bookings`
                      : "No pending bookings"}
                  </p>
                  <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium">
                    Manage Bookings <ArrowRightOutlined className="ml-2" />
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
                    Request Management
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    {notificationStats.newRequirements > 0
                      ? `${notificationStats.newRequirements} pending requirements`
                      : "No pending requirements"}
                  </p>
                  <div className="flex items-center text-orange-600 dark:text-orange-400 text-sm font-medium">
                    View Requests <ArrowRightOutlined className="ml-2" />
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
                    Payment Confirmation
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    {notificationStats.confirmingBills > 0
                      ? `${notificationStats.confirmingBills} bills awaiting confirmation`
                      : "No bills awaiting confirmation"}
                  </p>
                  <div className="flex items-center text-green-600 dark:text-green-400 text-sm font-medium">
                    Confirm Payments <ArrowRightOutlined className="ml-2" />
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
                    Messages
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    {persistentMessageCount > 0
                      ? `${persistentMessageCount} unread messages`
                      : "No new messages"}
                  </p>
                  <div className="flex items-center text-purple-600 dark:text-purple-400 text-sm font-medium">
                    Open Chat <ArrowRightOutlined className="ml-2" />
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
              � Task Overview
            </Title>
            <Row gutter={[20, 20]}>
              <Col xs={24} sm={12} lg={6}>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-600">
                  <ClockCircleOutlined className="text-3xl text-blue-600 dark:text-blue-400 mb-2" />
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                    {taskStats.total}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Total Tasks
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
                    Pending
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
                    Completed
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
                    Overdue
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
              📊 Task Completion Progress
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
                  {percent}% Complete
                </span>
              )}
              className="mb-4"
            />

            {/* Debug info */}
            <div className="text-xs text-gray-500 mb-2">
              Progress: {taskStats.completed} completed out of {taskStats.total}{" "}
              total tasks
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {taskStats.completed}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Completed
                </div>
              </div>
              <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {taskStats.total - taskStats.completed}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Remaining
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
              📝 Task Management
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                (Completed tasks hidden by default)
              </span>
            </Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsCreateModalOpen(true)}
              size="large"
              className="shadow-md"
            >
              Create New Task
            </Button>
          </div>
        }
      >
        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4 justify-end">
          <Input
            placeholder="Search tasks..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
            allowClear
          />

          <Select
            placeholder="Active Tasks Only"
            value={statusFilter || undefined}
            onChange={(value) => setStatusFilter(value || "")}
            style={{ width: 200 }}
            allowClear
            className="bg-white"
          >
            <Option key="ALL" value="ALL">
              <span className="flex items-center gap-2">
                <span className="text-gray-900">All Tasks</span>
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
            placeholder="All Priority"
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
                `${range[0]}-${range[1]} of ${total} tasks`,
            }}
            locale={{
              emptyText: (
                <Empty
                  description="No tasks found"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ),
            }}
          />
        </Spin>
      </Card>

      {/* Create Task Modal */}
      <Modal
        title="Create New Task"
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
            label="Task Title"
            rules={[
              { required: true, message: "Task title is required" },
              {
                min: 3,
                message: "Task title must be at least 3 characters long",
              },
              { max: 100, message: "Task title cannot exceed 100 characters" },
              {
                whitespace: true,
                message: "Task title cannot be empty spaces",
              },
            ]}
          >
            <Input
              placeholder="Enter task title (3-100 characters)"
              showCount
              maxLength={100}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[
              { max: 500, message: "Description cannot exceed 500 characters" },
            ]}
          >
            <TextArea
              rows={3}
              placeholder="Enter task description (optional, max 500 characters)"
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="startDate"
                label="Start Date"
                rules={[
                  {
                    validator: (_, value) => {
                      if (value && dayjs(value).isBefore(dayjs())) {
                        return Promise.reject(
                          new Error("Start date and time must be in the future")
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  placeholder="Select start date (optional)"
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
                label="Due Date"
                rules={[
                  {
                    validator: (_, value) => {
                      if (value && dayjs(value).isBefore(dayjs())) {
                        return Promise.reject(
                          new Error("Due date and time must be in the future")
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
                            "Due date must be after or equal to start date"
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
                  placeholder="Select due date (optional)"
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
                label="Priority"
                initialValue="MEDIUM"
                rules={[
                  { required: true, message: "Please select a priority level" },
                ]}
              >
                <Select placeholder="Select priority level">
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
                {isSubmittingCreate ? "Creating..." : "Create Task"}
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
        title="Edit Task"
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
            label="Task Title"
            rules={[
              { required: true, message: "Task title is required" },
              {
                min: 3,
                message: "Task title must be at least 3 characters long",
              },
              { max: 100, message: "Task title cannot exceed 100 characters" },
              {
                whitespace: true,
                message: "Task title cannot be empty spaces",
              },
            ]}
          >
            <Input
              placeholder="Enter task title (3-100 characters)"
              showCount
              maxLength={100}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[
              { max: 500, message: "Description cannot exceed 500 characters" },
            ]}
          >
            <TextArea
              rows={3}
              placeholder="Enter task description (optional, max 500 characters)"
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="startDate"
                label="Start Date"
                validateTrigger={["onChange", "onBlur"]}
                rules={[
                  {
                    validator: (_, value) => {
                      if (value && dayjs(value).isBefore(dayjs())) {
                        return Promise.reject(
                          new Error("Start date and time must be in the future")
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  placeholder="Select start date (optional)"
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
                label="Due Date"
                rules={[
                  {
                    validator: (_, value) => {
                      if (value && dayjs(value).isBefore(dayjs())) {
                        return Promise.reject(
                          new Error("Due date and time must be in the future")
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
                            "Due date must be after or equal to start date"
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
                  placeholder="Select due date (optional)"
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
                label="Priority"
                rules={[
                  { required: true, message: "Please select a priority level" },
                ]}
              >
                <Select placeholder="Select priority level">
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
                label="Status"
                rules={[{ required: true, message: "Please select a status" }]}
              >
                <Select placeholder="Select status">
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
                {isSubmittingEdit ? "Updating..." : "Update Task"}
              </Button>
              <Button
                onClick={() => setIsEditModalOpen(false)}
                disabled={isSubmittingEdit}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      {/* Task Detail Drawer - Asana Style */}
      <Drawer
        title={
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">Task Details</span>
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
                Edit
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
                  Description
                </h3>
                <div className="text-gray-900 dark:text-white">
                  {selectedTask.description || (
                    <Text type="secondary">No description provided</Text>
                  )}
                </div>
              </div>

              {/* Start Date */}
              {selectedTask.startDate && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Date
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
                    Due Date
                  </h3>
                  <div className="flex items-center text-gray-900 dark:text-white">
                    <CalendarOutlined className="mr-2" />
                    {dayjs(selectedTask.dueDate).format("MMMM DD, YYYY HH:mm")}
                    {dayjs(selectedTask.dueDate).isBefore(dayjs()) &&
                      selectedTask.status !== "COMPLETED" && (
                        <Tag color="red" className="ml-2">
                          Overdue
                        </Tag>
                      )}
                  </div>
                </div>
              )}

              {/* Contract & Room Info */}
              {(selectedTask.contract || selectedTask.room) && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Related Information
                  </h3>
                  <div className="space-y-2">
                    {selectedTask.contract && (
                      <div className="flex items-center text-gray-900 dark:text-white">
                        <span className="font-medium mr-2">Contract:</span>
                        <Tag color="blue">
                          {selectedTask.contract.contractName}
                        </Tag>
                      </div>
                    )}
                    {selectedTask.room && (
                      <div className="flex items-center text-gray-900 dark:text-white">
                        <span className="font-medium mr-2">Room:</span>
                        <Tag color="green">{selectedTask.room.title}</Tag>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Timeline
                </h3>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <div>
                    Last Updated:{" "}
                    {dayjs(selectedTask.updatedAt).format("MMM DD, YYYY HH:mm")}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Quick Actions
                </h3>

                {/* Status Change Actions */}
                <div className="mb-4">
                  <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                    Change Status
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
                            Mark as {config.label}
                          </Button>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Danger Zone */}
                <div>
                  <h4 className="text-xs font-medium text-red-500 dark:text-red-400 mb-2 uppercase tracking-wider">
                    Danger Zone
                  </h4>
                  <Popconfirm
                    title="Delete Task"
                    description="Are you sure you want to delete this task?"
                    onConfirm={() => {
                      handleDeleteTask(selectedTask.id);
                      setIsDetailDrawerOpen(false);
                    }}
                    okText="Delete"
                    cancelText="Cancel"
                    okType="danger"
                    placement="topLeft"
                  >
                    <Button block size="small" danger icon={<DeleteOutlined />}>
                      Delete Task
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
