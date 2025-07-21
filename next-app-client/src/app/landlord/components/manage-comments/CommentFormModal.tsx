"use client";

import React, { useEffect, useCallback } from "react";
import { Modal, Button, Input, Select, Form, message, Popconfirm, Space } from "antd";
import { AiOutlineDelete } from "react-icons/ai";
import { CommentData, CommentFormValues, Reply } from "@/types/types";

// const { Option } = Select;

interface CommentFormModalProps {x
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
  

  useEffect(() => {
    if (originalComment) {
      const existingAdminReply = (originalComment.replies ?? []).find(
        (reply) => reply.sender === 'admin'
      );

      if (existingAdminReply) {
        form.setFieldsValue({
          newReplyContent: existingAdminReply.message,
        });
      } else {
        form.resetFields();
      }
    } else {
      form.resetFields();
    }
  }, [originalComment, form]);


  const handleDeleteReply = useCallback((replyIndex: number) => {
    if (originalComment && originalComment.replies) {
      const updatedReplies = originalComment.replies.filter((_, index) => index !== replyIndex);
      // If no admin replies left, status reverts to New (0)
      const newStatus: CommentData['status'] = updatedReplies.some(r => r.sender === 'admin') ? 1 : 0;

      const updatedComment: CommentData = {
        ...originalComment,
        replies: updatedReplies,
        status: newStatus,
      };
      onSubmit(updatedComment);
      message.success("Reply deleted successfully!");
      form.resetFields();
    }
  }, [originalComment, onSubmit, form]);

  const handleFinish = (values: CommentFormValues) => {
    if (originalComment) {
      const currentTimestamp = new Date().toLocaleDateString('en-US') + ' ' + new Date().toLocaleTimeString('en-US');
      const existingAdminReplyIndex = (originalComment.replies ?? []).findIndex(
        (reply) => reply.sender === 'admin'
      );

      let updatedReplies: Reply[];
      let newStatus: CommentData['status'] = originalComment.status;

      if (existingAdminReplyIndex !== -1) {
        updatedReplies = (originalComment.replies ?? []).map((reply, index) =>
          index === existingAdminReplyIndex
            ? { ...reply, message: values.newReplyContent, timestamp: currentTimestamp }
            : reply
        );
        message.success("Reply updated successfully!");
        newStatus = 1; // Ensure status is Responded
      } else {
        const newReply: Reply = {
          sender: 'admin',
          message: values.newReplyContent,
          timestamp: currentTimestamp,
        };
        updatedReplies = [...(originalComment.replies || []), newReply];
        newStatus = 1; 
        message.success("New reply sent successfully!");
      }

      const updatedComment: CommentData = {
        ...originalComment,
        replies: updatedReplies,
        status: newStatus,
      };

      onSubmit(updatedComment);
      
    }
  };

  const hasAdminReply = (originalComment?.replies ?? []).some(reply => reply.sender === 'admin');

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

      {/* Display conversation history (previous replies) */}
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
                      >
                        Delete
                      </Button>
                    </Popconfirm>
                  </Space>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <Form.Item
        label={hasAdminReply ? "Edit Your Reply" : "Your Reply"}
        name="newReplyContent"
        rules={[{ required: true, message: "Please enter your reply!" }]}
      >
        <Input.TextArea rows={3} placeholder="Enter your reply" />
      </Form.Item>

      <Form.Item>
        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit">
            {hasAdminReply ? "Update Reply" : "Send Reply"}
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

  return (
    <Modal
      title="Reply to Comment"
      open={open}
      onCancel={onCancel}
      footer={null}
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
