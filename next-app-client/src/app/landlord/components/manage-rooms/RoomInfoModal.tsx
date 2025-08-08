import React from "react";
import { Modal } from "antd";
import RoomDetail from "../room-detail/RoomDetail";

interface RoomInfoModalProps {
  open: boolean;
  onClose: () => void;
  roomId: string | null;
}

const RoomInfoModal: React.FC<RoomInfoModalProps> = ({
  open,
  onClose,
  roomId,
}) => {
  return (
    <Modal
      title={
        <span style={{ fontSize: 28, fontWeight: 700 }}>Room Details</span>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={900}
    >
      {open && roomId ? <RoomDetail id={roomId} /> : null}
    </Modal>
  );
};

export default RoomInfoModal;
