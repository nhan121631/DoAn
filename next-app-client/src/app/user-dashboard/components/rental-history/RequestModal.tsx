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
        messageApi.error("Cần chọn phòng");
        return;
      }
      if (!userId) {
        messageApi.error("Cần có thông tin người dùng");
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
        "Bạn có một yêu cầu mới từ khách thuê: " + values.requestDescription
      );
      onFinish(result);
      messageApi.success("Tạo yêu cầu thành công!");
      handleCancel();
    } catch (error) {
      console.error("Error creating request:", error);
      messageApi.error("Tạo yêu cầu thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const uploadProps: UploadProps = {
    beforeUpload: (file) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        messageApi.error("Chỉ cho phép tải lên tệp hình ảnh!");
        return false;
      }
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        messageApi.error("Ảnh phải nhỏ hơn 10MB!");
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
      title={modalType === "edit" ? "Chỉnh sửa yêu cầu" : "Thêm yêu cầu mới"}
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
            label="Tên phòng"
            name="roomName"
            rules={[{ required: true, message: "Vui lòng chọn phòng!" }]}
          >
            <Input disabled placeholder="Tên phòng" />
          </Form.Item>

          <Form.Item
            label="Mô tả yêu cầu"
            name="requestDescription"
            rules={[
              { required: true, message: "Vui lòng nhập mô tả yêu cầu!" },
              {
                min: 5,
                message: "Mô tả phải có ít nhất 5 ký tự!",
              },
              {
                max: 500,
                message: "Mô tả không vượt quá 500 ký tự!",
              },
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder="VD: Yêu cầu sửa chữa điện nước"
              showCount
              maxLength={500}
            />
          </Form.Item>
          <Form.Item label="Tải ảnh lên (Không bắt buộc)" name="image">
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
            </Upload>
          </Form.Item>
          <div className="mt-1 text-sm text-gray-500">
            Tải lên ảnh để mô tả rõ hơn yêu cầu của bạn (Tối đa: 10MB)
          </div>
        </div>

        <Form.Item>
          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={handleCancel}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {modalType === "edit" ? "Cập nhật yêu cầu" : "Thêm yêu cầu"}
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
