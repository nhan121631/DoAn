import { useState } from 'react';
import { useNavigate } from 'react-router';
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
} from 'antd';
import { SaveOutlined, EyeOutlined } from '@ant-design/icons';
import { useCreateBlog } from '../service/ReactQueryBlog';
import type { BlogCreateRequest, BlogCategory } from '../types/type';
import { useAuthStore } from '../stores/useAuthorStore';
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
}

const CreateBlogPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm<BlogFormData>();
  const { loggedInUser } = useAuthStore();
  const [previewContent, setPreviewContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Mutations
  const createBlogMutation = useCreateBlog({
    mutationConfig: {
      onSuccess: () => {
        message.success('Blog created successfully!');
        navigate('/admin/manage-blogs');
      },
      onError: (error: any) => {
        console.error('🔥 Create blog error in component:', error);
        
        let errorMessage = 'Failed to create blog';
        
        if (error?.response?.data) {
          const serverError = error.response.data;
          console.error('📊 Server error details:', serverError);
          
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
        
        message.error(`Failed to create blog: ${errorMessage}`);
      },
    },
  });

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
    if (!loggedInUser?.id) {
      message.error('Unable to identify user!');
      return;
    }

    console.log('📝 Form values submitted:', values);
    console.log('👤 Current user ID:', loggedInUser.id);

    // Validate form data before sending
    if (!values.title?.trim()) {
      message.error('Title is required and cannot be empty!');
      return;
    }

    if (!values.slug?.trim()) {
      message.error('Slug is required and cannot be empty!');
      return;
    }

    if (!values.content?.trim()) {
      message.error('Content is required and cannot be empty!');
      return;
    }

    if (!values.category) {
      message.error('Category is required!');
      return;
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(values.slug)) {
      message.error('Slug can only contain lowercase letters, numbers, and hyphens!');
      return;
    }

    const request: BlogCreateRequest = {
      title: values.title.trim(),
      slug: values.slug.trim(),
      content: values.content,
      category: values.category,
    };

    console.log('🚀 Sending blog creation request:', request);

    createBlogMutation.mutate({
      request,
      authorId: loggedInUser.id,
    });
  };

  const handlePreview = () => {
    const content = form.getFieldValue('content') || '';
    setPreviewContent(content);
    setShowPreview(true);
  };

  return (
    <div className="p-6">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <Title level={2}>Create New Blog</Title>
          <div className="space-x-2">
            <Button onClick={handlePreview} icon={<EyeOutlined />}>
              Preview
            </Button>
            <Button onClick={() => navigate('/admin/manage-blogs')}>
              Cancel
            </Button>
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            category: 'NEWS',
          }}
        >
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

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <Title level={5} className="text-blue-700 mb-2">📝 Blog Creation Tips</Title>
                <ul className="text-sm text-blue-600 space-y-1">
                  <li>• Use TinyMCE editor for rich formatting</li>
                  <li>• Upload images directly in the editor</li>
                  <li>• Images are automatically optimized</li>
                  <li>• Slug is auto-generated from title</li>
                  <li>• Preview before publishing</li>
                </ul>
              </div>

              <Form.Item className="mt-8">
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  icon={<SaveOutlined />}
                  loading={createBlogMutation.isPending}
                >
                  Create Blog
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

export default CreateBlogPage;