/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Button, Table, Tag, Form, Space, message, Modal } from "antd";
import ModalPayment from "../components/rental-history/ModalPayment";
import RequestModal from "../components/rental-history/RequestModal";
import { useEffect, useState } from "react";
import React from "react";
import { IoMdAddCircleOutline } from "react-icons/io";
import { userFetchBookings } from "@/services/BookingService";
import { RequirementRequestRoomDto } from "@/types/types";
// import { createRequest } from "@/services/Requirements";
// import { AlignCenter } from "lucide-react";
import {
  bookingConfirmationNotification,
  createRequestNotification,
} from "@/services/NotificationService";
import { useSession } from "next-auth/react";
import { getLandlordByRoomId } from "@/services/RoomService";
import { URL_IMAGE } from "@/services/Constant";
import Image from "next/image";

function useRentalStatusModal() {
  const [visible, setVisible] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [selectedIdRoom, setSelectedIdRoom] = useState<string | null>(null);

  return {
    visible,
    setVisible,
    selectedKey,
    setSelectedKey,
    confirmLoading,
    setConfirmLoading,
    selectedIdRoom,
    setSelectedIdRoom,
  };
}

interface RentalData {
  key: string;
  name_landlord: string;
  phone_landlord: string;
  room: string;
  idRoom: string;
  address: string;
  rentalDate: string;
  expires: string;
  tenants: number;
  price: string;
  status: number;
  isRemoved?: number;
  userId?: string | number;
  imageProof?: string;
}

