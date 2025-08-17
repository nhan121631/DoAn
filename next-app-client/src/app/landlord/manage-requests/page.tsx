/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { ColumnsType } from "antd/es/table";
import { Table, Popconfirm, Button, message, Tag } from "antd";
import React, { useEffect } from "react";

import { useState } from "react";
import { PaginatedResponse, Requirement } from "@/types/types";
import {
  getRequestsByLandlordId,
  rejectRequirement,
  updateRequirementStatus,
} from "@/services/Requirements";
import { useSession } from "next-auth/react";

export default function ManageRequests() {
  const [requests, setRequests] = useState<Requirement[]>([]);
  const [paging, setPaging] = useState<PaginatedResponse<Requirement>>();
  const [messageApi, contextHolder] = message.useMessage();

  const handleStatusChange = async (id: string) => {
    try {
      await updateRequirementStatus(id);
      setRequests((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: (item.status = 1) } : item
        )
      );
      messageApi.success({
        content: "Status updated successfully!",
        duration: 2,
      });
    } catch (error: any) {
      messageApi.error({
        content: error.message,
        duration: 2,
      });
    }
  };
  const handleReject = async (id: string) => {
    try {
      await rejectRequirement(id);
      setRequests((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: (item.status = 2) } : item
        )
      );
      messageApi.success({
        content: "Status updated successfully!",
        duration: 2,
      });
    } catch (error: any) {
      messageApi.error({
        content: error.message,
        duration: 2,
      });
    }
  };
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user) return;

    const fetchData = async () => {
      try {
        const res =
          (await getRequestsByLandlordId()) as PaginatedResponse<Requirement>;

        setRequests(res?.data || []);
        setPaging(res);
        console.log(
          "Requests:",
          res?.data.map((req) => ({
            id: req.id,
            status: req.status,
          }))
        );
      } catch (error: any) {
        messageApi.error({
          content: error.message,
          duration: 2,
        });
      }
    };
    fetchData();
  }, [session?.user]);

  const columns: ColumnsType<Requirement> = [
    {
      title: "STT",
      key: "stt",
      width: 80,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "Room Name",
      dataIndex: "roomTitle",
      key: "roomTitle",
    },
    {
      title: "Customer Name",
      dataIndex: "userName",
      key: "userName",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Request Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status, record) =>
        status === 0 ? (
          <Popconfirm
            title="Mark as completed?"
            onConfirm={() => handleStatusChange(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="primary" size="small">
              Not processed
            </Button>
          </Popconfirm>
        ) : status === 1 ? (
          <Tag color="green">Completed</Tag>
        ) : (
          <Tag color="red">Rejected</Tag>
        ),
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      render: (_, record) =>
        record.status === 0 ? (
          <Popconfirm
            title="Are you sure?"
            onConfirm={() => handleReject(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="default"
              size="small"
              style={{
                backgroundColor: "red",
                color: "white",
                borderColor: "red",
              }}
            >
              Reject
            </Button>
          </Popconfirm>
        ) : record.status === 1 ? (
          <Tag color="default">Completed</Tag>
        ) : (
          <Tag color="default">Rejected</Tag>
        ),
    },
  ];

  return (
    <div className="p-4">
      {contextHolder}
      <div className="mb-4">
        <h2 className="text-4xl font-semibold dark:!text-white">
          Manage Requests
        </h2>
        <p className="text-xl text-gray-500">Room Request Management</p>
      </div>
      <Table
        columns={columns}
        dataSource={requests || []}
        rowKey="id"
        pagination={{
          current: (paging?.page ?? 0) + 1,
          pageSize: paging?.size ?? 5,
          total: paging?.totalRecords ?? 0,
        }}
      />
    </div>
  );
}
