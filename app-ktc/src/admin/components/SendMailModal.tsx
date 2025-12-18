import { useState } from "react";
import { Button, Form, Input, message, Modal, Upload } from "antd";
import type { UploadFile } from "antd/es/upload";

interface SendMailModalProps {
  open: boolean;
  onCancel: () => void;
  landlordEmail: string;
  onSend: (formData: FormData) => Promise<void>;
  isDark?: boolean;
}

function SendMailModal({
  open,
  onCancel,
  landlordEmail,
  onSend,
  isDark,
}: SendMailModalProps) {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [sending, setSending] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  return (
    <>
      {contextHolder}
      <Modal
        title="Gởi Email"
        open={open}
        onCancel={onCancel}
        footer={null}
        className={isDark ? "dark" : ""}
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={async (values) => {
            setSending(true);
            const formData = new FormData();
            formData.append(
              "data",
              JSON.stringify({
                email: landlordEmail,
                subject: values.subject,
                message: values.message,
              })
            );
            if (fileList.length > 0 && fileList[0].originFileObj) {
              formData.append("file", fileList[0].originFileObj);
            }
            try {
              await onSend(formData);
              messageApi.success({
                content: "Gửi email thành công!",
                duration: 2,
              });
              onCancel();
              form.resetFields();
              setFileList([]);
            } catch {
              messageApi.error({
                content: "Gửi email thất bại!",
                duration: 2,
              });
            } finally {
              setSending(false);
            }
          }}
        >
          <Form.Item label="Từ">
            <Input value={landlordEmail} disabled />
          </Form.Item>
          <Form.Item
            label="Chủ đề"
            name="subject"
            rules={[{ required: true, message: "Vui lòng nhập chủ đề email" }]}
          >
            <Input placeholder="Nhập chủ đề email" />
          </Form.Item>
          <Form.Item
            label="Nội dung"
            name="message"
            rules={[
              { required: true, message: "Vui lòng nhập nội dung email" },
              { min: 10, message: "Nội dung email phải có ít nhất 10 ký tự" },
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Nhập nội dung email"
              maxLength={500}
              showCount
            />
          </Form.Item>
          <Form.Item label="Tệp đính kèm">
            <Upload
              beforeUpload={() => false}
              maxCount={1}
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
            >
              <Button>Chọn tệp</Button>
            </Upload>
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full"
              loading={sending}
              disabled={sending}
            >
              Gửi
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default SendMailModal;
