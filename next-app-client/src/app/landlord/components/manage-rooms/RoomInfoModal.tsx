import React from "react";
import { Modal } from "antd";
import { RoomData } from "../../types";

interface RoomInfoModalProps {
  open: boolean;
  onClose: () => void;
  selectedRoom: RoomData | null;
}

const RoomInfoModal: React.FC<RoomInfoModalProps> = ({
  open,
  onClose,
  selectedRoom,
}) => {
  return (
    <Modal
      title="Room Details"
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <p>
        <b>Name:</b> {selectedRoom?.name}
      </p>
      <p>
        <b>Address:</b> {selectedRoom?.address}
      </p>
      <p>
        <b>Price:</b> {selectedRoom?.price?.toLocaleString("vi-VN")} ₫
      </p>
      <p>
        <b>Status:</b> {selectedRoom?.available}
      </p>
      <p>
        <b>Approval:</b> {selectedRoom?.approval}
      </p>
      <p>
        <b>Hide/Show:</b> {selectedRoom?.hidden === 1 ? "Yes" : "No"}
      </p>
      <p>
        <b>Removed:</b> {selectedRoom?.isRemove === 1 ? "Yes" : "No"}
      </p>
    </Modal>
  );
};

export default RoomInfoModal;
