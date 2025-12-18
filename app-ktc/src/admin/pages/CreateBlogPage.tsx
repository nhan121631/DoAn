/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useNavigate } from "react-router";
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
} from "antd";
import { SaveOutlined, EyeOutlined } from "@ant-design/icons";
import { useCreateBlog } from "../service/ReactQueryBlog";
import type { BlogCreateRequest, BlogCategory } from "../types/type";
import { useAuthStore } from "../stores/useAuthorStore";
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
}

const CreateBlogPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm<BlogFormData>();
  const { loggedInUser } = useAuthStore();
  const [previewContent, setPreviewContent] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  // Mutations
  const createBlogMutation = useCreateBlog({
    mutationConfig: {
      onSuccess: () => {
        message.success("Blog đã được tạo thành công!");
        navigate("/admin/manage-blogs");
      },
      onError: (error: any) => {
        console.error("Create blog error in component:", error);

        let errorMessage = "Đã xảy ra lỗi khi tạo blog.";

        if (error?.response?.data) {
          const serverError = error.response.data;
          console.error("Chi tiết lỗi từ server:", serverError);

          if (serverError.message) {
            errorMessage = serverError.message;
          } else if (serverError.error) {
            errorMessage = serverError.error;
          } else if (typeof serverError === "string") {
            errorMessage = serverError;
          } else {
            errorMessage = `Lỗi server (${error.response.status})`;
          }
        } else if (error?.message) {
          errorMessage = error.message;
        }

        message.error(`Không thể tạo blog: ${errorMessage}`);
      },
    },
  });

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
    if (!loggedInUser?.id) {
      message.error("Không thể xác định người dùng!");
      return;
    }

    console.log("Form values submitted:", values);
    console.log("Current user ID:", loggedInUser.id);

    // Validate form data before sending
    if (!values.title?.trim()) {
      message.error("Tiêu đề là bắt buộc và không được để trống!");
      return;
    }

    if (!values.slug?.trim()) {
      message.error("Slug là bắt buộc và không được để trống!");
      return;
    }

    if (!values.content?.trim()) {
      message.error("Nội dung là bắt buộc và không được để trống!");
      return;
    }

    if (!values.category) {
      message.error("Danh mục là bắt buộc!");
      return;
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(values.slug)) {
      message.error(
        "Slug chỉ được chứa các chữ cái thường, số và dấu gạch ngang!"
      );
      return;
    }

    const request: BlogCreateRequest = {
      title: values.title.trim(),
      slug: values.slug.trim(),
      content: values.content,
      category: values.category,
    };

    console.log("Sending blog creation request:", request);

    createBlogMutation.mutate({
      request,
      authorId: loggedInUser.id,
    });
  };

  const handlePreview = () => {
    const content = form.getFieldValue("content") || "";
    setPreviewContent(content);
    setShowPreview(true);
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <Title level={2} className="text-gray-900 dark:!text-gray-100">
            Tạo Blog Mới
          </Title>
          <div className="space-x-2">
            <Button
              onClick={handlePreview}
              icon={<EyeOutlined />}
              className="bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-500"
            >
              Xem trước
            </Button>
            <Button
              onClick={() => navigate("/admin/manage-blogs")}
              className="bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-500"
            >
              Hủy
            </Button>
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            category: "NEWS",
          }}
        >
          <Row gutter={24}>
            <Col span={16}>
              <Form.Item
                label={
                  <span className="text-gray-900 dark:text-gray-100">
                    Tiêu đề
                  </span>
                }
                name="title"
                rules={[
                  { required: true, message: "Vui lòng nhập tiêu đề!" },
                  {
                    max: 255,
                    message: "Tiêu đề không được vượt quá 255 ký tự!",
                  },
                ]}
              >
                <Input
                  placeholder="Nhập tiêu đề blog..."
                  size="large"
                  onChange={handleTitleChange}
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                />
              </Form.Item>

              <Form.Item
                label={
                  <span className="text-gray-900 dark:text-gray-100">Slug</span>
                }
                name="slug"
                rules={[
                  { required: true, message: "Vui lòng nhập slug!" },
                  { max: 255, message: "Slug không được vượt quá 255 ký tự!" },
                  {
                    pattern: /^[a-z0-9-]+$/,
                    message:
                      "Slug can only contain lowercase letters, numbers, and hyphens!",
                  },
                ]}
              >
                <Input
                  placeholder="blog-slug mẫu"
                  size="large"
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                />
              </Form.Item>

              <Form.Item
                label={
                  <span className="text-gray-900 dark:text-gray-100">
                    Nội dung Blog
                  </span>
                }
                name="content"
                rules={[{ required: true, message: "Vui lòng nhập nội dung!" }]}
              >
                <TinyMCEEditor
                  value={form.getFieldValue("content") || ""}
                  onChange={(content) => form.setFieldValue("content", content)}
                  placeholder="Nhập nội dung blog của bạn ở đây..."
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label={
                  <span className="text-gray-900 dark:text-gray-100">
                    Danh mục
                  </span>
                }
                name="category"
                rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}
              >
                <Select
                  size="large"
                  className="bg-white dark:bg-gray-700"
                  dropdownClassName="bg-white dark:bg-gray-800"
                >
                  <Option value="ANNOUNCEMENT">Thông báo</Option>
                  <Option value="GUIDE">Hướng dẫn</Option>
                  <Option value="NEWS">Tin tức</Option>
                </Select>
              </Form.Item>

              <div className="bg-blue-50 dark:bg-gray-700 border border-blue-200 dark:border-gray-600 rounded-lg p-4 mb-4">
                <Title
                  level={5}
                  className="text-blue-700 dark:text-blue-400 mb-2"
                >
                  Mẹo tạo Blog
                </Title>
                <ul className="text-sm text-blue-600 dark:text-blue-300 space-y-1">
                  <li>
                    • Sử dụng trình soạn thảo TinyMCE để định dạng phong phú
                  </li>
                  <li>• Tải hình ảnh trực tiếp trong trình soạn thảo</li>
                  <li>• Hình ảnh được tối ưu hóa tự động</li>
                  <li>• Slug được tạo tự động từ tiêu đề</li>
                  <li>• Xem trước trước khi xuất bản</li>
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
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  Tạo Blog
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-3/4 h-3/4 overflow-auto p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <Title level={3} className="text-gray-900 dark:!text-gray-100">
                Xem trước nội dung
              </Title>
              <Button
                onClick={() => setShowPreview(false)}
                className="bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-500"
              >
                Đóng
              </Button>
            </div>
            <div
              className="prose max-w-none blog-content dark:prose-invert"
              dangerouslySetInnerHTML={{
                __html: processHtmlForDisplay(previewContent),
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateBlogPage;
