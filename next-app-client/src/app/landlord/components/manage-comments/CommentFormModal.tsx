"use client";

import { Button, Form, Input, Modal } from "antd";
import React, { useEffect } from "react";
import { RatingReplyDto, RatingResponseDto } from "../../types/index";

interface CommentFormModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (replyDto: RatingReplyDto) => void;
  originalComment: RatingResponseDto | null;
}

const CommentFormContent: React.FC<{
  originalComment: RatingResponseDto | null;
  onSubmit: (replyDto: RatingReplyDto) => void;
  onCancel: () => void;
}> = ({ originalComment, onSubmit, onCancel }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (originalComment && originalComment.reply) {
      form.setFieldsValue({ reply: originalComment.reply });
    } else {
      form.resetFields();
    }
  }, [originalComment, form]);

  const handleFinish = (values: { reply: string }) => {
    if (!values.reply || !originalComment) return;
    onSubmit({ reply: values.reply });
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleFinish}>
      <Form.Item label="Phòng">
        <Input value={originalComment?.roomTitle} disabled />
      </Form.Item>
      <Form.Item label="Người dùng">
        <Input value={originalComment?.userName} disabled />
      </Form.Item>
      <Form.Item label="Bình luận">
        <Input.TextArea value={originalComment?.comment} rows={4} disabled />
      </Form.Item>
      <Form.Item
        label={originalComment?.reply ? "Chỉnh sửa phản hồi" : "Phản hồi"}
        name="reply"
        rules={[{ required: true, message: "Vui lòng nhập phản hồi của bạn!" }]}
      >
        <Input.TextArea rows={3} placeholder="Nhập phản hồi của bạn" />
      </Form.Item>
      <Form.Item>
        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={onCancel}>Hủy</Button>
          <Button type="primary" htmlType="submit">
            {originalComment?.reply ? "Cập nhật phản hồi" : "Gửi phản hồi"}
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
}) => {
  return (
    <Modal
      title="Phản hồi bình luận"
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
        />
      )}
    </Modal>
  );
};

export default CommentFormModal;
