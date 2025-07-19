import { Layout, theme } from "antd";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { MdAccountCircle } from "react-icons/md";
import { RiFileListLine } from "react-icons/ri";
import { TbClockCheck } from "react-icons/tb";
import TableManageRoom from "../components/TableManageRoom";

const { Content } = Layout;

function StatisticPage() {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Content className="mx-4 my-6 min-h-[280px]">
      <div className="flex flex-col md:flex-row gap-6">
        <div
          className="p-6 flex-1 dark:!bg-[#171f2f] dark:!text-white"
          style={{
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <div className="flex justify-between">
            <div className="flex flex-col font-semibold justify-between gap-y-10">
              <span className="text-xl">Account</span>
              <span className="text-3xl">10</span>
            </div>
            <div className="flex text-6xl text-sky-600 dark:text-sky-400">
              <MdAccountCircle />
            </div>
          </div>
        </div>
        <div
          className="p-6 flex-1 dark:!bg-[#171f2f] dark:!text-white"
          style={{
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <div className="flex justify-between">
            <div className="flex flex-col font-semibold justify-between gap-y-10">
              <span className="text-xl">Approved Post</span>
              <span className="text-3xl">17</span>
            </div>
            <div className="flex text-6xl text-green-500 dark:text-green-400">
              <AiOutlineCheckCircle />
            </div>
          </div>
        </div>
        <div
          className="p-6 flex-1 dark:!bg-[#171f2f] dark:!text-white"
          style={{
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <div className="flex justify-between">
            <div className="flex flex-col font-semibold justify-between gap-y-10">
              <span className="text-xl">Pending Approval</span>
              <span className="text-3xl">10</span>
            </div>
            <div className="flex text-6xl text-amber-500 dark:text-amber-400">
              <TbClockCheck />
            </div>
          </div>
        </div>
        <div
          className="p-6 flex-1 dark:!bg-[#171f2f] dark:!text-white"
          style={{
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <div className="flex justify-between">
            <div className="flex flex-col font-semibold justify-between gap-y-10">
              <span className="text-xl">Total Posts</span>
              <span className="text-3xl">10</span>
            </div>
            <div className="flex text-6xl text-sky-600 dark:text-sky-400">
              <RiFileListLine />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white dark:bg-[#171f2f] rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">
          Room Management
        </h2>
        <TableManageRoom />
      </div>
    </Content>
  );
}

export default StatisticPage;
