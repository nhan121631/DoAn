"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import AddRoomForm from "../../components/manage-rooms/AddRoomForm";

const AddRoomPage: React.FC = () => {
  const router = useRouter();

  return (
    <div className="mx-4 my-6 p-6 min-h-[280px] dark:!bg-[#171f2f] dark:!text-white">
      <div className="flex items-center justify-start gap-8 mb-4">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push("/landlord/manage-rooms")}
          className="mb-4 !bg-sky-600 dark:!bg-[#171f2f] !text-white"
        >
          Go Back
        </Button>
        <h2 className="text-xl font-bold mb-4 dark:!text-white">
          Add New Room
        </h2>
      </div>

      <AddRoomForm />
    </div>
  );
};

export default AddRoomPage;
