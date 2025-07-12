import { Layout, theme } from "antd";

const { Content } = Layout;

function HomePage() {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Content
      className="mx-4 my-6 p-6 min-h-[280px] dark:!bg-[#001529] dark:!text-white"
      style={{
        background: colorBgContainer,
        borderRadius: borderRadiusLG,
      }}
    >
      Home Page
    </Content>
  );
}

export default HomePage;
