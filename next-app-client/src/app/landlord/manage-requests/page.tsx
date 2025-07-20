'use client';
import { ColumnsType } from 'antd/es/table';
import { Table, Popconfirm, Button, message } from 'antd';
import React from 'react'

type ManageRequestsData = {
    id: number;
    roomName: string;
    customerName: string;
    phoneNumber: number;
    requestDescription: string;
    status: 0 | 1; // 0 = chưa xử lý, 1 = completed
}

const initialRequests: ManageRequestsData[] = [
    {
        id: 1,
        roomName: "Phòng trọ Mr. Nam",
        customerName: "Nguyễn Văn A",
        phoneNumber: 123456789,
        requestDescription: "Yêu cầu sửa chữa điện nước",
        status: 0,
    },
    {
        id: 2,
        roomName: "Phòng trọ Ms. Lan",
        customerName: "Trần Thị B",
        phoneNumber: 987654321,
        requestDescription: "Yêu cầu dọn dẹp phòng",
        status: 1,
    },
];

import { useState } from 'react';

export default function ManageRequests() {
  const [requests, setRequests] = useState<ManageRequestsData[]>(initialRequests);

  const handleStatusChange = (id: number) => {
    setRequests((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: item.status === 0 ? 1 : 0 } : item
      )
    );
    message.success('Status updated successfully!');
  };

  const columns: ColumnsType<ManageRequestsData> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Room Name',
      dataIndex: 'roomName',
      key: 'roomName',
    },
    {
      title: 'Customer Name',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Phone Number',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
    },
    {
      title: 'Request Description',
      dataIndex: 'requestDescription',
      key: 'requestDescription',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        status === 0 ? (
          <Popconfirm
            title="Mark as completed?"
            onConfirm={() => handleStatusChange(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="primary" size="small">Not processed</Button>
          </Popconfirm>
        ) : (
          <Popconfirm
            title="Mark as not processed?"
            onConfirm={() => handleStatusChange(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="default" size="small">Completed</Button>
          </Popconfirm>
        )
      ),
    },
  ];

  return (
    <div className="p-4">
      <Table
        columns={columns}
        dataSource={requests}
        rowKey="id"
        pagination={{ pageSize: 8 }}
      />
    </div>
  );
}