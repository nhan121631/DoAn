"use client"; 

import React, { useContext, useState } from "react";
import { Table, Tag, Button, Modal, Popconfirm, message, Space, Input } from "antd";
import type { ColumnsType } from "antd/es/table";
import { AiOutlineDelete, AiOutlineEdit, AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { ThemeContext } from "@/app/context/ThemeContext";
import CommentFormModal from "./CommentFormModal"; 
import { CommentData, CommentFormValues, Reply } from "@/types/types"; 
import { Room } from "@/types/types"; 

const initialCommentData: CommentData[] = [
  {
    key: "c1",
    roomId: "room1",
    roomName: "Mr. Nam's Room 1",
    userName: "Nguyen Van A",
    content: "The room is very clean and comfortable, friendly host. Very satisfied!",
    date: "01/07/2024",
    status: "Responded",
    isHidden: false,
    replies: [
      { sender: 'admin', message: "Thank you for trusting and using our service. We look forward to serving you again!", timestamp: "01/07/2024 10:30" }
    ]
  },
  {
    key: "c2",
    roomId: "room2",
    roomName: "Mr. Tien's Room 2",
    userName: "Tran Thi B",
    content: "Air conditioner is a bit weak, needs maintenance. Convenient location.",
    date: "05/07/2024",
    status: "New", 
    isHidden: false,
    replies: []
  },
  {
    key: "c3",
    roomId: "room3",
    roomName: "Mr. Duong's Room 3",
    userName: "Le Van C",
    content: "Reasonable price, but there is noise from outside in the evening.",
    date: "10/07/2024",
    status: "New",
    isHidden: false,
    replies: []
  },
  {
    key: "c4",
    roomId: "room1",
    roomName: "Mr. Nam's Room 1",
    userName: "Pham Thi D",
    content: "WiFi is very unstable, can't work properly. Needs improvement.",
    date: "12/07/2024",
    status: "New",
    isHidden: false,
    replies: []
  },
  {
    key: "c5",
    roomId: "room5",
    roomName: "Ms. Lan's Room 2",
    userName: "Vu Van E",
    content: "Friendly host, new room. Will come back.",
    date: "15/07/2024",
    status: "Responded",
    isHidden: false,
    replies: [
      { sender: 'admin', message: "Very happy to serve you! Hope to see you again soon.", timestamp: "15/07/2024 14:00" }
    ]
  },
  {
    key: "c6",
    roomId: "room3",
    roomName: "Mr. Duong's Room 3",
    userName: "Nguyen Thi F",
    content: "Nice room, but a bit far from the city center.",
    date: "18/07/2024",
    status: "Responded",
    isHidden: false,
    replies: []
  },
];

const ManageCommentsInteractive: React.FC = () => {
  const sortedInitialData = [...initialCommentData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const [data, setData] = useState<CommentData[]>(sortedInitialData);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewDetailsModalOpen, setViewDetailsModalOpen] = useState(false); 
  const [selectedComment, setSelectedComment] = useState<CommentData | null>(null); 
  const [commentToReply, setCommentToReply] = useState<CommentData | null>(null);
  const { isDark } = useContext(ThemeContext);

  const handleFormSubmit = (updatedComment: CommentData) => {
    const updatedData = data.map((item) =>
      item.key === updatedComment.key ? updatedComment : item
    );
    setData(updatedData);
    message.success("Comment response updated successfully!");
    setCommentToReply(updatedComment);
  };

  const handleViewDetails = (record: CommentData) => {
    setSelectedComment(record);
    setViewDetailsModalOpen(true);
  };

  const handleDeleteComment = (recordKey: string) => {
    const updatedData = data.filter(item => item.key !== recordKey);
    setData(updatedData);
    message.success("Comment deleted successfully!");
    setIsFormModalOpen(false); 
    setCommentToReply(null);
  };

  const handleToggleHidden = (recordKey: string) => {
    const updatedData = data.map(item =>
      item.key === recordKey ? { ...item, isHidden: !item.isHidden } : item
    );
    setData(updatedData);
    message.success(`Comment has been ${updatedData.find(item => item.key === recordKey)?.isHidden ? 'hidden' : 'shown'}!`);
  };

  const handleReplyComment = (record: CommentData) => {
    setCommentToReply(record);
    setIsFormModalOpen(true);
  };

  const getStatusColorClass = (status: CommentData['status']) => {
    switch (status) {
      case "New":
        return "volcano";
      case "Responded":
        return "green";
      default:
        return "";
    }
  };

  const columns: ColumnsType<CommentData> = [
    {
      title: "Room",
      dataIndex: "roomName",
      key: "roomName",
      sorter: (a, b) => a.roomName.localeCompare(b.roomName),
    },
    {
      title: "User",
      dataIndex: "userName",
      key: "userName",
      sorter: (a, b) => a.userName.localeCompare(b.userName),
    },
    {
      title: "Comment",
      dataIndex: "content",
      key: "content",
      ellipsis: true,
      render: (text: string, record) => (
        <span
          className={`cursor-pointer hover:underline ${record.isHidden ? 'text-gray-400 italic line-through' : ''}`}
          onClick={() => handleViewDetails(record)}
        >
          {text} {record.isHidden && "(Hidden)"}
        </span>
      ),
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      defaultSortOrder: 'descend',
      sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={getStatusColorClass(status)}>{status}</Tag>
      ),
      sorter: (a, b) => a.status.localeCompare(b.status),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            size="small"
            onClick={() => handleReplyComment(record)}
          >
            Reply
          </Button>
          <Button
            type="default"
            size="small"
            icon={record.isHidden ? <AiOutlineEye size={18} /> : <AiOutlineEyeInvisible size={18} />}
            onClick={() => handleToggleHidden(record.key)}
          >
            {record.isHidden ? "Show" : "Hide"}
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this comment?"
            onConfirm={() => handleDeleteComment(record.key)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger icon={<AiOutlineDelete size={18} />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="flex flex-col flex-1">
      <div className="flex justify-between items-center mt-2 mb-2">
        <Input.Search
          placeholder="Search comments..."
          style={{ width: 250 }}
        />
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="key"
        pagination={{ pageSize: 7 }}
        className="mt-8 mb-8"
      />

      <CommentFormModal
        open={isFormModalOpen}
        onCancel={() => {
          setIsFormModalOpen(false);
          setCommentToReply(null);
        }}
        onSubmit={handleFormSubmit} 
        originalComment={commentToReply}
        onDelete={handleDeleteComment}
      />

      <Modal
        title="Comment Details"
        open={isViewDetailsModalOpen}
        onCancel={() => setViewDetailsModalOpen(false)}
        footer={null}
        width={700}
        className={isDark ? "dark" : ""}
      >
        {selectedComment && (
          <>
            <p><b>Room:</b> {selectedComment.roomName}</p>
            <p><b>User:</b> {selectedComment.userName}</p>
            <p><b>Comment:</b> {selectedComment.content}</p>
            {selectedComment.replies && selectedComment.replies.length > 0 && (
              <div className="mt-4 border-t pt-4">
                <h4 className="font-semibold mb-2">Reply History:</h4>
                {selectedComment.replies.map((reply, index) => (
                  <div key={index} className={`mb-2 p-2 rounded ${reply.sender === 'admin' ? 'bg-blue-50 dark:bg-blue-900 text-right' : 'bg-gray-50 dark:bg-gray-700 text-left'}`}>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {reply.sender === 'admin' ? 'You' : selectedComment.userName} ({reply.timestamp})
                    </p>
                    <p>{reply.message}</p>
                  </div>
                ))}
              </div>
            )}
            <p><b>Date:</b> {selectedComment.date}</p>
            <p><b>Status:</b> <Tag color={getStatusColorClass(selectedComment.status)}>{selectedComment.status}</Tag></p>
          </>
        )}
      </Modal>
    </div>
  );
};

export default ManageCommentsInteractive;
