/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {
  Drawer,
  Tag,
  Typography,
  Space,
  Divider,
  Avatar,
  Button,
  Tooltip,
  Progress,
  Card,
} from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  FlagOutlined,
  HomeOutlined,
  FileTextOutlined,
  EditOutlined,
  UserOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { LandlordTaskResponseDto } from '@/types/types';

const { Title, Text, Paragraph } = Typography;

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

interface TaskDetailDrawerProps {
  open: boolean;
  task: LandlordTaskResponseDto | null;
  onClose: () => void;
  onEdit: (task: LandlordTaskResponseDto) => void;
}

export default function TaskDetailDrawer({ open, task, onClose, onEdit }: TaskDetailDrawerProps) {
  if (!task) return null;

  const roomTitle = (task as any).roomTitle || task.room?.title;
  const roomId = (task as any).roomId || task.room?.id;
  const dueDate = task.dueDate ? dayjs(task.dueDate) : null;
  const isOverdue = dueDate && dueDate.isBefore(dayjs()) && task.status !== "COMPLETED" && task.status !== "CANCELLED";

  const getStatusProgress = () => {
    switch (task.status) {
      case "PENDING":
        return 0;
      case "IN_PROGRESS":
        return 50;
      case "COMPLETED":
        return 100;
      case "CANCELLED":
        return 0;
      default:
        return 0;
    }
  };

  return (
    <Drawer
      title={
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold">Task Details</span>
          <Tooltip title="Edit Task">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => onEdit(task)}
              size="small"
            />
          </Tooltip>
        </div>
      }
      placement="right"
      width={480}
      open={open}
      onClose={onClose}
      className="task-detail-drawer"
    >
      <div className="space-y-6">
        {/* Task Title & Status */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <Tag 
              color={statusConfig[task.status as keyof typeof statusConfig]?.color} 
              icon={statusConfig[task.status as keyof typeof statusConfig]?.icon}
              className="text-sm"
            >
              {statusConfig[task.status as keyof typeof statusConfig]?.label}
            </Tag>
            <Tag 
              color={priorityConfig[task.priority as keyof typeof priorityConfig]?.color} 
              icon={<FlagOutlined />}
            >
              {priorityConfig[task.priority as keyof typeof priorityConfig]?.label} Priority
            </Tag>
          </div>
          <Title level={3} className="!mb-2 !text-gray-900 dark:!text-white">
            {task.title}
          </Title>
          
          {/* Progress Bar */}
          <div className="mb-4">
            <Text className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">
              Progress
            </Text>
            <Progress
              percent={getStatusProgress()}
              strokeColor={{
                "0%": "#ff4d4f",
                "50%": "#faad14", 
                "100%": "#52c41a",
              }}
              size="small"
              showInfo={false}
            />
          </div>
        </div>

        <Divider />

        {/* Task Details */}
        <div className="space-y-4">
          {/* Description */}
          {task.description && (
            <Card size="small" className="bg-gray-50 dark:bg-gray-800 border-none">
              <div className="flex items-start gap-2">
                <FileTextOutlined className="text-gray-500 mt-1" />
                <div>
                  <Text strong className="block text-sm mb-1">Description</Text>
                  <Paragraph className="!mb-0 text-gray-700 dark:text-gray-300">
                    {task.description}
                  </Paragraph>
                </div>
              </div>
            </Card>
          )}

          {/* Room Information */}
          {roomTitle && (
            <Card size="small" className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-2">
                <HomeOutlined className="text-blue-500 mt-1" />
                <div>
                  <Text strong className="block text-sm mb-1 text-blue-700 dark:text-blue-300">
                    Related Room
                  </Text>
                  <Text className="text-gray-700 dark:text-gray-300 text-sm block">
                    {roomTitle}
                  </Text>
                  {roomId && (
                    <Text className="text-xs text-gray-500 dark:text-gray-400 block mt-1">
                      ID: {roomId}
                    </Text>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Contract Information */}
          {task.contract && (
            <Card size="small" className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <div className="flex items-start gap-2">
                <FileTextOutlined className="text-green-500 mt-1" />
                <div>
                  <Text strong className="block text-sm mb-1 text-green-700 dark:text-green-300">
                    Related Contract
                  </Text>
                  <Text className="text-gray-700 dark:text-gray-300 text-sm">
                    {task.contract.contractName}
                  </Text>
                </div>
              </div>
            </Card>
          )}

          {/* Due Date */}
          {dueDate && (
            <Card 
              size="small" 
              className={`${
                isOverdue 
                  ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800" 
                  : "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800"
              }`}
            >
              <div className="flex items-center gap-2">
                <CalendarOutlined className={isOverdue ? "text-red-500" : "text-orange-500"} />
                <div>
                  <Text strong className={`block text-sm mb-1 ${
                    isOverdue 
                      ? "text-red-700 dark:text-red-300" 
                      : "text-orange-700 dark:text-orange-300"
                  }`}>
                    Due Date
                  </Text>
                  <div className="flex items-center gap-2">
                    <Text className="text-gray-700 dark:text-gray-300 text-sm">
                      {dueDate.format("MMM DD, YYYY [at] h:mm A")}
                    </Text>
                    {isOverdue && (
                      <Tag color="error" className="text-xs">
                        Overdue
                      </Tag>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Assigned To (if exists) */}
          {task.assignedTo && (
            <Card size="small" className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2">
                <Avatar size="small" icon={<UserOutlined />} className="bg-purple-500" />
                <div>
                  <Text strong className="block text-sm mb-1 text-purple-700 dark:text-purple-300">
                    Assigned To
                  </Text>
                  <Text className="text-gray-700 dark:text-gray-300 text-sm block">
                    {task.assignedTo.name}
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400">
                    {task.assignedTo.email}
                  </Text>
                </div>
              </div>
            </Card>
          )}

          {/* Task Metadata */}
          <Card size="small" className="bg-gray-50 dark:bg-gray-800 border-none">
            <div className="space-y-2">
              <Text strong className="block text-sm text-gray-700 dark:text-gray-300">
                Task Information
              </Text>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <Text className="text-gray-500 dark:text-gray-400">Task ID:</Text>
                  <Text className="block text-gray-700 dark:text-gray-300 font-mono">
                    {task.id.substring(0, 8)}...
                  </Text>
                </div>
                <div>
                  <Text className="text-gray-500 dark:text-gray-400">Landlord:</Text>
                  <Text className="block text-gray-700 dark:text-gray-300">
                    {(task as any).landlordName || 'Unknown'}
                  </Text>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Drawer>
  );
}