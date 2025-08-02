import React, { useEffect, useState } from "react";
import { Table } from "antd";
import type { TableColumnsType } from "antd";
import type { IPostType } from "../types/type";
import { fetchTypePosts } from "../service/TypePostService";

const TableManagePostType: React.FC = () => {
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

  useEffect(() => {
    const getTypePosts = async () => {
      try {
        const res = (await fetchTypePosts()) as IPostType[];
        setTypePost(res || []);
      } catch (error) {
        console.error("Error fetching type posts:", error);
      }
    };

    getTypePosts();
  }, []);

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
      render: (value: number) => `${value} USD`,
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
            // TODO: Implement edit logic here
            alert(`Edit post type: ${record.name}`);
          }}
        >
          Edit
        </button>
      ),
    },
  ];

  return (
    <Table<IPostType>
      columns={columns}
      dataSource={typePosts}
      pagination={{ pageSize: 5 }}
      rowKey="id"
    />
  );
};

export default TableManagePostType;
