"use client";

import React, { useEffect, useCallback, useState, useContext } from "react";
import { Modal, Button, Input, Select, Form, message, Popconfirm, Space } from "antd";
import { AiOutlineDelete } from "react-icons/ai";
import { ThemeContext } from "@/app/context/ThemeContext";
import { CommentData, CommentFormValues, Reply } from "@/types/types";

const { Option } = Select;

interface CommentFormModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (updatedComment: CommentData) => void;
  originalComment: CommentData | null;
  onDelete: (commentKey: string) => void;
}

const CommentFormContent: React.FC<{
  originalComment: CommentData | null;
  onSubmit: (updatedComment: CommentData) => void;
  onCancel: () => void;
  onDelete: (commentKey: string) => void;
}> = ({ originalComment, onSubmit, onCancel, onDelete }) => {
  const [form] = Form.useForm();
  const { isDark } = useContext(ThemeContext);
  const [editingReplyIndex, setEditingReplyIndex] = useState<number | null>(null);

  useEffect(() => {
    if (originalComment) {
      form.setFieldsValue({
        newReplyContent: "",
      });
      setEditingReplyIndex(null);
    } else {
      form.resetFields();
    }
  }, [originalComment, form]);

  const handleEditReply = useCallback((replyIndex: number) => {
    if (originalComment && originalComment.replies?.[replyIndex]) {
      setEditingReplyIndex(replyIndex);
      form.setFieldsValue({ newReplyContent: originalComment.replies[replyIndex].message });
    }
  }, [originalComment, form]);

  const handleDeleteReply = useCallback((replyIndex: number) => {
    if (originalComment && originalComment.replies) {
      const updatedReplies = originalComment.replies.filter((_, index) => index !== replyIndex);
      const newStatus: CommentData['status'] = updatedReplies.length > 0 ? "Responded" : "New";

      const updatedComment: CommentData = {
        ...originalComment,
        replies: updatedReplies,
        status: newStatus,
      };
      onSubmit(updatedComment);
      message.success("Reply deleted!");
      setEditingReplyIndex(null);
      form.resetFields();
    }
  }, [originalComment, onSubmit, form]);

  const handleFinish = (values: CommentFormValues) => {
    if (originalComment) {
      let updatedReplies: Reply[];
      let newStatus: CommentData['status'] = originalComment.status;

      if (editingReplyIndex !== null) {
        updatedReplies = (originalComment.replies ?? []).map((reply, index) =>
            index === editingReplyIndex
                ? { ...reply, message: values.newReplyContent, timestamp: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN') }
                : reply
        );
        message.success("Reply updated!");
      } else {
        const newReply: Reply = {
          sender: 'admin',
          message: values.newReplyContent,
          timestamp: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-GB'),
        };
        updatedReplies = [...(originalComment.replies || []), newReply];
        newStatus = "Responded";
        message.success("New reply sent!");
      }

      const updatedComment: CommentData = {
        ...originalComment,
        replies: updatedReplies,
        status: newStatus,
      };

      onSubmit(updatedComment);
      setEditingReplyIndex(null);
      form.resetFields();
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleFinish}>
      <Form.Item label="Room">
        <Input value={originalComment?.roomName} disabled />
      </Form.Item>
      <Form.Item label="User">
        <Input value={originalComment?.userName} disabled />
      </Form.Item>
      <Form.Item label="Original Comment">
        <Input.TextArea value={originalComment?.content} rows={4} disabled />
      </Form.Item>

      {originalComment?.replies && originalComment.replies.length > 0 && (
        <div className="mb-4 border-t pt-4">
          <h4 className="font-semibold mb-2">Reply History:</h4>
          <div className="max-h-48 overflow-y-auto pr-2">
            {originalComment.replies.map((reply, index) => (
              <div
                key={index}
                className={`mb-2 p-2 rounded ${reply.sender === 'admin' ? 'bg-blue-50 dark:bg-blue-900 text-right' : 'bg-gray-50 dark:bg-gray-700 text-left'}`}
              >
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {reply.sender === 'admin' ? 'You' : originalComment.userName} ({reply.timestamp})
                </p>
                <p>{reply.message}</p>
                {reply.sender === 'admin' && (
                  <Space size="small">
                    <Button
                      type="link"
                      size="small"
                      onClick={() => handleEditReply(index)}
                      className="!p-0 !h-auto"
                    >
                      Edit
                    </Button>
                    <Popconfirm
                      title="Are you sure you want to delete this reply?"
                      onConfirm={() => handleDeleteReply(index)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button
                        type="link"
                        size="small"
                        danger
                        icon={<AiOutlineDelete size={14} />}
                        className="!p-0 !h-auto"
                      />
                    </Popconfirm>
                  </Space>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <Form.Item
        label={editingReplyIndex !== null ? "Edit Reply" : "Your Reply"}
        name="newReplyContent"
        rules={[{ required: true, message: "Please enter your reply!" }]}
      >
        <Input.TextArea rows={3} placeholder="Enter your reply" />
      </Form.Item>

      <Form.Item>
        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit">
            {editingReplyIndex !== null ? "Update Reply" : "Send Reply"}
          </Button>
        </div>
      </Form.Item>
    </Form>
  );
};

const CommentFormModal: React.FC<CommentFormModalProps> = ({
  open,
  onCancel,
  onSubmit,
  originalComment,
  onDelete,
}) => {
  const { isDark } = useContext(ThemeContext);

  return (
    <Modal
      title="Reply to Comment"
      open={open}
      onCancel={onCancel}
      footer={null}
      className={isDark ? "dark" : ""}
      destroyOnHidden={true}
      width={500}
    >
      {open && (
        <CommentFormContent
          originalComment={originalComment}
          onSubmit={onSubmit}
          onCancel={onCancel}
          onDelete={onDelete}
        />
      )}
    </Modal>
  );
};

export default CommentFormModal;
