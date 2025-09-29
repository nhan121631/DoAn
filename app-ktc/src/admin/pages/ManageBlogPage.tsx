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
        <span className="font-medium text-gray-900 dark:text-gray-100 line-clamp-2">
          {title}
        </span>
      ),
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
      render: (slug: string) => (
        <span className="text-blue-600 dark:text-blue-400 font-mono text-sm bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">
          {slug}
        </span>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (category: BlogCategory) => {
        const colorConfig = {
          ANNOUNCEMENT: {
            color: "orange",
            className:
              "bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700",
          },
          GUIDE: {
            color: "blue",
            className:
              "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700",
          },
          NEWS: {
            color: "green",
            className:
              "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700",
          },
        } as const;
        return (
          <Tag
            color={colorConfig[category].color}
            className={colorConfig[category].className}
          >
            {category}
          </Tag>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: BlogStatus) => (
        <Tag
          color={status === "PUBLISHED" ? "green" : "orange"}
          className={
            status === "PUBLISHED"
              ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700"
              : "bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700"
          }
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => (
        <span className="text-gray-600 dark:text-gray-400 text-sm">
          {new Date(date).toLocaleDateString()}
        </span>
      ),
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
            className="bg-gray-50 dark:bg-gray-600 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-500"
          />
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/admin/manage-blogs/edit/${record.slug}`)}
            title="Edit"
            className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-600 hover:bg-blue-100 dark:hover:bg-blue-800/50"
          />
          <Popconfirm
            title={
              <span className="text-gray-900 dark:text-gray-100">
                Delete Blog
              </span>
            }
            description={
              <span className="text-gray-700 dark:text-gray-300">
                Are you sure you want to delete "{record.title}"?
              </span>
            }
            onConfirm={() => {
              console.log("Deleting blog:", record.id);
              deleteBlogMutation.mutate({ id: record.id });
            }}
            okText="Yes, Delete"
            cancelText="Cancel"
            okType="danger"
            overlayClassName="[&_.ant-popover-content]:bg-white [&_.ant-popover-content]:dark:bg-gray-800 [&_.ant-popover-arrow]:after:bg-white [&_.ant-popover-arrow]:after:dark:bg-gray-800"
          >
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              loading={deleteBlogMutation.isPending}
              title="Delete"
              className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-600 hover:bg-red-100 dark:hover:bg-red-800/50"
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
          <Title
            level={2}
            className="text-gray-900 dark:!text-gray-100 !text-2xl !font-semibold !mb-0"
          >
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
            prefix={
              <SearchOutlined className="text-gray-400 dark:text-gray-500" />
            }
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
            allowClear
            className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 [&_.ant-input]:bg-white [&_.ant-input]:dark:bg-gray-700 [&_.ant-input]:text-gray-900 [&_.ant-input]:dark:text-gray-100 [&_.ant-input]:placeholder:text-gray-500 [&_.ant-input]:dark:placeholder:text-gray-400"
          />
          <Select
            placeholder="Filter by status"
            value={filterStatus}
            onChange={setFilterStatus}
            allowClear
            className="[&_.ant-select-selector]:bg-white [&_.ant-select-selector]:dark:bg-gray-700 [&_.ant-select-selector]:border-gray-300 [&_.ant-select-selector]:dark:border-gray-600 [&_.ant-select-selection-placeholder]:text-gray-500 [&_.ant-select-selection-placeholder]:dark:text-gray-400 [&_.ant-select-selection-item]:text-gray-900 [&_.ant-select-selection-item]:dark:text-gray-100"
            dropdownClassName="bg-white dark:bg-gray-800 [&_.ant-select-item]:text-gray-900 [&_.ant-select-item]:dark:text-gray-100 [&_.ant-select-item-option-selected]:bg-blue-50 [&_.ant-select-item-option-selected]:dark:bg-gray-600"
          >
            <Option value="DRAFT">Draft</Option>
            <Option value="PUBLISHED">Published</Option>
          </Select>
          <Select
            placeholder="Filter by category"
            value={filterCategory}
            onChange={setFilterCategory}
            allowClear
            className="[&_.ant-select-selector]:bg-white [&_.ant-select-selector]:dark:bg-gray-700 [&_.ant-select-selector]:border-gray-300 [&_.ant-select-selector]:dark:border-gray-600 [&_.ant-select-selection-placeholder]:text-gray-500 [&_.ant-select-selection-placeholder]:dark:text-gray-400 [&_.ant-select-selection-item]:text-gray-900 [&_.ant-select-selection-item]:dark:text-gray-100"
            dropdownClassName="bg-white dark:bg-gray-800 [&_.ant-select-item]:text-gray-900 [&_.ant-select-item]:dark:text-gray-100 [&_.ant-select-item-option-selected]:bg-blue-50 [&_.ant-select-item-option-selected]:dark:bg-gray-600"
          >
            <Option value="ANNOUNCEMENT">Announcement</Option>
            <Option value="GUIDE">Guide</Option>
            <Option value="NEWS">News</Option>
          </Select>
          <Button
            onClick={handleClearFilters}
            className="bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-500 hover:bg-gray-200 dark:hover:bg-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
          >
            Clear Filters
          </Button>
        </div>

        {/* Table */}
        <div className="[&_.ant-pagination-total-text]:text-gray-700 [&_.ant-pagination-total-text]:dark:!text-gray-300 [&_.ant-table]:bg-white [&_.ant-table]:dark:bg-gray-800 [&_.ant-table-thead>tr>th]:bg-gray-50 [&_.ant-table-thead>tr>th]:dark:bg-gray-700 [&_.ant-table-thead>tr>th]:text-gray-900 [&_.ant-table-thead>tr>th]:dark:text-gray-100 [&_.ant-table-tbody>tr>td]:bg-white [&_.ant-table-tbody>tr>td]:dark:bg-gray-800 [&_.ant-table-tbody>tr>td]:text-gray-900 [&_.ant-table-tbody>tr>td]:dark:text-gray-100 [&_.ant-table-tbody>tr>td]:border-gray-200 [&_.ant-table-tbody>tr>td]:dark:border-gray-600 [&_.ant-table-tbody>tr:hover>td]:bg-gray-50 [&_.ant-table-tbody>tr:hover>td]:dark:bg-gray-700">
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
            className="[&_.ant-table-container]:bg-white [&_.ant-table-container]:dark:bg-gray-800"
          />
        </div>
      </Card>

      {/* Preview Modal */}
      <Modal
        title={
          <span className="text-gray-900 dark:text-gray-100">
            Preview: {previewBlog?.title}
          </span>
        }
        open={!!previewBlog}
        onCancel={() => setPreviewBlog(null)}
        footer={[
          <Button
            key="close"
            onClick={() => setPreviewBlog(null)}
            className="bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-500 hover:bg-gray-200 dark:hover:bg-gray-500"
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
        className="[&_.ant-modal-content]:bg-white [&_.ant-modal-content]:dark:bg-gray-800 [&_.ant-modal-header]:bg-white [&_.ant-modal-header]:dark:bg-gray-800 [&_.ant-modal-header]:border-gray-200 [&_.ant-modal-header]:dark:border-gray-600 [&_.ant-modal-body]:bg-white [&_.ant-modal-body]:dark:bg-gray-800 [&_.ant-modal-footer]:bg-white [&_.ant-modal-footer]:dark:bg-gray-800 [&_.ant-modal-footer]:border-gray-200 [&_.ant-modal-footer]:dark:border-gray-600"
      >
        {previewBlog && (
          <div className="space-y-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
            <div className="flex flex-wrap items-center gap-2">
              <strong className="text-gray-900 dark:text-gray-100">
                Category:
              </strong>
              <Tag
                color="blue"
                className="bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700"
              >
                {previewBlog.category}
              </Tag>
              <strong className="ml-2 text-gray-900 dark:text-gray-100">
                Status:
              </strong>
              <Tag
                color={previewBlog.status === "PUBLISHED" ? "green" : "orange"}
                className={
                  previewBlog.status === "PUBLISHED"
                    ? "bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700"
                    : "bg-orange-50 dark:bg-orange-900 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700"
                }
              >
                {previewBlog.status}
              </Tag>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
              <strong className="text-gray-900 dark:text-gray-100">
                Slug:
              </strong>{" "}
              <span className="font-mono text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">
                {previewBlog.slug}
              </span>
            </div>
            {previewBlog.thumbnailUrl && (
              <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                <strong className="text-gray-900 dark:text-gray-100">
                  Thumbnail:
                </strong>
                <div className="mt-2">
                  <img
                    src={previewBlog.thumbnailUrl}
                    alt="Thumbnail"
                    className="w-32 h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm"
                  />
                </div>
              </div>
            )}
            <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
              <strong className="text-gray-900 dark:text-gray-100 block mb-2">
                Content Preview:
              </strong>
              <div
                className="mt-2 border rounded-lg p-4 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 blog-content max-h-96 overflow-y-auto [&_h1]:text-gray-900 [&_h1]:dark:text-gray-100 [&_h2]:text-gray-900 [&_h2]:dark:text-gray-100 [&_h3]:text-gray-900 [&_h3]:dark:text-gray-100 [&_h4]:text-gray-900 [&_h4]:dark:text-gray-100 [&_h5]:text-gray-900 [&_h5]:dark:text-gray-100 [&_h6]:text-gray-900 [&_h6]:dark:text-gray-100 [&_p]:text-gray-800 [&_p]:dark:text-gray-200 [&_a]:text-blue-600 [&_a]:dark:text-blue-400 [&_code]:bg-gray-200 [&_code]:dark:bg-gray-600 [&_code]:text-gray-800 [&_code]:dark:text-gray-200 [&_pre]:bg-gray-200 [&_pre]:dark:bg-gray-600 [&_blockquote]:border-gray-300 [&_blockquote]:dark:border-gray-600 [&_blockquote]:bg-gray-100 [&_blockquote]:dark:bg-gray-600 [&_table]:border-gray-200 [&_table]:dark:border-gray-600 [&_th]:bg-gray-100 [&_th]:dark:bg-gray-600 [&_td]:border-gray-200 [&_td]:dark:border-gray-600"
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
