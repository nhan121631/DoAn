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
      title="Cập nhật loại bài đăng"
      open={open}
      onOk={handleUpdate}
      onCancel={() => setOpen(false)}
      okText="Cập nhật"
    >
      {errorMessage && (
        <div style={{ color: "red", marginBottom: 12 }}>{errorMessage}</div>
      )}
      <Form form={form} layout="vertical">
        <Form.Item
          label="Mã"
          name="code"
          rules={[{ required: true, message: "Vui lòng nhập mã!" }]}
          initialValue={data?.code}
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
          initialValue={data?.name}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Giá mỗi ngày"
          name="pricePerDay"
          rules={[{ required: true, message: "Vui lòng nhập giá!" }]}
          initialValue={data?.pricePerDay}
        >
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          label="Mô tả"
          name="description"
          rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
          initialValue={data?.description}
        >
          <Input.TextArea rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModelUpdatePostType;
