/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from "react";
import { Modal, Form, Input, Button } from "antd";

interface RequestModalProps {
  open: boolean;
  onCancel: () => void;
  onFinish: (values: any) => void;
  form: any;
  fieldValue?: any;
  modalType?: "add" | "edit";
}

const RequestModal: React.FC<RequestModalProps> = ({
  open,
  onCancel,
  onFinish,
  form,
  fieldValue,
  modalType = "add",
}) => {
  // Set form values when modal opens and fieldValue changes
  useEffect(() => {
    if (open && fieldValue) {
      form.setFieldsValue({
        roomName: fieldValue.room,
      });
    }
  }, [open, fieldValue, form]);

  return (
    <Modal
      title={modalType === "edit" ? "Edit Request" : "Add New Request"}
      open={open}
      onCancel={onCancel}
      footer={null}
      destroyOnHidden={true}
      width={600}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <div className="max-h-[400px] overflow-y-auto pr-4">
          <Form.Item
            label="Room Name"
            name="roomName"
            rules={[{ required: true, message: "Please select a room!" }]}
          >
            <Input
              disabled
              placeholder="Room name"
            />
          </Form.Item>

          <Form.Item
            label="Request Description"
            name="requestDescription"
            rules={[
              { required: true, message: "Please enter request description!" },
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder="e.g., Yêu cầu sửa chữa điện nước"
            />
          </Form.Item>
        </div>

        <Form.Item>
          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              {modalType === "edit" ? "Update Request" : "Add Request"}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RequestModal;
