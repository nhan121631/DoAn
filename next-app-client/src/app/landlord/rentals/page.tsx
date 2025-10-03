/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Table, Tag, Button, Space, Popconfirm, message, Modal } from "antd";
import { URL_IMAGE } from "@/services/Constant";
import {
  landlordFetchBookings,
  updateBookingStatus,
  deleteBooking,
} from "@/services/BookingService";
import React from "react";
import { useEffect, useState } from "react";
import { bookingConfirmationNotification } from "@/services/NotificationService";
import { useSession } from "next-auth/react";
import Image from "next/image";

interface RentalData {
  key: string | number;
  name_tenant: string;
  phone_tenant: string;
  imageProof: string;
  room: string;
  address: string;
  rentalDate: string;
  expires: string;
  tenants: number;
  total: string;
  status: 0 | 1 | 2 | 3 | 4; // 0: pending, 1: accepted, 2: rejected, 3: waiting for deposit, 4: deposited
  isRemoved: 0 | 1;
  userId: string | number;
}

export default function RentalsPage() {
  const [data, setData] = useState<RentalData[]>([]);
  const { data: session } = useSession();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>("");

  const mapBookingToRentalData = (booking: any): RentalData => {
    const address = booking.room.address;
    const fullAddress = `${address.street}, ${address.ward.name}, ${address.ward.district.name}, ${address.ward.district.province.name}`;
    console.log("Image Proof:", booking.imageProof);
    return {
      key: booking.bookingId,
      name_tenant: booking.user.fullName,
      phone_tenant: booking.user.phoneNumber || "Phone not updated",
      imageProof: booking.imageProof || "",
      room: booking.room.title,
      address: fullAddress,
      rentalDate: booking.rentalDate
        ? new Date(booking.rentalDate).toISOString().slice(0, 10)
        : "",
      expires: booking.rentalExpires
        ? new Date(booking.rentalExpires).toISOString().slice(0, 10)
        : "",
      tenants: booking.tenantCount,
      total: booking.room.priceMonth
        ? `${booking.room.priceMonth.toLocaleString()}₫`
        : "",
      status: booking.status,
      isRemoved: booking.isRemoved,
      userId: booking.user.userId,
    };
  };

  const fetchTableData = async (page = 1, pageSize = pagination.pageSize) => {
    setLoading(true);
    try {
      const response = await landlordFetchBookings(page - 1, pageSize);
      let bookings = response.bookings || response;
      const total = response.totalRecords || bookings.length;
      if (bookings.length > pageSize) {
        bookings = bookings.slice(0, pageSize);
      }
      setData(bookings.map(mapBookingToRentalData));
      setPagination({ current: page, pageSize, total });
      console.log("Fetched bookings:", response);
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
    setPagination((prev) => ({
      ...prev,
      current: pagination.current,
      pageSize: pagination.pageSize,
    }));
  };

  const handleUpdateBookingStatus = async (
    bookingId: string | number,
    newStatus: number,
    actionName: string,
    userId: string | number
  ) => {
    try {
      await updateBookingStatus(String(bookingId), newStatus);
      messageApi.success({
        content: `Booking ${actionName} successfully!`,
        duration: 2,
      });
      // Refresh data after update
      await fetchTableData(pagination.current, pagination.pageSize);
      const nameRoom = data.find((item) => item.key === bookingId)?.room || "";
      await bookingConfirmationNotification(
        session?.user.id,
        userId,
        `Your booking has been ${actionName} by the landlord at room ${nameRoom}.`
      );
    } catch (error) {
      console.error("Failed to update booking status:", error);
      messageApi.error({
        content: `Failed to ${actionName.toLowerCase()} booking`,
        duration: 2,
      });
    }
  };

  const handleDeleteBooking = async (bookingId: string | number) => {
    try {
      const idStr = String(bookingId);
      if (!idStr || idStr === "0") {
        console.error("Attempted to delete with invalid bookingId:", bookingId);
        messageApi.error({ content: "Invalid booking id", duration: 2 });
        return;
      }
      // Pass raw id string; BookingService.deleteBooking will encode it once when building the request URL.
      await deleteBooking(idStr);
      messageApi.success({
        content: "Booking removed successfully!",
        duration: 2,
      });
      await fetchTableData(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error("Failed to delete booking:", error);
      const errMsg = error instanceof Error ? error.message : String(error);
      messageApi.error({
        content: `Failed to remove booking: ${errMsg}`,
        duration: 4,
      });
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
      title: "Tenant Name",
      dataIndex: "name_tenant",
      sorter: (a: RentalData, b: RentalData) =>
        a.name_tenant.localeCompare(b.name_tenant),
    },
    {
      title: "Tenant Phone",
      dataIndex: "phone_tenant",
      align: "right" as const,
      sorter: (a: RentalData, b: RentalData) =>
        a.phone_tenant.localeCompare(b.phone_tenant),
    },
    {
      title: "Room Name",
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
      title: "Image Proof",
      dataIndex: "imageProof",
      align: "center" as const,
      render: (text: string) => {
        if (!text) {
          return (
            <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded text-gray-500 text-xs">
              No Image
            </div>
          );
        }
        return (
          <div
            className="w-16 h-16 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => handleImageClick(`${URL_IMAGE}${text}`)}
          >
            <Image
              src={`${URL_IMAGE}${text}`}
              alt="Bill Transfer"
              width={64}
              height={64}
              className="object-cover rounded border border-gray-300"
              style={{ width: "64px", height: "64px" }}
            />
          </div>
        );
      },
    },
    {
      title: "Num of Tenants",
      dataIndex: "tenants",
      align: "right" as const,
      sorter: (a: RentalData, b: RentalData) => a.tenants - b.tenants,
    },
    {
      title: "Total",
      dataIndex: "total",
      align: "right" as const,
      sorter: (a: RentalData, b: RentalData) => {
        const getNum = (v: string) => parseInt(v.replace(/[^\d]/g, ""), 10);
        return getNum(a.total) - getNum(b.total);
      },
    },
    {
      title: "Status",
      key: "status",
      sorter: (a: RentalData, b: RentalData) => a.status - b.status,
      render: (_: any, record: RentalData) => {
        switch (record.status) {
          case 0:
            return (
              <Space>
                <Popconfirm
                  title="Accept this booking?"
                  description="Are you sure you want to accept this booking request?"
                  onConfirm={() =>
                    handleUpdateBookingStatus(
                      record.key,
                      1,
                      "accepted",
                      record.userId
                    )
                  }
                  okText="Yes"
                  cancelText="No"
                >
                  <Button
                    type="primary"
                    size="small"
                    style={{
                      backgroundColor: "#1677ff",
                      color: "#fff",
                      borderColor: "#1677ff",
                      fontWeight: 400,
                    }}
                  >
                    Accept
                  </Button>
                </Popconfirm>
                <Popconfirm
                  title="Reject this booking?"
                  description="Are you sure you want to reject this booking request?"
                  onConfirm={() =>
                    handleUpdateBookingStatus(
                      record.key,
                      2,
                      "rejected",
                      record.userId
                    )
                  }
                  okText="Yes"
                  cancelText="No"
                >
                  <Button
                    type="primary"
                    danger
                    size="small"
                    style={{
                      backgroundColor: "#ff4d4f",
                      color: "#fff",
                      borderColor: "#ff4d4f",
                      fontWeight: 400,
                    }}
                  >
                    Reject
                  </Button>
                </Popconfirm>
              </Space>
            );
          case 1:
            return (
              <Tag color="orange" style={{ fontWeight: 400 }}>
                Not deposited
              </Tag>
            );
          case 2:
            return (
              <Tag color="red" style={{ fontWeight: 400 }}>
                Rejected
              </Tag>
            );
          case 3:
            return (
              <Popconfirm
                title="Confirm deposit received?"
                description="Are you sure the tenant has made the deposit payment?"
                onConfirm={() =>
                  handleUpdateBookingStatus(
                    record.key,
                    4,
                    "deposit confirmed",
                    record.userId
                  )
                }
                okText="Yes"
                cancelText="No"
              >
                <Button
                  type="primary"
                  size="small"
                  style={{
                    backgroundColor: "green",
                    color: "#fff",
                    borderColor: "green",
                    fontWeight: 400,
                  }}
                >
                  Confirm deposit
                </Button>
              </Popconfirm>
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
      title: "Removed",
      dataIndex: "isRemoved",
      // Use full record so we can access the booking id (key)
      render: (_: any, record: RentalData) =>
        record.isRemoved === 1 ? (
          <Tag color="red">Removed</Tag>
        ) : (
          <Popconfirm
            title="Remove this booking?"
            description="Are you sure you want to remove this booking?"
            onConfirm={() => handleDeleteBooking(record.key)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="primary"
              size="small"
              style={{
                backgroundColor: "red",
                color: "#fff",
                borderColor: "red",
                fontWeight: 400,
              }}
            >
              Remove
            </Button>
          </Popconfirm>
        ),
    },
  ];

  return (
    <>
      {contextHolder}
      <div style={{ padding: 24 }}>
        <div className="mb-4">
          <h2 className="text-2xl font-semibold dark:!text-white">
            Rental Management
          </h2>
          <p className="text-lg text-gray-500">Room Rental Management.</p>
        </div>
        <Table
          columns={columns}
          dataSource={data}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            // showSizeChanger: true,
          }}
          loading={loading}
          onChange={handleTableChange}
        />
      </div>

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
          <div className="flex justify-center items-center">
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
    </>
  );
}