function RentalHistory() {
  const [tableData, setTableData] = useState<RentalData[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const modal = useRentalStatusModal();
  const [messageApi, contextHolder] = message.useMessage();
  const { data: session } = useSession();
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>("");

  const mapBookingToRentalData = (booking: any): RentalData => {
    const address = booking.room.address;
    const fullAddress = `${address.street}, ${address.ward.name}, ${address.ward.district.name}, ${address.ward.district.province.name}`;
    return {
      key: booking.bookingId,
      name_landlord: booking.room.ownerName,
      phone_landlord: booking.room.ownerPhone || "Phone not updated",
      room: booking.room.title,
      idRoom: booking.room.roomId,
      address: fullAddress,
      rentalDate: booking.rentalDate
        ? new Date(booking.rentalDate).toISOString().slice(0, 10)
        : "",
      expires: booking.rentalExpires
        ? new Date(booking.rentalExpires).toISOString().slice(0, 10)
        : "",
      tenants: booking.tenantCount,
      price: booking.room.priceMonth
        ? `${booking.room.priceMonth.toLocaleString()}₫`
        : "",
      status: booking.status,
      isRemoved: booking.isRemoved,
      imageProof: booking.imageProof || "",
    };
  };

  const fetchTableData = async (page = 1, pageSize = pagination.pageSize) => {
    setLoading(true);
    try {
      const response = await userFetchBookings(page - 1, pageSize);
      const bookings = response.bookings || response;
      const total = response.totalRecords || bookings.length;
      setTableData(bookings.map(mapBookingToRentalData));
      setPagination({ current: page, pageSize, total });
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTableData(pagination.current, pagination.pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, pagination.pageSize]);

  const handleTableChange = (pagination: any) => {
    fetchTableData(pagination.current, pagination.pageSize);
  };

  // State for RequestModal
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [fieldValue, setFieldValue] = useState<any | null>(null);
  const [modalType, setModalType] = useState<"add" | "edit">("add");

  const onCancel = () => {
    setOpen(false);
    setFieldValue(null);
    form.resetFields();
  };

  const handleFinish = async (request: RequirementRequestRoomDto) => {
    try {
      console.log("Request submitted:", request);

      messageApi.success({
        content: "Request submitted successfully!",
        duration: 2,
      });

      setOpen(false);
      setFieldValue(null);
      form.resetFields();
    } catch (error: any) {
      let errorMsg = "Failed to submit request";
      if (error?.message) {
        if (Array.isArray(error.message)) {
          errorMsg = error.message[0];
        } else {
          errorMsg = error.message;
        }
      }
      messageApi.error({
        content: errorMsg,
        duration: 3,
      });
    }
  };

  const handleAccept = async (
    key: string,
    idRoom: string | number | undefined
  ) => {
    modal.setSelectedKey(key);
    modal.setVisible(true);
    const landlordId = await getLandlordByRoomId(idRoom as string);
    const getNameLandlord =
      tableData.find((item) => item.key === key)?.name_landlord ||
      "the landlord";
    const nameRoom = tableData.find((item) => item.key === key)?.room || "";
    await bookingConfirmationNotification(
      session?.user.id,
      landlordId.id,
      "Your booking deposit is confirmed and waiting for landlord's:" +
        getNameLandlord +
        " confirmation at room " +
        nameRoom +
        "."
    );
  };

  const handleConfirm = async () => {
    if (modal.selectedKey !== null) {
      modal.setConfirmLoading(true);
      try {
        // The ModalPayment component will handle the updateBookingStatus call
        // Just refresh the table data after successful update
        await fetchTableData(pagination.current, pagination.pageSize);
      } catch (error) {
        console.error("Failed to update booking:", error);
      } finally {
        modal.setConfirmLoading(false);
        modal.setVisible(false);
      }
    }
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setImageModalOpen(true);
  };

  const handleImageModalClose = () => {
    setImageModalOpen(false);
    setSelectedImage("");
  };

  const columns = [
    {
      title: "Landlord Name",
      dataIndex: "name_landlord",
      sorter: (a: any, b: any) =>
        a.name_landlord.localeCompare(b.name_landlord),
      key: "name_landlord",
    },
    { title: "Phone", dataIndex: "phone_landlord" },
    {
      title: "Room",
      dataIndex: "room",
      sorter: (a: RentalData, b: RentalData) => a.room.localeCompare(b.room),
    },
    {
      title: "Address",
      dataIndex: "address",
      sorter: (a: RentalData, b: RentalData) =>
        a.address.localeCompare(b.address),
    },
    {
      title: "Rental Date",
      dataIndex: "rentalDate",
      sorter: (a: RentalData, b: RentalData) =>
        new Date(a.rentalDate).getTime() - new Date(b.rentalDate).getTime(),
    },
    {
      title: "Expires",
      dataIndex: "expires",
      sorter: (a: RentalData, b: RentalData) =>
        new Date(a.expires).getTime() - new Date(b.expires).getTime(),
    },
    {
      title: "Tenants",
      align: "right" as const,
      dataIndex: "tenants",
      sorter: (a: RentalData, b: RentalData) => a.tenants - b.tenants,
    },
    {
      title: "Price",
      dataIndex: "price",
      align: "right" as const,
      sorter: (a: RentalData, b: RentalData) => {
        const getNum = (v: string) => parseInt(v.replace(/[^\d]/g, ""), 10);
        return getNum(a.price) - getNum(b.price);
      },
    },
    {
      title: "Image Proof",
      dataIndex: "imageProof",
      align: "center" as const,
      render: (text: string) => {
        if (!text) {
          return (
            <div className="flex items-center justify-center w-16 h-16 text-xs text-gray-500 bg-gray-200 rounded">
              No Image
            </div>
          );
        }
        return (
          <div
            className="w-16 h-16 transition-opacity cursor-pointer hover:opacity-80"
            onClick={() => handleImageClick(`${URL_IMAGE}${text}`)}
          >
            <Image
              src={`${URL_IMAGE}${text}`}
              alt="Bill Transfer"
              width={64}
              height={64}
              className="object-cover border border-gray-300 rounded"
              style={{ width: "64px", height: "64px" }}
            />
          </div>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      sorter: (a: RentalData, b: RentalData) => a.status - b.status,
      render: (_: any, record: RentalData) => {
        switch (record.status) {
          case 0:
            return (
              <Tag color="orange" style={{ fontWeight: 400 }}>
                Pending
              </Tag>
            );
          case 1:
            return (
              <Button
                type="primary"
                size="small"
                onClick={() => handleAccept(record.key, record.idRoom)}
              >
                Confirm Deposit
              </Button>
            );
          case 2:
            return (
              <Tag color="red" style={{ fontWeight: 400 }}>
                Rejected
              </Tag>
            );
          case 3:
            return (
              <Tag color="blue" style={{ fontWeight: 400 }}>
                Waiting for Deposit
              </Tag>
            );
          case 4: {
            const today = new Date();
            const rentalDate = new Date(record.rentalDate);
            const expiresDate = new Date(record.expires);
            if (today < rentalDate) {
              return (
                <Tag color="green" style={{ fontWeight: 400 }}>
                  Deposited
                </Tag>
              );
            } else {
              if (today > expiresDate) {
                return (
                  <Tag color="red" style={{ fontWeight: 400 }}>
                    Expired
                  </Tag>
                );
              }
              return (
                <Tag color="green" style={{ fontWeight: 400 }}>
                  Renting
                </Tag>
              );
            }
          }
          default:
            return null;
        }
      },
    },
    {
      title: "Request Action",
      key: "requestAction",
      render: (_: any, record: RentalData) => (
        <Space size="middle">
          <Button
            type="primary"
            size="small"
            onClick={async () => {
              if (record.status === 4) {
                setFieldValue(record);
                setModalType("add");
                modal.setSelectedKey(record.key);
                modal.setSelectedIdRoom(record.idRoom);
                setOpen(true);
                // await createRequestNotification(record.idRoom, session?.user.id, "You have a new request from a tenant!");
              }
            }}
            title="Add Request"
            disabled={
              record.status !== 4 || new Date() > new Date(record.expires)
            }
          >
            <IoMdAddCircleOutline size={18} /> Sent new request
          </Button>
        </Space>
      ),
    },
    {
      title: "Available",
      key: "available",
      render: (_: any, record: RentalData) => {
        if (record.isRemoved === 1) {
          return <Tag color="red">Removed by owner</Tag>;
        }
        return <Tag color="green">Active</Tag>;
      },
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {contextHolder}
      <h2 className="text-2xl font-bold mb-4 dark:!text-white">
        Rental History
      </h2>
      <Table
        columns={columns}
        dataSource={tableData}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
        }}
        loading={loading}
        onChange={handleTableChange}
      />
      <ModalPayment
        open={modal.visible}
        onCancel={() => modal.setVisible(false)}
        onConfirm={handleConfirm}
        confirmLoading={modal.confirmLoading}
        bookingId={modal.selectedKey || ""}
      />
      {/* Request Modal moved to component */}
      <RequestModal
        id={modal.selectedIdRoom}
        open={open}
        onCancel={onCancel}
        onFinish={handleFinish}
        form={form}
        fieldValue={fieldValue}
        modalType={modalType}
      />

      {/* Image Modal */}
      <Modal
        open={imageModalOpen}
        onCancel={handleImageModalClose}
        footer={null}
        centered
        width="auto"
        style={{ maxWidth: "90vw", maxHeight: "90vh" }}
        styles={{ body: { padding: 0 } }}
      >
        {selectedImage && (
          <div className="flex items-center justify-center">
            <Image
              src={selectedImage}
              alt="Bill Transfer - Full Size"
              width={800}
              height={600}
              style={{
                maxWidth: "85vw",
                maxHeight: "85vh",
                objectFit: "contain",
                width: "auto",
                height: "auto",
              }}
              className="rounded"
            />
          </div>
        )}
      </Modal>
    </div>
  );
}

export default RentalHistory;
