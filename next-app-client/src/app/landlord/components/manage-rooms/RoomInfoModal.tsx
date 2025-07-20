import React from "react";
import { Modal } from "antd";
import { RoomData } from "../../types";
import RoomDetail from "../room-detail/RoomDetail";

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
      width={900}
    >
      <RoomDetail />
    </Modal>
  );
};

export default RoomInfoModal;
