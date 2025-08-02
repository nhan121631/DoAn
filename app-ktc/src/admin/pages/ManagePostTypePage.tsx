import { Layout, theme } from "antd";
import TableManagePostType from "../components/TableManagePostType";

const { Content } = Layout;

const ManagePostTypePage = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

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
      <TableManagePostType />
    </Content>
  );
};

export default ManagePostTypePage;
