import { Button, Layout, theme, Form } from "antd";
import TableManagePostType from "../components/TableManagePostType";
import ModelCreatePostType from "../components/ModelAddPostType";
import { useState } from "react";

const { Content } = Layout;

const ManagePostTypePage = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Modal state
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  

  // Handle create post type
  const handleCreate = () => {
    form.validateFields().then((values) => {
      console.log("Create Post Type:", values);
      setOpen(false);
      form.resetFields();
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
      <h2 className="text-xl font-semibold mb-4 dark:text-white">
        Post Type Management
      </h2>
      <Button type="primary" className="mb-4" onClick={() => setOpen(true)}>
        Create Post Type
      </Button>
      <TableManagePostType />
      <ModelCreatePostType
        open={open}
        setOpen={setOpen}
        form={form}
        handleCreate={handleCreate}
      />
    </Content>
  );
};

export default ManagePostTypePage;
