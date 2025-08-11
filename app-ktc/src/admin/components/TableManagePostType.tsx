/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Popconfirm, Table } from "antd";
import type { TableColumnsType } from "antd";
import type { IPostType } from "../types/type";
import { deleteTypePost, fetchTypePosts } from "../service/TypePostService";

const TableManagePostType: React.FC<{
  refreshKey: number;
  messageApi: any;
  handleUpdate: (record: IPostType) => void;
}> = ({ refreshKey, messageApi, handleUpdate }) => {
  // const [data] = useState<IPostType[]>([
  //   {
  //     id: "1",
  //     code: "post_type_1",
  //     name: "Post Type 1",
  //     pricePerDay: 10,
  //     description: "Description for Post Type 1",
  //   },
  //   {
  //     id: "2",
  //     code: "post_type_2",
  //     name: "Post Type 2",
  //     pricePerDay: 20,
  //     description: "Description for Post Type 2",
  //   },
  // ]);

  const [typePosts, setTypePost] = useState<IPostType[]>([]);
  const [loading, setLoading] = useState(false);
  

  useEffect(() => {
    const getTypePosts = async () => {
      setLoading(true);
      try {
        const res = (await fetchTypePosts()) as IPostType[];
        setTypePost(res || []);
      } catch (error) {
        console.error("Error fetching type posts:", error);
      } finally {
        setLoading(false);
      }
    };

    getTypePosts();
  }, [refreshKey]);

  const handleDelete = async (id: string) => {
    try {
      await deleteTypePost(id);
      setTypePost((prev) => prev.filter((post) => post.id !== id));
      messageApi.success({
        content: "You deleted a post type successfully!",
        duration: 1.5,
      });
    } catch (error) {
      console.error("Error deleting type post:", error);
    }
  };

  const columns: TableColumnsType<IPostType> = [
    {
      title: "Name",
      dataIndex: "name",
      width: "25%",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Code",
      dataIndex: "code",
      width: "20%",
      sorter: (a, b) => a.code.localeCompare(b.code),
    },
    {
      title: "Price Per Day",
      dataIndex: "pricePerDay",
      width: "20%",
      sorter: (a, b) => a.pricePerDay - b.pricePerDay,
      render: (value: number) => `${value.toLocaleString("vi-VN")} đ`,
    },
    {
      title: "Description",
      dataIndex: "description",
      width: "35%",
    },
    {
      title: "Action",
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
            Edit
          </button>
          <Popconfirm
            title="Are you sure you want to delete this post type?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
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
              Delete
            </button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <Table<IPostType>
      columns={columns}
      dataSource={typePosts}
      pagination={{ pageSize: 5 }}
      rowKey="id"
      loading={loading}
    />
  );
};

export default TableManagePostType;
