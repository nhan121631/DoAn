import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
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
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { getBlogsQueryOptions, useDeleteBlog } from '../service/ReactQueryBlog';
import type { BlogResponse, BlogCategory, BlogStatus } from '../types/type';
import { processHtmlForDisplay } from '../utils/html-processor';
import '../styles/blog-content.css';

const { Title } = Typography;
const { Option } = Select;

const ManageBlogPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [searchTitle, setSearchTitle] = useState('');
  const [filterStatus, setFilterStatus] = useState<BlogStatus | undefined>();
  const [filterCategory, setFilterCategory] = useState<BlogCategory | undefined>();
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
        console.log('Blog deleted successfully!');
        message.success('Blog deleted successfully!');
      },
      onError: (error: any) => {
        console.error('Delete error:', error);
        message.error(`Failed to delete blog: ${error?.message || 'Unknown error'}`);
      },
    },
  });

  const handlePreview = (blog: BlogResponse) => {
    setPreviewBlog(blog);
  };

  const handleClearFilters = () => {
    setSearchTitle('');
    setFilterStatus(undefined);
    setFilterCategory(undefined);
    setPage(0);
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (title: string) => (
        <span className="font-medium text-gray-900">{title}</span>
      ),
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      render: (slug: string) => (
        <span className="text-blue-600 font-mono text-sm">{slug}</span>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category: BlogCategory) => {
        const colors = {
          ANNOUNCEMENT: 'orange',
          GUIDE: 'blue',
          NEWS: 'green',
        } as const;
        return <Tag color={colors[category]}>{category}</Tag>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: BlogStatus) => (
        <Tag color={status === 'PUBLISHED' ? 'green' : 'orange'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
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
              console.log('Deleting blog:', record.id);
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

  const filteredBlogs = blogsResponse?.content.filter((blog) =>
    blog.title.toLowerCase().includes(searchTitle.toLowerCase())
  ) || [];

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <div className="text-center">
            <Title level={3}>Error Loading Blogs</Title>
            <p>Unable to load blogs. Please try again later.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <Title level={2}>Blog Management</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/admin/manage-blogs/create')}
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
          />
          <Select
            placeholder="Filter by status"
            value={filterStatus}
            onChange={setFilterStatus}
            allowClear
          >
            <Option value="DRAFT">Draft</Option>
            <Option value="PUBLISHED">Published</Option>
          </Select>
          <Select
            placeholder="Filter by category"
            value={filterCategory}
            onChange={setFilterCategory}
            allowClear
          >
            <Option value="ANNOUNCEMENT">Announcement</Option>
            <Option value="GUIDE">Guide</Option>
            <Option value="NEWS">News</Option>
          </Select>
          <Button onClick={handleClearFilters}>Clear Filters</Button>
        </div>

        {/* Table */}
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
      </Card>

      {/* Preview Modal */}
      <Modal
        title={`Preview: ${previewBlog?.title}`}
        open={!!previewBlog}
        onCancel={() => setPreviewBlog(null)}
        footer={[
          <Button key="close" onClick={() => setPreviewBlog(null)}>
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
          >
            Edit Blog
          </Button>,
        ]}
        width={800}
      >
        {previewBlog && (
          <div className="space-y-4">
            <div>
              <strong>Category:</strong>{' '}
              <Tag color="blue">{previewBlog.category}</Tag>
              <strong className="ml-4">Status:</strong>{' '}
              <Tag color={previewBlog.status === 'PUBLISHED' ? 'green' : 'orange'}>
                {previewBlog.status}
              </Tag>
            </div>
            <div>
              <strong>Slug:</strong>{' '}
              <span className="font-mono text-sm">{previewBlog.slug}</span>
            </div>
            {previewBlog.thumbnailUrl && (
              <div>
                <strong>Thumbnail:</strong>
                <div className="mt-2">
                  <img
                    src={previewBlog.thumbnailUrl}
                    alt="Thumbnail"
                    className="w-32 h-20 object-cover rounded"
                  />
                </div>
              </div>
            )}
            <div>
              <strong>Content:</strong>
              <div
                className="mt-2 border rounded p-4 bg-gray-50 blog-content"
                dangerouslySetInnerHTML={{ __html: processHtmlForDisplay(previewBlog.content) }}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManageBlogPage;