/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Table, Tag, Button, Space, Popconfirm, message } from "antd";
import {
  landlordFetchBookings,
  updateBookingStatus,
  deleteBooking,
} from "@/services/BookingService";
import React from "react";
import { useEffect, useState } from "react";

interface RentalData {
  key: number;
  name_tenant: string;
  phone_tenant: string;
  room: string;
  address: string;
  rentalDate: string;
  expires: string;
  tenants: number;
  total: string;
  status: 0 | 1 | 2 | 3 | 4; // 0: pending, 1: accepted, 2: rejected, 3: waiting for deposit, 4: deposited
  isRemoved: 0 | 1;
}

export default function RentalsPage() {
  const [data, setData] = useState<RentalData[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const mapBookingToRentalData = (booking: any): RentalData => {
    const address = booking.room.address;
    const fullAddress = `${address.street}, ${address.ward.name}, ${address.ward.district.name}, ${address.ward.district.province.name}`;
    return {
      key: booking.bookingId,
      name_tenant: booking.user.fullName,
      phone_tenant: booking.user.phoneNumber,
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
    bookingId: number,
    newStatus: number,
    actionName: string
  ) => {
    try {
      await updateBookingStatus(bookingId.toString(), newStatus);
      messageApi.success({
        content: `Booking ${actionName} successfully!`,
        duration: 2,
      });
      // Refresh data after update
      await fetchTableData(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error("Failed to update booking status:", error);
      messageApi.error({
        content: `Failed to ${actionName.toLowerCase()} booking`,
        duration: 2,
      });
    }
  };

  const handleDeleteBooking = async (bookingId: number) => {
    try {
      await deleteBooking(bookingId.toString());
      messageApi.success({
        content: "Booking removed successfully!",
        duration: 2,
      });
      await fetchTableData(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error("Failed to delete booking:", error);
      messageApi.error({
        content: "Failed to remove booking",
        duration: 2,
      });
    }
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
                    handleUpdateBookingStatus(record.key, 1, "accepted")
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
                    handleUpdateBookingStatus(record.key, 2, "rejected")
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
                  handleUpdateBookingStatus(record.key, 4, "deposit confirmed")
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
      render: (isRemoved: number) =>
        isRemoved === 1 ? (
          <Tag color="red">Removed</Tag>
        ) : (
          <Popconfirm
            title="Remove this booking?"
            description="Are you sure you want to remove this booking?"
            onConfirm={() => handleDeleteBooking(isRemoved)}
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
              color="green"
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
          <h2 className="text-4xl font-semibold dark:!text-white">
            Rental Management
          </h2>
          <p className="text-xl text-gray-500">Room Rental Management.</p>
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
    </>
  );
}
