/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, Spin, Form, Button, Space, Select } from "antd";
import { FilterOutlined } from "@ant-design/icons";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getMonthlyUserRegistrationsQueryOptions } from "../../service/ReactQueryStatistic";

interface MonthlyUserRegistrationChartProps {
  months?: number;
}

const MonthlyUserRegistrationChart = ({
  months: initialMonths = 6,
}: MonthlyUserRegistrationChartProps) => {
  const [months, setMonths] = useState(initialMonths);
  const [form] = Form.useForm();

  const {
    data: monthlyUsers,
    isLoading,
    error,
    isError,
  } = useQuery(getMonthlyUserRegistrationsQueryOptions(months));

  const handleApply = () => {
    form.validateFields().then((values) => {
      setMonths(values.months || 6);
    });
  };

  const handleReset = () => {
    setMonths(6);
    form.resetFields();
  };

  const controlsPanel = (
    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-3">
        <FilterOutlined className="text-blue-500 dark:text-blue-400" />
        <span className="font-medium text-gray-700 dark:text-gray-300">
          Chart Filters
        </span>
      </div>
      <Form
        form={form}
        layout="inline"
        initialValues={{ months: 6 }}
        className="flex items-center gap-3"
      >
        <Form.Item name="months" label="Months" className="mb-0">
          <Select placeholder="6" style={{ width: 70 }}>
            {Array.from({ length: 11 }, (_, i) => i + 2).map((month) => (
              <Select.Option key={month} value={month}>
                {month}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item className="mb-0">
          <Space size="small">
            <Button type="primary" size="small" onClick={handleApply}>
              Apply
            </Button>
            <Button size="small" onClick={handleReset}>
              Reset
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );

  // Debug logging
  console.log("MonthlyUsers - Data:", monthlyUsers);
  console.log("MonthlyUsers - Loading:", isLoading);
  console.log("MonthlyUsers - Error:", error);

  // Fallback data for testing
  const fallbackData = [
    { month: "2024-01", userCount: 45 },
    { month: "2024-02", userCount: 67 },
    { month: "2024-03", userCount: 52 },
    { month: "2024-04", userCount: 89 },
    { month: "2024-05", userCount: 76 },
    { month: "2024-06", userCount: 93 },
  ];

  // Show error state with better handling
  if (isError) {
    console.error("API Error:", error);
    const isConnectionError =
      (error as any)?.code === "ERR_NETWORK" ||
      error?.message?.includes("Network Error");

    return (
      <div className="h-full flex flex-col">
        {controlsPanel}
        <Card
          title={`Monthly User Registrations ${
            isConnectionError
              ? "(Demo Data - Backend Offline)"
              : "(Error - Using Demo Data)"
          }`}
          className="flex-1 flex flex-col"
          headStyle={{ color: "var(--text-color)" }}
          bodyStyle={{
            padding: 16,
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            className={`text-center mb-4 ${
              isConnectionError ? "text-orange-500" : "text-red-500"
            }`}
          >
            {isConnectionError
              ? "⚠️ Backend server is not running. Showing demo data."
              : "❌ API Error: Using demo data. Check console for details."}
          </div>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={fallbackData}>
                <defs>
                  <linearGradient
                    id="colorUserCountError"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={isConnectionError ? "#faad14" : "#ff4d4f"}
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor={isConnectionError ? "#faad14" : "#ff4d4f"}
                      stopOpacity={0.2}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(0,0,0,0.1)"
                  className="!dark:stroke-gray-600"
                />
                <XAxis
                  dataKey="month"
                  stroke="#666"
                  fontSize={12}
                  className="!dark:stroke-gray-400"
                />
                <YAxis
                  stroke="#666"
                  fontSize={12}
                  className="!dark:stroke-gray-400"
                />
                <Tooltip
                  formatter={(value) => [value, "New Users"]}
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "none",
                    borderRadius: "12px",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
                    color: "#000",
                  }}
                  wrapperClassName="!dark:[&>div]:!bg-gray-800 !dark:[&>div]:!text-white"
                />
                <Area
                  type="monotone"
                  dataKey="userCount"
                  stroke={isConnectionError ? "#faad14" : "#ff4d4f"}
                  strokeWidth={3}
                  fill="url(#colorUserCountError)"
                  dot={{
                    fill: isConnectionError ? "#faad14" : "#ff4d4f",
                    strokeWidth: 2,
                    r: 6,
                  }}
                  activeDot={{
                    r: 8,
                    fill: isConnectionError ? "#faad14" : "#ff4d4f",
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        {controlsPanel}
        <Card
          title="Monthly User Registrations"
          className="flex-1 flex flex-col"
          headStyle={{ color: "var(--text-color)" }}
          bodyStyle={{
            padding: 16,
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div className="flex-1 flex justify-center items-center">
            <Spin size="large" />
          </div>
        </Card>
      </div>
    );
  }

  const chartData =
    monthlyUsers && monthlyUsers.length > 0
      ? monthlyUsers.map((item: any) => ({
          month: item.month,
          userCount: item.userCount,
        }))
      : fallbackData;

  return (
    <div className="h-full flex flex-col">
      {controlsPanel}
      <Card
        title="Monthly User Registrations"
        className="flex-1 flex flex-col"
        headStyle={{ color: "var(--text-color)" }}
        bodyStyle={{
          padding: 16,
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div className="flex-1 min-h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(0,0,0,0.1)"
                className="!dark:stroke-gray-600"
              />
              <XAxis
                dataKey="month"
                stroke="#666"
                fontSize={12}
                className="!dark:stroke-gray-400"
                tickFormatter={(value) => {
                  const date = new Date(value + "-01");
                  return date.toLocaleDateString("vi-VN", {
                    year: "numeric",
                    month: "short",
                  });
                }}
              />
              <YAxis
                stroke="#666"
                fontSize={12}
                className="!dark:stroke-gray-400"
              />
              <Tooltip
                formatter={(value) => [value, "New Users"]}
                labelFormatter={(label) => {
                  const date = new Date(label + "-01");
                  return date.toLocaleDateString("vi-VN", {
                    year: "numeric",
                    month: "long",
                  });
                }}
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "none",
                  borderRadius: "12px",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
                  padding: "12px 16px",
                  color: "#000",
                }}
                labelStyle={{
                  color: "#333",
                  fontWeight: "bold",
                  marginBottom: "4px",
                }}
                wrapperClassName="!dark:[&>div]:!bg-gray-800 !dark:[&>div]:!text-white !dark:[&>div]:!border-gray-600"
              />
              <Area
                type="monotone"
                dataKey="userCount"
                stroke="#82ca9d"
                strokeWidth={3}
                fill="url(#colorUsers)"
                dot={{
                  fill: "#82ca9d",
                  strokeWidth: 2,
                  r: 4,
                  stroke: "#fff",
                }}
                activeDot={{
                  r: 8,
                  fill: "#82ca9d",
                  stroke: "#fff",
                  strokeWidth: 3,
                  filter: "drop-shadow(0 4px 8px rgba(130, 202, 157, 0.3))",
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default MonthlyUserRegistrationChart;
