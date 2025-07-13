import { Layout, theme } from "antd";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { MdAccountCircle } from "react-icons/md";
import { RiFileListLine } from "react-icons/ri";
import { TbClockCheck } from "react-icons/tb";

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
          Bảng dữ liệu
        </h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="border-b p-2 dark:text-white">STT</th>
              <th className="border-b p-2 dark:text-white">Tên</th>
              <th className="border-b p-2 dark:text-white">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 border-b dark:text-white">1</td>
              <td className="p-2 border-b dark:text-white">Nguyễn Văn A</td>
              <td className="p-2 border-b dark:text-white">Đã duyệt</td>
            </tr>
            <tr>
              <td className="p-2 border-b dark:text-white">2</td>
              <td className="p-2 border-b dark:text-white">Trần Thị B</td>
              <td className="p-2 border-b dark:text-white">Chờ duyệt</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Content>
  );
}

export default StatisticPage;
