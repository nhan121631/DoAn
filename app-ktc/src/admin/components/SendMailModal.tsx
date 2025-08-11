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

function SendMailModal ({ open, onCancel, landlordEmail, onSend, isDark } : SendMailModalProps) {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [sending, setSending] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  return (
    <>
      {contextHolder}
      <Modal
        title="Send Email"
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
              messageApi.success({ content: "Email sent successfully!", duration: 2 });
              onCancel();
              form.resetFields();
              setFileList([]);
            } catch {
              messageApi.error({ content: "Failed to send email!", duration: 2 });
            } finally {
              setSending(false);
            }
          }}
        >
          <Form.Item label="To">
            <Input value={landlordEmail} disabled />
          </Form.Item>
          <Form.Item
            label="Subject"
            name="subject"
            rules={[{ required: true, message: "Please enter email subject" }]}
          >
            <Input placeholder="Enter email subject" />
          </Form.Item>
          <Form.Item
            label="Message"
            name="message"
            rules={[
              { required: true, message: "Please enter your message" },
              { min: 10, message: "Message should be at least 10 characters" },
            ]}
          >
            <Input.TextArea rows={4} placeholder="Enter your message" maxLength={500} showCount />
          </Form.Item>
          <Form.Item label="Attachment">
            <Upload
              beforeUpload={() => false}
              maxCount={1}
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
            >
              <Button>Choose file</Button>
            </Upload>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full" loading={sending} disabled={sending}>
              Send
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default SendMailModal;
