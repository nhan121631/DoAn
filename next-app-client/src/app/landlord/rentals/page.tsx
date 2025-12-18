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
  const [sortField, setSortField] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<string | undefined>(undefined);

  const mapBookingToRentalData = (booking: any): RentalData => {
    const address = booking.room.address;
    const fullAddress = `${address.street}, ${address.ward.name}, ${address.ward.district.name}, ${address.ward.district.province.name}`;
    console.log("Image Proof:", booking.imageProof);
    return {
      key: booking.bookingId,
      name_tenant: booking.user.fullName,
      phone_tenant: booking.user.phoneNumber || "Số điện thoại trống",
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

  const fetchTableData = async (
    page = 1,
    pageSize = pagination.pageSize,
    sf?: string,
    so?: string
  ) => {
    setLoading(true);
    try {
      const response = await landlordFetchBookings(page - 1, pageSize, sf, so);
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
    fetchTableData(
      pagination.current,
      pagination.pageSize,
      sortField,
      sortOrder
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, pagination.pageSize, sortField, sortOrder]);

  const handleTableChange = (pagination: any, _filters: any, sorter: any) => {
    // Extract sorter into sortField and sortOrder
    let sf: string | undefined = undefined;
    let so: string | undefined = undefined;

    if (Array.isArray(sorter)) {
      if (sorter.length > 0) {
        sf = sorter[0]?.field || sorter[0]?.columnKey;
        so =
          sorter[0]?.order === "descend"
            ? "desc"
            : sorter[0]?.order === "ascend"
            ? "asc"
            : undefined;
      }
    } else if (sorter) {
      sf = sorter.field || sorter.columnKey;
      if (sorter.order) {
        so =
          sorter.order === "descend"
            ? "desc"
            : sorter.order === "ascend"
            ? "asc"
            : undefined;
      }
    }

    setPagination((prev) => ({
      ...prev,
      current: pagination.current,
      pageSize: pagination.pageSize,
    }));
    setSortField(sf);
    setSortOrder(so);
    fetchTableData(pagination.current, pagination.pageSize, sf, so);
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
        content: `Đặt phòng ${actionName} thành công!`,
        duration: 2,
      });
      // Refresh data after update
      await fetchTableData(pagination.current, pagination.pageSize);
      const nameRoom = data.find((item) => item.key === bookingId)?.room || "";
      await bookingConfirmationNotification(
        session?.user.id,
        userId,
        `Đặt phòng của bạn đã được ${actionName} bởi chủ nhà tại phòng ${nameRoom}.`
      );
    } catch (error) {
      console.error("Failed to update booking status:", error);
      messageApi.error({
        content: `Không thể ${actionName.toLowerCase()} đặt phòng`,
        duration: 2,
      });
    }
  };

  const handleDeleteBooking = async (bookingId: string | number) => {
    try {
      const idStr = String(bookingId);
      if (!idStr || idStr === "0") {
        console.error("Attempted to delete with invalid bookingId:", bookingId);
        messageApi.error({ content: "ID đặt phòng không hợp lệ", duration: 2 });
        return;
      }
      // Pass raw id string; BookingService.deleteBooking will encode it once when building the request URL.
      await deleteBooking(idStr);
      messageApi.success({
        content: "Đặt phòng đã được xóa thành công!",
        duration: 2,
      });
      await fetchTableData(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error("Failed to delete booking:", error);
      const errMsg = error instanceof Error ? error.message : String(error);
      messageApi.error({
        content: `Không thể xóa đặt phòng: ${errMsg}`,
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
      title: "Tên người thuê",
      dataIndex: "name_tenant",
      sorter: (a: RentalData, b: RentalData) =>
        a.name_tenant.localeCompare(b.name_tenant),
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone_tenant",
      align: "right" as const,
      sorter: (a: RentalData, b: RentalData) =>
        a.phone_tenant.localeCompare(b.phone_tenant),
    },
    {
      title: "Tên phòng",
      dataIndex: "room",
      sorter: (a: RentalData, b: RentalData) => a.room.localeCompare(b.room),
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      sorter: (a: RentalData, b: RentalData) =>
        a.address.localeCompare(b.address),
    },
    {
      title: "Ngày thuê",
      dataIndex: "rentalDate",
      sorter: (a: RentalData, b: RentalData) =>
        new Date(a.rentalDate).getTime() - new Date(b.rentalDate).getTime(),
    },
    {
      title: "Hết hạn",
      dataIndex: "expires",
      sorter: (a: RentalData, b: RentalData) =>
        new Date(a.expires).getTime() - new Date(b.expires).getTime(),
    },
    {
      title: "Ảnh chứng minh",
      dataIndex: "imageProof",
      align: "center" as const,
      render: (text: string) => {
        if (!text) {
          return (
            <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded text-gray-500 text-xs">
              Không có ảnh
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
              alt="Ảnh chứng minh"
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
      title: "Số lượng người thuê",
      dataIndex: "tenants",
      align: "right" as const,
      sorter: (a: RentalData, b: RentalData) => a.tenants - b.tenants,
    },
    {
      title: "Tổng cộng",
      dataIndex: "total",
      align: "right" as const,
      sorter: (a: RentalData, b: RentalData) => {
        const getNum = (v: string) => parseInt(v.replace(/[^\d]/g, ""), 10);
        return getNum(a.total) - getNum(b.total);
      },
    },
    {
      title: "Trạng thái",
      key: "status",
      sorter: (a: RentalData, b: RentalData) => a.status - b.status,
      render: (_: any, record: RentalData) => {
        switch (record.status) {
          case 0:
            return (
              <Space>
                <Popconfirm
                  title="Chấp nhận đặt phòng này?"
                  description="Bạn có chắc chắn muốn chấp nhận yêu cầu đặt phòng này không?"
                  onConfirm={() =>
                    handleUpdateBookingStatus(
                      record.key,
                      1,
                      "accepted",
                      record.userId
                    )
                  }
                  okText="Có"
                  cancelText="Không"
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
                    Chấp nhận
                  </Button>
                </Popconfirm>
                <Popconfirm
                  title="Từ chối đặt phòng này?"
                  description="Bạn có chắc chắn muốn từ chối yêu cầu đặt phòng này không?"
                  onConfirm={() =>
                    handleUpdateBookingStatus(
                      record.key,
                      2,
                      "rejected",
                      record.userId
                    )
                  }
                  okText="Có"
                  cancelText="Không"
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
                    Từ chối
                  </Button>
                </Popconfirm>
              </Space>
            );
          case 1:
            return (
              <Tag color="orange" style={{ fontWeight: 400 }}>
                Chưa đặt cọc
              </Tag>
            );
          case 2:
            return (
              <Tag color="red" style={{ fontWeight: 400 }}>
                Đã từ chối
              </Tag>
            );
          case 3:
            return (
              <Popconfirm
                title="Xác nhận đã nhận đặt cọc?"
                description="Bạn có chắc chắn rằng người thuê đã thanh toán đặt cọc không?"
                onConfirm={() =>
                  handleUpdateBookingStatus(
                    record.key,
                    4,
                    "deposit confirmed",
                    record.userId
                  )
                }
                okText="Có"
                cancelText="Không"
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
                  Xác nhận đã nhận đặt cọc
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
                  Đã đặt cọc
                </Tag>
              );
            } else {
              if (today > expiresDate) {
                return (
                  <Tag color="red" style={{ fontWeight: 400 }}>
                    Hết hạn
                  </Tag>
                );
              }
              return (
                <Tag color="green" style={{ fontWeight: 400 }}>
                  Đang thuê
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
      title: "Đã xóa",
      dataIndex: "isRemoved",
      // Use full record so we can access the booking id (key)
      render: (_: any, record: RentalData) =>
        record.isRemoved === 1 ? (
          <Tag color="red">Đã xóa</Tag>
        ) : (
          <Popconfirm
            title="Xóa đặt phòng này?"
            description="Bạn có chắc chắn muốn xóa đặt phòng này không?"
            onConfirm={() => handleDeleteBooking(record.key)}
            okText="Có"
            cancelText="Không"
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
              Xóa
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
            Quản lý thuê phòng
          </h2>
          <p className="text-lg text-gray-500">Quản lý thuê phòng.</p>
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
