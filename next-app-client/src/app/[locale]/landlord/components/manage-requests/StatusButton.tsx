"use client";

import { Popconfirm, Button, message } from "antd";
import { useState, startTransition } from "react";
import { updateRequestStatus } from "@/app/landlord/components/manage-requests/actionStatus";

type StatusButtonProps = {
  id: number;
  status: 0 | 1;
};

export default function StatusButton({
  id,
  status: initialStatus,
}: StatusButtonProps) {
  const [status, setStatus] = useState<0 | 1>(initialStatus);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const handleStatusChange = async () => {
    const newStatus = status === 0 ? 1 : 0;

    setLoading(true);
    
    startTransition(() => {
      updateRequestStatus(id, newStatus)
        .then(() => {
          setStatus(newStatus);
          messageApi.success("Status updated!");
        })
        .catch(() => {
          messageApi.error("Failed to update status.");
        })
        .finally(() => setLoading(false));
    });
  };

  return (
    <Popconfirm
      title={status === 0 ? "Mark as completed?" : "Mark as not processed?"}
      onConfirm={handleStatusChange}
      okText="Yes"
      cancelText="No"
    >
      {contextHolder}
      <Button
        type={status === 0 ? "primary" : "default"}
        size="small"
        loading={loading}
      >
        {status === 0 ? "Not processed" : "Completed"}
      </Button>
    </Popconfirm>
  );
}
