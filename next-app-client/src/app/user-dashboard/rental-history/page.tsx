/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Button, Table, Tag } from "antd";
import ModalPayment from "../components/rental-history/ModalPayment";
import { useState } from "react";
import React from "react";

interface RentalData {
  key: number;
  name_landlord: string;
  phone_landlord: string;
  room: string;
  address: string;
  rentalDate: string;
  expires: string;
  tenants: number;
  price: string;
  status: 0 | 1 | 2 | 3 | 4; // 0: pending, 1: accepted, 2: rejected, 3: waiting for deposit, 4: deposited
  isRemoved: 0 | 1; // 0: not removed, 1: removed
}

const data: RentalData[] = [
  {
    key: 1,
    name_landlord: "Nguyen Van Nam",
    phone_landlord: "0905123456",
    room: "Mr. Nam's Room 1",
    address: "123 Main St, District 1, HCMC",
    rentalDate: "2024-01-01",
    expires: "2025-01-01",
    tenants: 2,
    price: "$1,000",
    status: 0,
    isRemoved: 0,
  },
  {
    key: 2,
    name_landlord: "Tran Thi B",
    phone_landlord: "0905123457",
    room: "Ms. B's Room 2",
    address: "456 Main St, District 2, HCMC",
    rentalDate: "2025-08-01",
    expires: "2025-10-01",
    tenants: 1,
    price: "$900",
    status: 4,
    isRemoved: 0,
  },
  {
    key: 3,
    name_landlord: "Le Van C",
    phone_landlord: "0905123458",
    room: "Mr. C's Room 3",
    address: "789 Main St, District 3, HCMC",
    rentalDate: "2024-03-01",
    expires: "2025-03-01",
    tenants: 3,
    price: "$1,200",
    status: 2,
    isRemoved: 1,
  },
  {
    key: 4,
    name_landlord: "Pham Thi D",
    phone_landlord: "0905123459",
    room: "Ms. D's Room 4",
    address: "101 Main St, District 4, HCMC",
    rentalDate: "2024-04-01",
    expires: "2025-04-01",
    tenants: 2,
    price: "$1,100",
    status: 3,
    isRemoved: 0,
  },
  {
    key: 5,
    name_landlord: "Nguyen Van E",
    phone_landlord: "0905123460",
    room: "Mr. E's Room 5",
    address: "202 Main St, District 5, HCMC",
    rentalDate: "2024-05-01",
    expires: "2025-05-01",
    tenants: 4,
    price: "$1,500",
    status: 1,
    isRemoved: 0,
  },
];

function useRentalStatusModal() {
  const [visible, setVisible] = useState(false);
  const [selectedKey, setSelectedKey] = useState<number | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  
  return {
    visible,
    setVisible,
    selectedKey,
    setSelectedKey,
    confirmLoading,
    setConfirmLoading,
  };
}

function RentalHistory() {
  const [tableData, setTableData] = React.useState(data);
  const modal = useRentalStatusModal();

  const handleAccept = (key: number) => {
    modal.setSelectedKey(key);
    modal.setVisible(true);
  };

  const handleConfirm = () => {
    if (modal.selectedKey !== null) {
      modal.setConfirmLoading(true);
      setTimeout(() => {
        setTableData((prev) =>
          prev.map((item) =>
            item.key === modal.selectedKey ? { ...item, status: 3 } : item
          )
        );
        modal.setConfirmLoading(false);
        modal.setVisible(false);
      }, 1000);
    }
  };

  const columns = [
    {
      title: "Landlord Name",
      dataIndex: "name_landlord",
      sorter: (a: RentalData, b: RentalData) =>
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
      dataIndex: "tenants",
      sorter: (a: RentalData, b: RentalData) => a.tenants - b.tenants,
    },
    {
      title: "Price",
      dataIndex: "price",
      sorter: (a: RentalData, b: RentalData) => {
        const getNum = (v: string) => parseInt(v.replace(/[^\d]/g, ""), 10);
        return getNum(a.price) - getNum(b.price);
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
                onClick={() => handleAccept(record.key)}
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
        <Button
          type="default"
          size="small"
          onClick={() => handleAccept(record.key)}
          disabled={record.status !== 4}
        >
          Sent Request
        </Button>
      ),
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2 className="text-xl font-bold mb-4 dark:!text-white">
        Rental History
      </h2>
      <Table
        columns={columns}
        dataSource={tableData}
        pagination={{ pageSize: 5 }}
      />
      <ModalPayment
        open={modal.visible}
        onCancel={() => modal.setVisible(false)}
        onConfirm={handleConfirm}
        confirmLoading={modal.confirmLoading}
      />
    </div>
  );
}

export default RentalHistory;
