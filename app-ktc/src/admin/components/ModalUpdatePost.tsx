/* eslint-disable @typescript-eslint/no-explicit-any */
import { Modal, Form, Input, InputNumber } from "antd";
import type { IPostType } from "../types/type";

interface ModelUpdatePostTypeProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  form: any;
  handleUpdate: () => void;
  errorMessage: string | null;
  data: IPostType | null; // Assuming 'data' is the post type data to be updated
}

const ModelUpdatePostType: React.FC<ModelUpdatePostTypeProps> = ({
  open,
  setOpen,
  form,
  handleUpdate,
  errorMessage,
  data, // Assuming 'data' is the post type data to be updated
}) => {
  return (
    <Modal
      title="Update Post Type"
      open={open}
      onOk={handleUpdate}
      onCancel={() => setOpen(false)}
      okText="Update"
    >
      {errorMessage && (
        <div style={{ color: "red", marginBottom: 12 }}>{errorMessage}</div>
      )}
      <Form form={form} layout="vertical">
        <Form.Item
          label="Code"
          name="code"
          rules={[{ required: true, message: "Please input code!" }]}
          initialValue={data?.code}
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
          initialValue={data?.name}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Price Per Day"
          name="pricePerDay"
          rules={[{ required: true, message: "Please input price!" }]}
          initialValue={data?.pricePerDay}
        >
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: "Please input description!" }]}
          initialValue={data?.description}
        >
          <Input.TextArea rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModelUpdatePostType;
