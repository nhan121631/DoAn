import { Layout, theme } from "antd";
import TableManageAccount from "../components/TableManageAccount";

const { Content } = Layout;

const ManageAccountPage = () => {
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
      <h2 className="mb-4 text-2xl font-semibold dark:text-white">
        Account Management
      </h2>
      <TableManageAccount />
    </Content>
  );
};

export default ManageAccountPage;
