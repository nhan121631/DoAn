/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {
  getMaintenances,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance,
  getAvailableRooms
} from "@/services/MaintenanceService";
import { Button, message, Popconfirm, Space, Table, Tag } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { useEffect, useState, useCallback } from "react";
import { AiOutlineDelete, AiOutlinePlus } from "react-icons/ai";
import { FaRegEdit } from "react-icons/fa";
import { Maintenance, RequestStatus, Room } from "@/types/types";
import { FormModal } from "./FormModal"; 
import dayjs from "dayjs";

const getStatusTag = (status: RequestStatus) => {
  switch (status) {
    case RequestStatus.PENDING:
      return <Tag color="orange">Pending</Tag>;
    case RequestStatus.IN_PROGRESS:
      return <Tag color="blue">In Progress</Tag>;
    case RequestStatus.COMPLETED:
      return <Tag color="green">Completed</Tag>;
  }
};

function ClientWrapper() {
  const [data, setData] = useState<Maintenance[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 7,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  // State cho modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMaintenance, setCurrentMaintenance] = useState<Maintenance | null>(null);

  const fetchData = useCallback(async (page = 0, size = 7) => {
    setLoading(true);
    try {
      const [maintenancesRes, roomsRes] = await Promise.all([
        getMaintenances(page, size, null),
        getAvailableRooms(), 
      ]);

      setData(maintenancesRes.data || []);
      setRooms(roomsRes || []);
      setPagination({
        current: (maintenancesRes.page ?? 0) + 1,
        pageSize: maintenancesRes.size ?? size,
        total: maintenancesRes.totalElements ?? 0,
      });
    } catch (error: any) {
      messageApi.error({
        content: error.message || "Failed to fetch data",
        duration: 3,
      });
      console.error("Error fetching data:", error.message);
    } finally {
      setLoading(false);
    }
  }, [messageApi]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTableChange = (pag: TablePaginationConfig) => {
    fetchData(pag.current! - 1, pag.pageSize!);
  };

  const handleOpenModal = (record: Maintenance | null = null) => {
    setCurrentMaintenance(record);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentMaintenance(null);
  };

  const handleModalSubmit = async (values: any) => {
    setModalLoading(true);
    try {
      const { requestDate, ...rest } = values;
      const formattedValues = {
        ...rest,
        requestDate: dayjs(requestDate).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"), 
      };

      if (currentMaintenance) {
        // Cập nhật yêu cầu bảo trì
        await updateMaintenance(currentMaintenance.id!, formattedValues);
        messageApi.success("Update request successfully!");
      } else {
        // Thêm yêu cầu bảo trì mới
        await createMaintenance(formattedValues);
        messageApi.success("Add request successfully!");
      }
      handleCloseModal();
      fetchData(pagination.current - 1, pagination.pageSize); // Reload data
    } catch (error: any) {
      messageApi.error("Failed: " + (error.message || "An error occurred"));
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteClick = async (record: Maintenance) => {
    setLoading(true);
    try {
      await deleteMaintenance(record.id!);
      messageApi.success("Delete request successfully!");
      fetchData(pagination.current - 1, pagination.pageSize); // Reload data
    } catch (error: any) {
      messageApi.error("Failed: " + (error.message || "An error occurred"));
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<Maintenance> = [
    {
      title: "Room Name",
      dataIndex: ["room", "title"],
      key: "room",
    },
    {
      title: "Problem",
      dataIndex: "problem",
      key: "problem",
    },
    {
      title: "Cost",
      dataIndex: "cost",
      key: "cost",
      align: "right" as const,
      render: (cost) => cost.toLocaleString("vi-VN") + " ₫",
    },
    {
      title: "Date",
      dataIndex: "requestDate",
      key: "requestDate",
      render: (date) =>
        date
          ? new Date(date).toLocaleDateString("vi-VN", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })
          : "-",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: getStatusTag,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<FaRegEdit size={18} />}
            onClick={() => handleOpenModal(record)}
          />
          <Popconfirm
            title="Are you sure you want to delete this request?"
            onConfirm={() => handleDeleteClick(record)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger icon={<AiOutlineDelete size={18} />} />

          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      {contextHolder}
      <div className="flex items-center justify-between mb-4">
        <div>
          <Button
            type="primary"
            icon={<AiOutlinePlus size={18} />}
            onClick={() => handleOpenModal()}
          >
            Add Maintenance
          </Button>
        </div>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
        }}
        onChange={handleTableChange}
      />
      <FormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        initialData={currentMaintenance}
        availableRooms={rooms}
        onSubmit={handleModalSubmit}
        loading={modalLoading}
      />
    </>
  );
}

export default ClientWrapper;
