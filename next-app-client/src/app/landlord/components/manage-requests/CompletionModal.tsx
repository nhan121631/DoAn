"use client";

import { Modal, Form, Upload, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useState } from "react";
import type { UploadFile } from "antd/es/upload/interface";

interface CompletionModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (imageFile?: File) => void; // Bỏ description parameter
  loading?: boolean;
}

const CompletionModal: React.FC<CompletionModalProps> = ({
  open,
  onCancel,
  onSubmit,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFinish = () => {
    onSubmit(selectedFile || undefined); // Chỉ truyền ảnh
    form.resetFields();
    setFileList([]);
    setSelectedFile(null);
  };

  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    setSelectedFile(null);
    onCancel();
  };

  const uploadProps = {
    beforeUpload: (file: File) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('You can only upload image files!');
        return false;
      }
      
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('Image must smaller than 5MB!');
        return false;
      }

      setSelectedFile(file);
      return false;
    },
    onChange: ({ fileList }: { fileList: UploadFile[] }) => {
      setFileList(fileList.slice(-1));
    },
    fileList,
    maxCount: 1,
    accept: "image/*",
  };

  return (
    <Modal
      title="Complete Request"
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={500}
      centered
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
      >
        <Form.Item
          label="Upload Completion Image (Optional)"
          name="image"
        >
          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />}>
              Select Image
            </Button>
          </Upload>
        </Form.Item>

        <Form.Item className="mb-0 text-right">
          <Button onClick={handleCancel} className="mr-2">
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Complete Request
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CompletionModal;