/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
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
} from "antd";
import { SaveOutlined, EyeOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import {
  getBlogBySlugQueryOptions,
  useUpdateBlog,
} from "../service/ReactQueryBlog";
import type {
  BlogUpdateRequest,
  BlogCategory,
  BlogStatus,
} from "../types/type";
import TinyMCEEditor from "../components/TinyMCEEditor";
import { processHtmlForDisplay } from "../utils/html-processor";
import "../styles/blog-content.css";

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
  const [previewContent, setPreviewContent] = useState("");
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
        message.success("Blog updated successfully!");
        navigate("/admin/manage-blogs");
      },
      onError: (error: any) => {
        console.error("Update blog error:", error);

        let errorMessage = "Failed to update blog";

        if (error?.response?.data) {
          const serverError = error.response.data;

          if (serverError.message) {
            errorMessage = serverError.message;
          } else if (serverError.error) {
            errorMessage = serverError.error;
          } else if (typeof serverError === "string") {
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
      .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single
      .trim();
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const slug = generateSlug(title);
    form.setFieldsValue({ slug });
  };

  const handleSubmit = (values: BlogFormData) => {
    if (!blog?.id) {
      message.error("Blog ID not found!");
      return;
    }

    console.log("📝 Form values:", values);
    console.log("📋 Blog ID:", blog.id);

    // Validate slug format
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(values.slug)) {
      message.error(
        "Slug can only contain lowercase letters, numbers, and hyphens!"
      );
      return;
    }

    const request: BlogUpdateRequest = {
      title: values.title,
      slug: values.slug,
      content: values.content,
      category: values.category,
      status: values.status,
    };

    console.log("🚀 Updating blog with request:", request);

    updateBlogMutation.mutate({
      id: blog.id,
      request,
    });
  };

  const handlePreview = () => {
    const content = form.getFieldValue("content") || "";
    setPreviewContent(content);
    setShowPreview(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96 bg-gray-50 dark:bg-gray-900">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <Title level={3} className="text-gray-900 dark:text-gray-100">
              Blog not found
            </Title>
            <p className="text-gray-600 dark:text-gray-400">
              The blog you're looking for doesn't exist or has been deleted.
            </p>
            <Button
              type="primary"
              onClick={() => navigate("/admin/manage-blogs")}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Back to Blog List
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <Title level={2} className="text-gray-900 dark:!text-gray-100">
            Edit Blog
          </Title>
          <div className="space-x-2">
            <Button
              onClick={handlePreview}
              icon={<EyeOutlined />}
              className="bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-500 hover:bg-gray-200 dark:hover:bg-gray-500"
            >
              Preview
            </Button>
            <Button
              onClick={() => navigate("/admin/manage-blogs")}
              className="bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-500 hover:bg-gray-200 dark:hover:bg-gray-500"
            >
              Cancel
            </Button>
          </div>
        </div>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={24}>
            <Col span={16}>
              <Form.Item
                label={
                  <span className="text-gray-900 dark:text-gray-100">
                    Title
                  </span>
                }
                name="title"
                rules={[
                  { required: true, message: "Please enter title!" },
                  { max: 255, message: "Title cannot exceed 255 characters!" },
                ]}
              >
                <Input
                  placeholder="Enter blog title..."
                  size="large"
                  onChange={handleTitleChange}
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 [&_.ant-input]:bg-white [&_.ant-input]:dark:bg-gray-700 [&_.ant-input]:text-gray-900 [&_.ant-input]:dark:text-gray-100 [&_.ant-input]:placeholder:text-gray-500 [&_.ant-input]:dark:placeholder:text-gray-400"
                />
              </Form.Item>

              <Form.Item
                label={
                  <span className="text-gray-900 dark:text-gray-100">Slug</span>
                }
                name="slug"
                rules={[
                  { required: true, message: "Please enter slug!" },
                  { max: 255, message: "Slug cannot exceed 255 characters!" },
                  {
                    pattern: /^[a-z0-9-]+$/,
                    message:
                      "Slug can only contain lowercase letters, numbers, and hyphens!",
                  },
                ]}
              >
                <Input
                  placeholder="blog-slug-example"
                  size="large"
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 [&_.ant-input]:bg-white [&_.ant-input]:dark:bg-gray-700 [&_.ant-input]:text-gray-900 [&_.ant-input]:dark:text-gray-100 [&_.ant-input]:placeholder:text-gray-500 [&_.ant-input]:dark:placeholder:text-gray-400"
                />
              </Form.Item>

              <Form.Item
                label={
                  <span className="text-gray-900 dark:text-gray-100">
                    Content
                  </span>
                }
                name="content"
                rules={[{ required: true, message: "Please enter content!" }]}
              >
                <TinyMCEEditor
                  value={form.getFieldValue("content") || ""}
                  onChange={(content) => form.setFieldValue("content", content)}
                  placeholder="Enter your blog content here..."
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label={
                  <span className="text-gray-900 dark:text-gray-100">
                    Category
                  </span>
                }
                name="category"
                rules={[{ required: true, message: "Please select category!" }]}
              >
                <Select 
                  size="large"
                  className="[&_.ant-select-selector]:bg-white [&_.ant-select-selector]:dark:bg-gray-700 [&_.ant-select-selector]:border-gray-300 [&_.ant-select-selector]:dark:border-gray-600 [&_.ant-select-selection-item]:text-gray-900 [&_.ant-select-selection-item]:dark:text-gray-100"
                  dropdownClassName="bg-white dark:bg-gray-800 [&_.ant-select-item]:text-gray-900 [&_.ant-select-item]:dark:text-gray-100 [&_.ant-select-item-option-selected]:bg-blue-50 [&_.ant-select-item-option-selected]:dark:bg-gray-600"
                >
                  <Option value="ANNOUNCEMENT">Announcement</Option>
                  <Option value="GUIDE">Guide</Option>
                  <Option value="NEWS">News</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label={
                  <span className="text-gray-900 dark:text-gray-100">
                    Status
                  </span>
                }
                name="status"
                rules={[{ required: true, message: "Please select status!" }]}
              >
                <Select 
                  size="large"
                  className="[&_.ant-select-selector]:bg-white [&_.ant-select-selector]:dark:bg-gray-700 [&_.ant-select-selector]:border-gray-300 [&_.ant-select-selector]:dark:border-gray-600 [&_.ant-select-selection-item]:text-gray-900 [&_.ant-select-selection-item]:dark:text-gray-100"
                  dropdownClassName="bg-white dark:bg-gray-800 [&_.ant-select-item]:text-gray-900 [&_.ant-select-item]:dark:text-gray-100 [&_.ant-select-item-option-selected]:bg-blue-50 [&_.ant-select-item-option-selected]:dark:bg-gray-600"
                >
                  <Option value="DRAFT">Draft</Option>
                  <Option value="PUBLISHED">Published</Option>
                </Select>
              </Form.Item>

              {/* Display current thumbnail if exists */}
              {blog.thumbnailUrl && (
                <Form.Item
                  label={
                    <span className="text-gray-900 dark:text-gray-100">
                      Current Thumbnail
                    </span>
                  }
                >
                  <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-700">
                    <img
                      src={blog.thumbnailUrl}
                      alt="Current thumbnail"
                      className="w-full h-32 object-cover rounded border border-gray-200 dark:border-gray-600"
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Thumbnail is managed by backend
                    </p>
                  </div>
                </Form.Item>
              )}

              <div className="bg-green-50 dark:bg-gray-700 border border-green-200 dark:border-gray-600 rounded-lg p-4 mb-4">
                <Title
                  level={5}
                  className="text-green-700 dark:!text-green-400 mb-2"
                >
                  ✏️ Editing Tips
                </Title>
                <ul className="text-sm text-green-600 dark:text-green-300 space-y-1">
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
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-5xl h-5/6 flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-t-lg">
              <Title level={3} className="text-gray-900 dark:!text-gray-100 m-0">
                Content Preview
              </Title>
              <Button 
                onClick={() => setShowPreview(false)}
                className="bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-500 hover:bg-gray-200 dark:hover:bg-gray-500"
              >
                Close
              </Button>
            </div>
            
            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-6 bg-white dark:bg-gray-800">
              <div
                className="prose prose-lg max-w-none blog-content
                  [&_h1]:text-gray-900 [&_h1]:dark:text-gray-100 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4
                  [&_h2]:text-gray-900 [&_h2]:dark:text-gray-100 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3
                  [&_h3]:text-gray-900 [&_h3]:dark:text-gray-100 [&_h3]:text-lg [&_h3]:font-medium [&_h3]:mb-2
                  [&_h4]:text-gray-900 [&_h4]:dark:text-gray-100 [&_h4]:font-medium [&_h4]:mb-2
                  [&_h5]:text-gray-900 [&_h5]:dark:text-gray-100 [&_h5]:font-medium [&_h5]:mb-1
                  [&_h6]:text-gray-900 [&_h6]:dark:text-gray-100 [&_h6]:font-medium [&_h6]:mb-1
                  [&_p]:text-gray-800 [&_p]:dark:text-gray-200 [&_p]:mb-4 [&_p]:leading-relaxed
                  [&_a]:text-blue-600 [&_a]:dark:text-blue-400 [&_a]:underline [&_a]:hover:text-blue-800 [&_a]:dark:hover:text-blue-300
                  [&_strong]:text-gray-900 [&_strong]:dark:text-gray-100 [&_strong]:font-semibold
                  [&_em]:text-gray-800 [&_em]:dark:text-gray-200 [&_em]:italic
                  [&_code]:bg-gray-100 [&_code]:dark:bg-gray-700 [&_code]:text-gray-800 [&_code]:dark:text-gray-200 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono
                  [&_pre]:bg-gray-100 [&_pre]:dark:bg-gray-700 [&_pre]:text-gray-800 [&_pre]:dark:text-gray-200 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:mb-4
                  [&_pre_code]:bg-transparent [&_pre_code]:text-inherit [&_pre_code]:p-0
                  [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:dark:border-gray-600 [&_blockquote]:bg-gray-50 [&_blockquote]:dark:bg-gray-700 [&_blockquote]:pl-4 [&_blockquote]:py-2 [&_blockquote]:my-4 [&_blockquote]:text-gray-700 [&_blockquote]:dark:text-gray-300
                  [&_ul]:text-gray-800 [&_ul]:dark:text-gray-200 [&_ul]:mb-4 [&_ul]:pl-6
                  [&_ol]:text-gray-800 [&_ol]:dark:text-gray-200 [&_ol]:mb-4 [&_ol]:pl-6
                  [&_li]:mb-2 [&_li]:leading-relaxed
                  [&_table]:border-collapse [&_table]:border [&_table]:border-gray-200 [&_table]:dark:border-gray-600 [&_table]:w-full [&_table]:mb-4
                  [&_th]:bg-gray-100 [&_th]:dark:bg-gray-700 [&_th]:text-gray-900 [&_th]:dark:text-gray-100 [&_th]:p-3 [&_th]:text-left [&_th]:font-semibold [&_th]:border [&_th]:border-gray-200 [&_th]:dark:border-gray-600
                  [&_td]:text-gray-800 [&_td]:dark:text-gray-200 [&_td]:p-3 [&_td]:border [&_td]:border-gray-200 [&_td]:dark:border-gray-600
                  [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:shadow-md [&_img]:mb-4 [&_img]:mx-auto [&_img]:block
                  [&_hr]:border-gray-300 [&_hr]:dark:border-gray-600 [&_hr]:my-6
                "
                dangerouslySetInnerHTML={{
                  __html: processHtmlForDisplay(previewContent),
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditBlogPage;
