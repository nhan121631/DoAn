/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Table, Tag, Button, Space } from "antd";
import React from "react";

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
  status: 0 | 1 | 2 | 3 | 4; // 0: pending, 1: accepted, 2: rejected, 3: waiting for deposit, 4: waiting for deposit confirmation, 5: deposited
  isRemoved: 0 | 1; // 0: not removed, 1: removed
}

const data: RentalData[] = [
  {
    key: 1,
    name_tenant: "Nguyen Van Nam",
    phone_tenant: "0905123456",
    room: "Mr. Nam's Room 1",
    address: "123 Main St, District 1, HCMC",
    rentalDate: "2024-01-01",
    expires: "2025-01-01",
    tenants: 2,
    total: "$1,000",
    status: 0,
    isRemoved: 0,
  },
  {
    key: 2,
    name_tenant: "Tran Thi B",
    phone_tenant: "0905123457",
    room: "Ms. B's Room 2",
    address: "456 Main St, District 2, HCMC",
    rentalDate: "2025-08-01",
    expires: "2025-10-01",
    tenants: 1,
    total: "$900",
    status: 4,
    isRemoved: 0,
  },
  {
    key: 3,
    name_tenant: "Le Van C",
    phone_tenant: "0905123458",
    room: "Mr. C's Room 3",
    address: "789 Main St, District 3, HCMC",
    rentalDate: "2024-03-01",
    expires: "2025-03-01",
    tenants: 3,
    total: "$1,200",
    status: 1,
    isRemoved: 1,
  },
  {
    key: 4,
    name_tenant: "Pham Thi D",
    phone_tenant: "0905123459",
    room: "Ms. D's Room 4",
    address: "101 Main St, District 4, HCMC",
    rentalDate: "2024-04-01",
    expires: "2025-04-01",
    tenants: 2,
    total: "$1,100",
    status: 3,
    isRemoved: 0,
  },
  {
    key: 5,
    name_tenant: "Nguyen Van E",
    phone_tenant: "0905123460",
    room: "Mr. E's Room 5",
    address: "202 Main St, District 5, HCMC",
    rentalDate: "2024-05-01",
    expires: "2025-05-01",
    tenants: 1,
    total: "$950",
    status: 4,
    isRemoved: 0,
  },
  {
    key: 6,
    name_tenant: "Tran Thi F",
    phone_tenant: "0905123461",
    room: "Ms. F's Room 6",
    address: "303 Main St, District 6, HCMC",
    rentalDate: "2024-06-01",
    expires: "2025-06-01",
    tenants: 2,
    total: "$1,050",
    status: 4,
    isRemoved: 0,
  },
];

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
    sorter: (a: RentalData, b: RentalData) => a.tenants - b.tenants,
  },
  {
    title: "Total",
    dataIndex: "total",
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
      ),
  },
];

export default function RentalsPage() {
  return (
    <div style={{ padding: 24 }}>
      <h2 className="text-xl font-bold mb-4 dark:!text-white">
        Rental Management
      </h2>
      <Table columns={columns} dataSource={data} pagination={{ pageSize: 5 }} />
    </div>
  );
}
