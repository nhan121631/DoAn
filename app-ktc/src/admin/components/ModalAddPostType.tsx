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
      title="Create Post Type"
      open={open}
      onOk={handleCreate}
      onCancel={() => setOpen(false)}
      okText="Create"
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
          label="Code"
          name="code"
          rules={[{ required: true, message: "Please input code!" }]}
        >
          <Input
            onChange={(e) => {
              form.setFieldsValue({ code: e.target.value.toUpperCase() });
            }}
          />
        </Form.Item>
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: "Please input name!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Price Per Day"
          name="pricePerDay"
          rules={[{ required: true, message: "Please input price!" }]}
        >
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: "Please input description!" }]}
        >
          <Input.TextArea rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModelCreatePostType;
