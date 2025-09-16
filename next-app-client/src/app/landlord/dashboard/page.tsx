/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
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
} from "@ant-design/icons";
import { useSession } from "next-auth/react";
import dayjs from "dayjs";
import { LandlordTaskService } from "@/services/LandlordTaskService";
import {
  LandlordTaskCreateDto,
  LandlordTaskResponseDto,
  LandlordTaskUpdateDto,
} from "@/types/types";
import TaskDetailDrawer from "../components/dashboard/TaskDetailDrawer";

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
  PENDING: { color: "default", label: "Pending", icon: <ClockCircleOutlined /> },
  IN_PROGRESS: { color: "processing", label: "In Progress", icon: <PlayCircleOutlined /> },
  COMPLETED: { color: "success", label: "Completed", icon: <CheckCircleOutlined /> },
  CANCELLED: { color: "error", label: "Cancelled", icon: <ExclamationCircleOutlined /> },
};

interface TaskStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
}

export default function LandlordDashboardPage() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<LandlordTaskResponseDto[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<LandlordTaskResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [taskStats, setTaskStats] = useState<TaskStats>({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
  });

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<LandlordTaskResponseDto | null>(null);
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
      const fetchedTasks = await LandlordTaskService.getTasksByLandlord(session.user.id);
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

  // Calculate statistics
  const calculateStats = (taskList: LandlordTaskResponseDto[]) => {
    const now = dayjs();
    const stats = {
      total: taskList.length,
      pending: taskList.filter(t => t.status === "PENDING").length,
      inProgress: taskList.filter(t => t.status === "IN_PROGRESS").length,
      completed: taskList.filter(t => t.status === "COMPLETED").length,
      overdue: taskList.filter(t => 
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

    if (searchText) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchText.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    if (priorityFilter) {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    setFilteredTasks(filtered);
  };

  // Handle task creation
  const handleCreateTask = async (values: LandlordTaskCreateDto) => {
    setIsSubmittingCreate(true);
    try {
      // Validate required fields
      if (!values.title?.trim()) {
        messageApi.error("Task title is required");
        return;
      }

      // Format due date if provided
      const taskData = {
        ...values,
        title: values.title.trim(),
        description: values.description?.trim() || undefined,
        dueDate: values.dueDate ? dayjs(values.dueDate).format() : undefined,
      };

      await LandlordTaskService.createTask(taskData);
      messageApi.success("Task created successfully!");
      setIsCreateModalOpen(false);
      createForm.resetFields();
      fetchTasks();
    } catch (error) {
      console.error("Error creating task:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create task";
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
    
    setIsSubmittingEdit(true);
    try {
      // Validate required fields
      if (!values.title?.trim()) {
        messageApi.error("Task title is required");
        return;
      }

      // Format updated data
      const updateData = {
        ...values,
        title: values.title.trim(),
        description: values.description?.trim() || undefined,
        dueDate: values.dueDate ? dayjs(values.dueDate).format() : undefined,
      };

      await LandlordTaskService.updateTask(selectedTask.id, updateData);
      messageApi.success("Task updated successfully!");
      setIsEditModalOpen(false);
      setSelectedTask(null);
      editForm.resetFields();
      fetchTasks();
    } catch (error) {
      console.error("Error updating task:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to update task";
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
      await LandlordTaskService.updateTask(taskId, { status: newStatus as any });
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
    setSelectedTask(task);
    editForm.setFieldsValue({
      ...task,
      dueDate: task.dueDate ? dayjs(task.dueDate) : null,
    });
    setIsEditModalOpen(true);
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchTasks();
    }
  }, [session]);

  useEffect(() => {
    applyFilters();
  }, [searchText, statusFilter, priorityFilter, tasks]);

  // Table columns
  const columns = [
    {
      title: "Task",
      key: "task",
      render: (record: LandlordTaskResponseDto) => (
        <div>
          <div className="font-semibold text-gray-900 dark:text-white">
            {record.title}
          </div>
          {record.description && (
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {record.description.length > 50 
                ? `${record.description.substring(0, 50)}...`
                : record.description
              }
            </div>
          )}
          {record.contract && (
            <Tag className="mt-1 text-xs">
              Contract: {record.contract.contractName}
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      render: (priority: string) => (
        <Tag color={priorityConfig[priority as keyof typeof priorityConfig]?.color} icon={<FlagOutlined />}>
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
            {date.format("MMM DD, YYYY")}
            {isOverdue && <Text type="danger" className="ml-2">(Overdue)</Text>}
          </div>
        );
      },
    },
    {
      title: "Room Title",
      key: "roomTitle", 
      render: (record: LandlordTaskResponseDto) => {
        const roomTitle = (record as any).roomTitle || record.room?.title;
        const roomId = (record as any).roomId || record.room?.id;
        
        return roomTitle ? (
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {roomTitle.length > 60 
                ? `${roomTitle.substring(0, 60)}...`
                : roomTitle
              }
            </div>
            {roomId && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Room ID: {roomId}
              </div>
            )}
          </div>
        ) : (
          <Text type="secondary">General Task</Text>
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
                onClick={() => openDetailDrawer(record)}
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
                    label: <Text type="danger">Delete Task</Text>,
                    onClick: () => {
                      Modal.confirm({
                        title: "Delete Task",
                        content: "Are you sure you want to delete this task?",
                        okText: "Delete",
                        okType: "danger",
                        onOk: () => handleDeleteTask(record.id),
                      });
                    },
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

  const completionRate = taskStats.total > 0 ? (taskStats.completed / taskStats.total) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:bg-gradient-to-br dark:from-[#001529] dark:to-[#002140] p-6">
      {contextHolder}
      
      {/* Header */}
      <div className="mb-8 text-center">
        <Title level={1} className="!text-gray-900 dark:!text-white !mb-4 !text-4xl">
          🏠 Task Management Dashboard
        </Title>
        <Text className="text-xl text-gray-600 dark:text-gray-300 font-medium">
          Manage and track all your property maintenance tasks efficiently
        </Text>
        <div className="mt-4 h-1 w-24 bg-gradient-to-r from-blue-500 to-green-500 mx-auto rounded-full"></div>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[24, 24]} className="mb-8">
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-lg bg-white dark:bg-[#22304a] border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                  Total Tasks
                </div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {taskStats.total}
                </div>
              </div>
              <div className="text-blue-600 dark:text-blue-400">
                <ClockCircleOutlined style={{ fontSize: '2rem' }} />
              </div>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-lg bg-white dark:bg-[#22304a] border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                  Pending
                </div>
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {taskStats.pending}
                </div>
              </div>
              <div className="text-orange-600 dark:text-orange-400">
                <ClockCircleOutlined style={{ fontSize: '2rem' }} />
              </div>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-lg bg-white dark:bg-[#22304a] border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                  Completed
                </div>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {taskStats.completed}
                </div>
              </div>
              <div className="text-green-600 dark:text-green-400">
                <CheckCircleOutlined style={{ fontSize: '2rem' }} />
              </div>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-lg bg-white dark:bg-[#22304a] border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                  Overdue
                </div>
                <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {taskStats.overdue}
                </div>
              </div>
              <div className="text-red-600 dark:text-red-400">
                <ExclamationCircleOutlined style={{ fontSize: '2rem' }} />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Progress Card */}
      <Row gutter={[24, 24]} className="mb-8">
        <Col span={24}>
          <Card className="shadow-lg bg-white dark:bg-[#22304a] border border-gray-200 dark:border-gray-600">
            <Title level={4} className="!text-gray-900 dark:!text-white !mb-4">
              📊 Completion Progress
            </Title>
            <Progress
              percent={Math.round(completionRate)}
              strokeColor={{
                "0%": "#1890ff",
                "100%": "#52c41a",
              }}
              size={12}
              format={(percent) => `${percent}% Complete`}
              style={{ fontSize: '16px', fontWeight: 'bold' }}
            />
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {taskStats.completed}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Completed</div>
              </div>
              <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {taskStats.total - taskStats.completed}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Remaining</div>
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
            <Title level={3} className="!mb-0 !text-gray-900 dark:!text-white flex items-center">
              📝 Task Management
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
            placeholder="All Status"
            value={statusFilter || undefined}
            onChange={(value) => setStatusFilter(value || "")}
            style={{ width: 180 }}
            allowClear
            className="bg-white"
          >
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
              { min: 3, message: "Task title must be at least 3 characters long" },
              { max: 100, message: "Task title cannot exceed 100 characters" },
              { whitespace: true, message: "Task title cannot be empty spaces" }
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
              { max: 500, message: "Description cannot exceed 500 characters" }
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
                name="priority"
                label="Priority"
                initialValue="MEDIUM"
                rules={[
                  { required: true, message: "Please select a priority level" }
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
            
            <Col span={12}>
              <Form.Item 
                name="dueDate" 
                label="Due Date"
                rules={[
                  {
                    validator: (_, value) => {
                      if (value && dayjs(value).isBefore(dayjs(), 'day')) {
                        return Promise.reject(new Error('Due date cannot be in the past'));
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <DatePicker 
                  style={{ width: "100%" }} 
                  placeholder="Select due date (optional)"
                  disabledDate={(current) => current && current < dayjs().startOf('day')}
                  showTime={{ format: 'HH:mm' }}
                  format="YYYY-MM-DD HH:mm"
                />
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
              { min: 3, message: "Task title must be at least 3 characters long" },
              { max: 100, message: "Task title cannot exceed 100 characters" },
              { whitespace: true, message: "Task title cannot be empty spaces" }
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
              { max: 500, message: "Description cannot exceed 500 characters" }
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
            <Col span={8}>
              <Form.Item 
                name="priority" 
                label="Priority"
                rules={[
                  { required: true, message: "Please select a priority level" }
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
                rules={[
                  { required: true, message: "Please select a status" }
                ]}
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
            
            <Col span={8}>
              <Form.Item 
                name="dueDate" 
                label="Due Date"
                rules={[
                  {
                    validator: (_, value) => {
                      if (value && dayjs(value).isBefore(dayjs(), 'day')) {
                        return Promise.reject(new Error('Due date cannot be in the past'));
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <DatePicker 
                  style={{ width: "100%" }} 
                  placeholder="Select due date (optional)"
                  showTime={{ format: 'HH:mm' }}
                  format="YYYY-MM-DD HH:mm"
                />
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

      {/* Task Detail Drawer */}
      <TaskDetailDrawer
        open={isDetailDrawerOpen}
        task={selectedTask}
        onClose={() => {
          setIsDetailDrawerOpen(false);
          setSelectedTask(null);
        }}
        onEdit={(task) => {
          setIsDetailDrawerOpen(false);
          openEditModal(task);
        }}
      />
    </div>
  );
}
