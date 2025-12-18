/* eslint-disable @typescript-eslint/no-explicit-any */
import { Modal, Form, Input, InputNumber } from "antd";
import { useEffect } from "react";

interface ModelCreatePostTypeProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  form: any;
  handleCreate: () => void;
  errorMessage: string | null;
}

const ModelCreatePostType: React.FC<ModelCreatePostTypeProps> = ({
  open,
  setOpen,
  form,
  handleCreate,
  errorMessage,
}) => {
  useEffect(() => {
    if (open) {
      form.resetFields();
    }
  }, [open, form]);
  return (
    <Modal
      title="Tạo loại bài đăng mới"
      open={open}
      onOk={handleCreate}
      onCancel={() => setOpen(false)}
      okText="Tạo mới"
    >
      {errorMessage && (
        <div style={{ color: "red", marginBottom: 12 }}>{errorMessage}</div>
      )}
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          code: null,
          name: null,
          pricePerDay: null,
          description: null,
        }}
      >
        <Form.Item
          label="Mã"
          name="code"
          rules={[{ required: true, message: "Vui lòng nhập mã!" }]}
        >
          <Input
            onChange={(e) => {
              form.setFieldsValue({ code: e.target.value.toUpperCase() });
            }}
          />
        </Form.Item>
        <Form.Item
          label="Tên"
          name="name"
          rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Giá mỗi ngày"
          name="pricePerDay"
          rules={[{ required: true, message: "Vui lòng nhập giá!" }]}
        >
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          label="Mô tả"
          name="description"
          rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
        >
          <Input.TextArea rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModelCreatePostType;
