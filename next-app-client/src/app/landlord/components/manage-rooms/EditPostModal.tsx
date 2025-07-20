import React from "react";
import { Modal, Form, Input, Button, message } from "antd";
import { RoomData } from "../../types";

interface EditPostModalProps {
  open: boolean;
  onClose: () => void;
  selectedRoom: RoomData | null;
}

const EditPostModal: React.FC<EditPostModalProps> = ({
  open,
  onClose,
  selectedRoom,
}) => {
  return (
    <Modal title="Send Email" open={open} onCancel={onClose} footer={null}>
      <Form
        layout="vertical"
        onFinish={(values) => {
          console.log("Email values:", values);
          message.success("Email sent successfully!");
          onClose();
        }}
      >
        <Form.Item label="To">
          <Input value={selectedRoom?.name} disabled />
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
          <Input.TextArea
            rows={4}
            placeholder="Enter your message"
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" className="w-full">
            Send
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditPostModal;
