/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Button, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useSession } from "next-auth/react";
import type { UploadProps, UploadFile } from "antd";
import { createRequestNotification } from "@/services/NotificationService";
import { createRequest } from "@/services/Requirements";


interface RequestModalProps {
  open: boolean;
  id: string | null;
  onCancel: () => void;
  onFinish: (values: any) => void;
  form: any;
  fieldValue?: any;
  modalType?: "add" | "edit";
}

const RequestModal: React.FC<RequestModalProps> = ({
  id,
  open,
  onCancel,
  onFinish,
  form,
  fieldValue,
  modalType = "add",
}) => {
  const { data: session } = useSession();
  const userId = session?.user.id;
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && fieldValue) {
      form.setFieldsValue({
        roomName: fieldValue.room,
      });
    }
  }, [open, fieldValue, form]);

  const handleFinish = async (values: any) => {
    try {
      if (!id) {
        messageApi.error("Room ID is required");
        return;
      }
      if (!userId) {
        messageApi.error("User ID is required");
        return;
      }

      setLoading(true);
      // Lấy file ảnh nếu có
      const imageFile = fileList[0]?.originFileObj as File | undefined;
      // Gọi API mới: tạo requirement và upload ảnh cùng lúc
      const result = await createRequest(
        {
          userId,
          roomId: id,
          description: values.requestDescription,
        },
        imageFile // Truyền file ảnh (có thể undefined nếu không có)
      );
      // Tạo notification
      await createRequestNotification(
        id,
        userId,
        "You have a new request from a tenant: " + values.requestDescription
      );
      onFinish(result);
      messageApi.success("Request created successfully!");
      handleCancel();
    } catch (error) {
      console.error("Error creating request:", error);
      messageApi.error("Failed to create request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  
  

  const uploadProps: UploadProps = {
    beforeUpload: (file) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        messageApi.error("You can only upload image files!");
        return false;
      }
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        messageApi.error("Image must be smaller than 10MB!");
        return false;
      }
      return false; // Prevent auto upload
    },
    onChange: (info) => {
      setFileList(info.fileList);
    },
    fileList,
    maxCount: 1,
    accept: "image/*",
  };

  const handleCancel = () => {
    setFileList([]);
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={modalType === "edit" ? "Edit Request" : "Add New Request"}
      open={open}
      onCancel={handleCancel}
      footer={null}
      destroyOnHidden={true}
      width={600}
    >
      {contextHolder}
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <div className="max-h-[400px] overflow-y-auto pr-4">
          <Form.Item
            label="Room Name"
            name="roomName"
            rules={[{ required: true, message: "Please select a room!" }]}
          >
            <Input disabled placeholder="Room name" />
          </Form.Item>

          <Form.Item
            label="Request Description"
            name="requestDescription"
            rules={[
              { required: true, message: "Please enter request description!" },
              {
                min: 5,
                message: "Description must be at least 5 characters long!",
              },
              {
                max: 500,
                message: "Description must not exceed 500 characters!",
              },
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder="e.g., Yêu cầu sửa chữa điện nước"
              showCount
              maxLength={500}
            />
          </Form.Item>
        <Form.Item
  label="Upload Image (Optional)"
  name="image"
>
  <Upload {...uploadProps}>
    <Button icon={<UploadOutlined />}>Select Image</Button>
  </Upload>
</Form.Item>
<div className="mt-1 text-sm text-gray-500">
  Upload an image to help describe your request (Max: 10MB)
</div>
</div>

        <Form.Item>
          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={handleCancel}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {modalType === "edit" ? "Update Request" : "Add Request"}
            </Button>
          </div>
        </Form.Item>
      </Form>

      {/* Hidden input to store selected file for later upload */}
      <input
        type="hidden"
        id="selectedFile"
        value={fileList.length > 0 ? fileList[0].name : ""}
      />
    </Modal>
  );
};

export default RequestModal;







