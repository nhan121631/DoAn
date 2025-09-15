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
  const [selectedTask, setSelectedTask] = useState<LandlordTaskResponseDto | null>(null);

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
    try {
      await LandlordTaskService.createTask(values);
      messageApi.success("Task created successfully!");
      setIsCreateModalOpen(false);
      createForm.resetFields();
      fetchTasks();
    } catch (error) {
      console.error("Error creating task:", error);
      messageApi.error("Failed to create task");
    }
  };

  // Handle task update
  const handleUpdateTask = async (values: LandlordTaskUpdateDto) => {
    if (!selectedTask) return;
    
    try {
      await LandlordTaskService.updateTask(selectedTask.id, values);
      messageApi.success("Task updated successfully!");
      setIsEditModalOpen(false);
      setSelectedTask(null);
      editForm.resetFields();
      fetchTasks();
    } catch (error) {
      console.error("Error updating task:", error);
      messageApi.error("Failed to update task");
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
          {record.room && (
            <Tag className="mt-1 text-xs">
              Room: {record.room.title}
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
      title: "Assigned To",
      key: "assignedTo",
      render: (record: LandlordTaskResponseDto) => (
        record.assignedTo ? (
          <div className="flex items-center">
            <Avatar size="small" icon={<UserOutlined />} className="mr-2" />
            <div>
              <div className="text-sm font-medium">{record.assignedTo.name}</div>
              <div className="text-xs text-gray-500">{record.assignedTo.email}</div>
            </div>
          </div>
        ) : (
          <Text type="secondary">Unassigned</Text>
        )
      ),
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
                onClick={() => openEditModal(record)}
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
        }}
        footer={null}
        width={600}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateTask}
          className="mt-4"
        >
          <Form.Item
            name="title"
            label="Task Title"
            rules={[{ required: true, message: "Please enter task title" }]}
          >
            <Input placeholder="Enter task title" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea rows={3} placeholder="Enter task description" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="priority"
                label="Priority"
                initialValue="MEDIUM"
              >
                <Select>
                  {Object.entries(priorityConfig).map(([key, config]) => (
                    <Option key={key} value={key}>
                      <Tag color={config.color}>{config.label}</Tag>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item name="dueDate" label="Due Date">
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Create Task
              </Button>
              <Button onClick={() => setIsCreateModalOpen(false)}>
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
        }}
        footer={null}
        width={600}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleUpdateTask}
          className="mt-4"
        >
          <Form.Item
            name="title"
            label="Task Title"
            rules={[{ required: true, message: "Please enter task title" }]}
          >
            <Input placeholder="Enter task title" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea rows={3} placeholder="Enter task description" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="priority" label="Priority">
                <Select>
                  {Object.entries(priorityConfig).map(([key, config]) => (
                    <Option key={key} value={key}>
                      <Tag color={config.color}>{config.label}</Tag>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            
            <Col span={8}>
              <Form.Item name="status" label="Status">
                <Select>
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <Option key={key} value={key}>
                      <Tag color={config.color}>{config.label}</Tag>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            
            <Col span={8}>
              <Form.Item name="dueDate" label="Due Date">
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Update Task
              </Button>
              <Button onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
