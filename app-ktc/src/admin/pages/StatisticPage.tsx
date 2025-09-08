import { Layout, theme } from "antd";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { MdAccountCircle } from "react-icons/md";
import { RiFileListLine } from "react-icons/ri";
import { TbClockCheck } from "react-icons/tb";
import { useQuery } from "@tanstack/react-query";
import { useCountActiveUsers } from "../service/ReactQueryAccount";
import {
  useCountAcceptedRoomsQueryOptions,
  useCountPendingRoomsQueryOptions,
  useCountTotalRoomsQueryOptions,
} from "../service/ReactQueryRoom";
import {
  MonthlyTransactionChart,
  MonthlyUserRegistrationChart,
  RoomsByProvinceChart,
  TopLandlordsChart,
} from "../components/statistics";

const { Content } = Layout;

function StatisticPage() {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const { data: activeUsersCount } = useQuery(useCountActiveUsers());
  const { data: acceptedRoomsCount } = useQuery(
    useCountAcceptedRoomsQueryOptions()
  );
  const { data: pendingRoomsCount } = useQuery(
    useCountPendingRoomsQueryOptions()
  );
  const { data: totalRoomsCount } = useQuery(useCountTotalRoomsQueryOptions());

  return (
    <Content className="mx-4 my-6 min-h-[280px]">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Statistics Dashboard
        </h1>
      </div>
      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div
          className="p-6 dark:!bg-[#171f2f] dark:!text-white transition-all duration-300 hover:shadow-lg"
          style={{
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <div className="flex justify-between items-center">
            <div className="flex flex-col justify-between gap-y-4">
              <span className="text-lg font-medium text-gray-600 dark:text-gray-300">
                Active Users
              </span>
              <span className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                {activeUsersCount?.data || activeUsersCount || 0}
              </span>
            </div>
            <div className="flex text-5xl lg:text-6xl text-sky-600 dark:text-sky-400">
              <MdAccountCircle />
            </div>
          </div>
        </div>

        <div
          className="p-6 dark:!bg-[#171f2f] dark:!text-white transition-all duration-300 hover:shadow-lg"
          style={{
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <div className="flex justify-between items-center">
            <div className="flex flex-col justify-between gap-y-4">
              <span className="text-lg font-medium text-gray-600 dark:text-gray-300">
                Approved Posts
              </span>
              <span className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                {acceptedRoomsCount || 0}
              </span>
            </div>
            <div className="flex text-5xl lg:text-6xl text-green-600 dark:text-green-400">
              <AiOutlineCheckCircle />
            </div>
          </div>
        </div>

        <div
          className="p-6 dark:!bg-[#171f2f] dark:!text-white transition-all duration-300 hover:shadow-lg"
          style={{
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <div className="flex justify-between items-center">
            <div className="flex flex-col justify-between gap-y-4">
              <span className="text-lg font-medium text-gray-600 dark:text-gray-300">
                Pending Posts
              </span>
              <span className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                {pendingRoomsCount || 0}
              </span>
            </div>
            <div className="flex text-5xl lg:text-6xl text-yellow-600 dark:text-yellow-400">
              <TbClockCheck />
            </div>
          </div>
        </div>

        <div
          className="p-6 dark:!bg-[#171f2f] dark:!text-white transition-all duration-300 hover:shadow-lg"
          style={{
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <div className="flex justify-between items-center">
            <div className="flex flex-col justify-between gap-y-4">
              <span className="text-lg font-medium text-gray-600 dark:text-gray-300">
                Total Posts
              </span>
              <span className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                {totalRoomsCount || 0}
              </span>
            </div>
            <div className="flex text-5xl lg:text-6xl text-purple-600 dark:text-purple-400">
              <RiFileListLine />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="space-y-6">
        {/* Top Row Charts - Full width for main charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <MonthlyTransactionChart />
          <MonthlyUserRegistrationChart />
        </div>

        {/* Bottom Row Charts - Optimized layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-1">
            <RoomsByProvinceChart />
          </div>
          <div className="xl:col-span-2">
            <TopLandlordsChart />
          </div>
        </div>
      </div>
    </Content>
  );
}

export default StatisticPage;
