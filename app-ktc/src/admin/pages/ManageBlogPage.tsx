/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import {
  Table,
  Button,
  Space,
  Card,
  Typography,
  Input,
  Select,
  Modal,
  message,
  Tag,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { getBlogsQueryOptions, useDeleteBlog } from "../service/ReactQueryBlog";
import type { BlogResponse, BlogCategory, BlogStatus } from "../types/type";
import { processHtmlForDisplay } from "../utils/html-processor";
import "../styles/blog-content.css";
// import "../styles/table-dark.css";

const { Title } = Typography;
const { Option } = Select;

const ManageBlogPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [searchTitle, setSearchTitle] = useState("");
  const [filterStatus, setFilterStatus] = useState<BlogStatus | undefined>();
  const [filterCategory, setFilterCategory] = useState<
    BlogCategory | undefined
  >();
  const [previewBlog, setPreviewBlog] = useState<BlogResponse | null>(null);

  // Query for blogs
  const {
    data: blogsResponse,
    isLoading,
    error,
  } = useQuery(getBlogsQueryOptions(page, size, filterStatus, filterCategory));

  // Delete mutation
  const deleteBlogMutation = useDeleteBlog({
    mutationConfig: {
      onSuccess: () => {
        console.log("Blog deleted successfully!");
        message.success("Blog deleted successfully!");
      },
      onError: (error: any) => {
        console.error("Delete error:", error);
        message.error(
          `Failed to delete blog: ${error?.message || "Unknown error"}`
        );
      },
    },
  });

  const handlePreview = (blog: BlogResponse) => {
    setPreviewBlog(blog);
  };

  const handleClearFilters = () => {
    setSearchTitle("");
    setFilterStatus(undefined);
    setFilterCategory(undefined);
    setPage(0);
  };

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (title: string) => (
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {title}
        </span>
      ),
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
      render: (slug: string) => (
        <span className="text-blue-600 dark:text-blue-400 font-mono text-sm">
          {slug}
        </span>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (category: BlogCategory) => {
        const colors = {
          ANNOUNCEMENT: "orange",
          GUIDE: "blue",
          NEWS: "green",
        } as const;
        return <Tag color={colors[category]}>{category}</Tag>;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: BlogStatus) => (
        <Tag color={status === "PUBLISHED" ? "green" : "orange"}>{status}</Tag>
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: BlogResponse) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handlePreview(record)}
            title="Preview"
          />
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/admin/manage-blogs/edit/${record.slug}`)}
            title="Edit"
          />
          <Popconfirm
            title="Delete Blog"
            description={`Are you sure you want to delete "${record.title}"?`}
            onConfirm={() => {
              console.log("Deleting blog:", record.id);
              deleteBlogMutation.mutate({ id: record.id });
            }}
            okText="Yes, Delete"
            cancelText="Cancel"
            okType="danger"
          >
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              loading={deleteBlogMutation.isPending}
              title="Delete"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const filteredBlogs =
    blogsResponse?.content.filter((blog) =>
      blog.title.toLowerCase().includes(searchTitle.toLowerCase())
    ) || [];

  if (error) {
    return (
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <Title level={3} className="text-gray-900 dark:text-gray-100">
              Error Loading Blogs
            </Title>
            <p className="text-gray-600 dark:text-gray-400">
              Unable to load blogs. Please try again later.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <Title level={2} className="text-gray-900 dark:!text-gray-100">
            Blog Management
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/admin/manage-blogs/create")}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Create New Blog
          </Button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Input
            placeholder="Search by title..."
            prefix={<SearchOutlined />}
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
            allowClear
            className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
          />
          <Select
            placeholder="Filter by status"
            value={filterStatus}
            onChange={setFilterStatus}
            allowClear
            className="bg-white dark:bg-gray-700"
            dropdownClassName="bg-white dark:bg-gray-800"
          >
            <Option value="DRAFT">Draft</Option>
            <Option value="PUBLISHED">Published</Option>
          </Select>
          <Select
            placeholder="Filter by category"
            value={filterCategory}
            onChange={setFilterCategory}
            allowClear
            className="bg-white dark:bg-gray-700"
            dropdownClassName="bg-white dark:bg-gray-800"
          >
            <Option value="ANNOUNCEMENT">Announcement</Option>
            <Option value="GUIDE">Guide</Option>
            <Option value="NEWS">News</Option>
          </Select>
          <Button
            onClick={handleClearFilters}
            className="bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-500 hover:bg-gray-200 dark:hover:bg-gray-500"
          >
            Clear Filters
          </Button>
        </div>

        {/* Table */}
        <div className="[&_.ant-pagination-total-text]:text-gray-700 [&_.ant-pagination-total-text]:dark:!text-gray-300">
          <Table
            columns={columns}
            dataSource={filteredBlogs}
            rowKey="id"
            loading={isLoading}
            pagination={{
              current: page + 1,
              pageSize: size,
              total: blogsResponse?.totalElements || 0,
              showSizeChanger: true,
              showQuickJumper: true,
              onChange: (newPage, newSize) => {
                setPage(newPage - 1);
                setSize(newSize || 10);
              },
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} blogs`,
            }}
          />
        </div>
      </Card>

      {/* Preview Modal */}
      <Modal
        title={`Preview: ${previewBlog?.title}`}
        open={!!previewBlog}
        onCancel={() => setPreviewBlog(null)}
        footer={[
          <Button
            key="close"
            onClick={() => setPreviewBlog(null)}
            className="bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-500"
          >
            Close
          </Button>,
          <Button
            key="edit"
            type="primary"
            onClick={() => {
              if (previewBlog) {
                navigate(`/admin/manage-blogs/edit/${previewBlog.slug}`);
                setPreviewBlog(null);
              }
            }}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Edit Blog
          </Button>,
        ]}
        width={800}
        className="dark:bg-gray-800"
      >
        {previewBlog && (
          <div className="space-y-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
            <div>
              <strong className="text-gray-900 dark:text-gray-100">
                Category:
              </strong>{" "}
              <Tag color="blue">{previewBlog.category}</Tag>
              <strong className="ml-4 text-gray-900 dark:text-gray-100">
                Status:
              </strong>{" "}
              <Tag
                color={previewBlog.status === "PUBLISHED" ? "green" : "orange"}
              >
                {previewBlog.status}
              </Tag>
            </div>
            <div>
              <strong className="text-gray-900 dark:text-gray-100">
                Slug:
              </strong>{" "}
              <span className="font-mono text-sm text-blue-600 dark:text-blue-400">
                {previewBlog.slug}
              </span>
            </div>
            {previewBlog.thumbnailUrl && (
              <div>
                <strong className="text-gray-900 dark:text-gray-100">
                  Thumbnail:
                </strong>
                <div className="mt-2">
                  <img
                    src={previewBlog.thumbnailUrl}
                    alt="Thumbnail"
                    className="w-32 h-20 object-cover rounded border border-gray-200 dark:border-gray-600"
                  />
                </div>
              </div>
            )}
            <div>
              <strong className="text-gray-900 dark:text-gray-100">
                Content:
              </strong>
              <div
                className="mt-2 border rounded p-4 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 blog-content"
                dangerouslySetInnerHTML={{
                  __html: processHtmlForDisplay(previewBlog.content),
                }}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManageBlogPage;
