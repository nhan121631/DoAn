/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Layout, theme, Form, message } from "antd";
import TableManagePostType from "../components/TableManagePostType";
import ModelCreatePostType from "../components/ModalAddPostType";
import { useState } from "react";
import { createTypePost } from "../service/TypePostService";

const { Content } = Layout;

const ManagePostTypePage = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const [messageApi, contextHolder] = message.useMessage();

  // Modal state
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [refreshKey, setRefreshKey] = useState(0);

  // Handle create post type
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCreate = async () => {
    form.validateFields().then(async (values) => {
      try {
        await createTypePost(values);
        setRefreshKey((prev) => prev + 1);
        setErrorMessage(null);
        messageApi.success({
          content: "You created a new post type successfully!",
          duration: 1.5,
        });
        setOpen(false);
        form.resetFields();
      } catch (error: any) {
        // Nếu lỗi trả về dạng { message: [...] }
        if (error?.response?.data?.message) {
          setErrorMessage(error.response.data.message.join(", "));
        } else {
          setErrorMessage("Đã có lỗi xảy ra!");
        }
      }
    });
  };

  return (
    <Content
      className="mx-4 my-6 p-6 min-h-[280px] dark:!bg-[#171f2f] dark:!text-white"
      style={{
        background: colorBgContainer,
        borderRadius: borderRadiusLG,
      }}
    >
      {contextHolder}

      <h2 className="text-xl font-semibold mb-4 dark:text-white">
        Post Type Management
      </h2>
      <Button type="primary" className="mb-4" onClick={() => setOpen(true)}>
        Create Post Type
      </Button>
      <TableManagePostType refreshKey={refreshKey} messageApi={messageApi} />
      <ModelCreatePostType
        open={open}
        setOpen={setOpen}
        form={form}
        handleCreate={handleCreate}
        errorMessage={errorMessage}
      />
    </Content>
  );
};

export default ManagePostTypePage;
