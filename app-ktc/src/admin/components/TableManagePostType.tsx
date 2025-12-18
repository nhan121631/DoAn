/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import type { TableColumnsType } from "antd";
import { Popconfirm, Table } from "antd";
import React from "react";
import {
  getTypePostsQueryOptions,
  useDeleteTypePost,
} from "../service/ReactQueryTypePost";
import type { IPostType } from "../types/type";

const TableManagePostType: React.FC<{
  messageApi: any;
  handleUpdate: (record: IPostType) => void;
}> = ({ messageApi, handleUpdate }) => {
  const { data = [], isLoading } = useQuery(getTypePostsQueryOptions());

  // useEffect(() => {
  //   const getTypePosts = async () => {
  //     setLoading(true);
  //     try {
  //       const res = (await fetchTypePosts()) as IPostType[];
  //       setTypePost(res || []);
  //     } catch (error) {
  //       console.error("Error fetching type posts:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   getTypePosts();
  // }, [refreshKey]);

  const deleteMutation = useDeleteTypePost({
    mutationConfig: {
      onSuccess: () => {
        messageApi.success({
          content: "Bạn đã xóa loại bài đăng thành công!",
          duration: 3,
        });
      },
    },
  });

  const handleDelete = (id: string) => {
    deleteMutation.mutate({ id });
  };
  const columns: TableColumnsType<IPostType> = [
    {
      title: "Tên",
      dataIndex: "name",
      width: "25%",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Mã",
      dataIndex: "code",
      width: "20%",
      sorter: (a, b) => a.code.localeCompare(b.code),
    },
    {
      title: "Giá mỗi ngày",
      dataIndex: "pricePerDay",
      width: "20%",
      sorter: (a, b) => a.pricePerDay - b.pricePerDay,
      render: (value: number) => `${value.toLocaleString("vi-VN")} đ`,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      width: "35%",
    },
    {
      title: "Hành động",
      key: "action",
      width: "10%",
      render: (_, record) => (
        <div style={{ display: "flex", gap: 8 }}>
          <button
            style={{
              padding: "4px 12px",
              background: "#1677ff",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
            onClick={() => {
              handleUpdate(record);
            }}
          >
            Chỉnh sửa
          </button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa loại bài đăng này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <button
              style={{
                padding: "4px 12px",
                background: "#ff4d4f",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              Xóa
            </button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <Table<IPostType>
      columns={columns}
      dataSource={data}
      pagination={{ pageSize: 5 }}
      rowKey="id"
      loading={isLoading}
    />
  );
};

export default TableManagePostType;
