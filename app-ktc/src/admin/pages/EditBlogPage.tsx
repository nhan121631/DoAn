import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  Typography,
  message,
  Row,
  Col,
  Spin,
} from 'antd';
import { SaveOutlined, EyeOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { getBlogBySlugQueryOptions, useUpdateBlog } from '../service/ReactQueryBlog';
import type { BlogUpdateRequest, BlogCategory, BlogStatus } from '../types/type';
import TinyMCEEditor from '../components/TinyMCEEditor';
import { processHtmlForDisplay } from '../utils/html-processor';
import '../styles/blog-content.css';

const { Title } = Typography;
const { Option } = Select;

interface BlogFormData {
  title: string;
  slug: string;
  content: string;
  category: BlogCategory;
  status: BlogStatus;
}

const EditBlogPage = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const [form] = Form.useForm<BlogFormData>();
  const [previewContent, setPreviewContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Query to get blog data
  const {
    data: blog,
    isLoading,
    error,
  } = useQuery(getBlogBySlugQueryOptions(slug!));

  // Update mutation
  const updateBlogMutation = useUpdateBlog({
    mutationConfig: {
      onSuccess: () => {
        message.success('Blog updated successfully!');
        navigate('/admin/manage-blogs');
      },
      onError: (error: any) => {
        console.error('Update blog error:', error);
        
        let errorMessage = 'Failed to update blog';
        
        if (error?.response?.data) {
          const serverError = error.response.data;
          
          if (serverError.message) {
            errorMessage = serverError.message;
          } else if (serverError.error) {
            errorMessage = serverError.error;
          } else if (typeof serverError === 'string') {
            errorMessage = serverError;
          } else {
            errorMessage = `Server error (${error.response.status})`;
          }
        } else if (error?.message) {
          errorMessage = error.message;
        }
        
        message.error(`Failed to update blog: ${errorMessage}`);
      },
    },
  });

  // Populate form when blog data is loaded
  useEffect(() => {
    if (blog) {
      form.setFieldsValue({
        title: blog.title,
        slug: blog.slug,
        content: blog.content,
        category: blog.category,
        status: blog.status,
      });
    }
  }, [blog, form]);

  // Auto-generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const slug = generateSlug(title);
    form.setFieldsValue({ slug });
  };

  const handleSubmit = (values: BlogFormData) => {
    if (!blog?.id) {
      message.error('Blog ID not found!');
      return;
    }

    console.log('📝 Form values:', values);
    console.log('📋 Blog ID:', blog.id);

    // Validate slug format
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(values.slug)) {
      message.error('Slug can only contain lowercase letters, numbers, and hyphens!');
      return;
    }

    const request: BlogUpdateRequest = {
      title: values.title,
      slug: values.slug,
      content: values.content,
      category: values.category,
      status: values.status,
    };

    console.log('🚀 Updating blog with request:', request);

    updateBlogMutation.mutate({
      id: blog.id,
      request,
    });
  };

  const handlePreview = () => {
    const content = form.getFieldValue('content') || '';
    setPreviewContent(content);
    setShowPreview(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="p-6">
        <Card>
          <div className="text-center">
            <Title level={3}>Blog not found</Title>
            <p>The blog you're looking for doesn't exist or has been deleted.</p>
            <Button type="primary" onClick={() => navigate('/admin/manage-blogs')}>
              Back to Blog List
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <Title level={2}>Edit Blog</Title>
          <div className="space-x-2">
            <Button onClick={handlePreview} icon={<EyeOutlined />}>
              Preview
            </Button>
            <Button onClick={() => navigate('/admin/manage-blogs')}>
              Cancel
            </Button>
          </div>
        </div>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={24}>
            <Col span={16}>
              <Form.Item
                label="Title"
                name="title"
                rules={[
                  { required: true, message: 'Please enter title!' },
                  { max: 255, message: 'Title cannot exceed 255 characters!' },
                ]}
              >
                <Input 
                  placeholder="Enter blog title..." 
                  size="large"
                  onChange={handleTitleChange}
                />
              </Form.Item>

              <Form.Item
                label="Slug"
                name="slug"
                rules={[
                  { required: true, message: 'Please enter slug!' },
                  { max: 255, message: 'Slug cannot exceed 255 characters!' },
                  { 
                    pattern: /^[a-z0-9-]+$/,
                    message: 'Slug can only contain lowercase letters, numbers, and hyphens!'
                  },
                ]}
              >
                <Input 
                  placeholder="blog-slug-example" 
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label="Content"
                name="content"
                rules={[{ required: true, message: 'Please enter content!' }]}
              >
                <TinyMCEEditor
                  value={form.getFieldValue('content') || ''}
                  onChange={(content) => form.setFieldValue('content', content)}
                  placeholder="Enter your blog content here..."
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label="Category"
                name="category"
                rules={[{ required: true, message: 'Please select category!' }]}
              >
                <Select size="large">
                  <Option value="ANNOUNCEMENT">Announcement</Option>
                  <Option value="GUIDE">Guide</Option>
                  <Option value="NEWS">News</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Status"
                name="status"
                rules={[{ required: true, message: 'Please select status!' }]}
              >
                <Select size="large">
                  <Option value="DRAFT">Draft</Option>
                  <Option value="PUBLISHED">Published</Option>
                </Select>
              </Form.Item>

              {/* Display current thumbnail if exists */}
              {blog.thumbnailUrl && (
                <Form.Item label="Current Thumbnail">
                  <div className="border rounded-lg p-4">
                    <img
                      src={blog.thumbnailUrl}
                      alt="Current thumbnail"
                      className="w-full h-32 object-cover rounded"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Thumbnail is managed by backend
                    </p>
                  </div>
                </Form.Item>
              )}

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <Title level={5} className="text-green-700 mb-2">✏️ Editing Tips</Title>
                <ul className="text-sm text-green-600 space-y-1">
                  <li>• Changes are saved immediately</li>
                  <li>• Images uploaded remain in content</li>
                  <li>• Preview changes before saving</li>
                  <li>• Slug affects the blog URL</li>
                  <li>• Status controls visibility</li>
                </ul>
              </div>

              <Form.Item className="mt-8">
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  icon={<SaveOutlined />}
                  loading={updateBlogMutation.isPending}
                >
                  Update Blog
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-3/4 h-3/4 overflow-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <Title level={3}>Content Preview</Title>
              <Button onClick={() => setShowPreview(false)}>Close</Button>
            </div>
            <div
              className="prose max-w-none blog-content"
              dangerouslySetInnerHTML={{ __html: processHtmlForDisplay(previewContent) }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EditBlogPage;