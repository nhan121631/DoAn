import { Layout, theme } from "antd";

const { Content } = Layout;

function StatisticPage() {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Content className="mx-4 my-6 min-h-[280px]">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          className="p-6 dark:!bg-[#171f2f] dark:!text-white"
          style={{
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          Box 1
        </div>
        <div
          className="p-6 dark:!bg-[#171f2f] dark:!text-white"
          style={{
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          Box 2
        </div>
        <div
          className="p-6 dark:!bg-[#171f2f] dark:!text-white"
          style={{
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          Box 3
        </div>
      </div>
    </Content>
  );
}

export default StatisticPage;
