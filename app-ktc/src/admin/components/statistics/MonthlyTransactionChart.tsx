/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, Spin, Form, Button, Space, Select } from "antd";
import { FilterOutlined } from "@ant-design/icons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  getMonthlyRevenueQueryOptions,
  getTopLandlordsQueryOptions,
} from "../../service/ReactQueryStatistic";

interface MonthlyTransactionChartProps {
  months?: number;
  landlordId?: string;
}

const MonthlyTransactionChart = ({
  months: initialMonths = 6,
  landlordId: initialLandlordId,
}: MonthlyTransactionChartProps) => {
  const [months, setMonths] = useState(initialMonths);
  const [landlordId, setLandlordId] = useState(initialLandlordId);
  const [form] = Form.useForm();

  const {
    data: monthlyTransactionStats,
    isLoading,
    error,
    isError,
  } = useQuery(getMonthlyRevenueQueryOptions(months, landlordId));

  // Get landlords list for dropdown
  const { data: landlords } = useQuery(getTopLandlordsQueryOptions(50));

  const handleApply = () => {
    form.validateFields().then((values) => {
      setMonths(values.months || 6);
      setLandlordId(values.landlordId);
    });
  };

  const handleReset = () => {
    setMonths(6);
    setLandlordId(undefined);
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
        initialValues={{ months: 6, landlordId: undefined }}
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
        <Form.Item name="landlordId" label="Select Landlord" className="mb-0">
          <Select
            placeholder="All landlords"
            allowClear
            style={{ width: 170 }}
            showSearch
            optionFilterProp="children"
          >
            {landlords?.map((landlord: any) => (
              <Select.Option key={landlord.id} value={landlord.id}>
                {landlord.landlordName} (
                {landlord.totalRevenue
                  ? new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(landlord.totalRevenue)
                  : "0 ₫"}
                )
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

  // Process data for chart - group by month and transaction type
  const processedData = React.useMemo(() => {
    if (!monthlyTransactionStats || monthlyTransactionStats.length === 0) {
      return [];
    }

    const monthlyData: Record<string, any> = {};

    monthlyTransactionStats.forEach((stat) => {
      if (!monthlyData[stat.month]) {
        monthlyData[stat.month] = {
          month: stat.month,
          "Gia hạn/Đăng bài": 0,
          "Nạp VNPAY": 0,
          "Hoàn trả": 0,
        };
      }

      switch (stat.transactionType) {
        case 0:
          monthlyData[stat.month]["Gia hạn/Đăng bài"] = stat.totalAmount;
          break;
        case 1:
          monthlyData[stat.month]["Nạp VNPAY"] = stat.totalAmount;
          break;
        case 2:
          monthlyData[stat.month]["Hoàn trả"] = stat.totalAmount;
          break;
      }
    });

    return Object.values(monthlyData).sort(
      (a: any, b: any) =>
        new Date(a.month + "-01").getTime() -
        new Date(b.month + "-01").getTime()
    );
  }, [monthlyTransactionStats]);

  // Show error state
  if (isError) {
    console.error("API Error:", error);
    const isConnectionError =
      (error as any)?.code === "ERR_NETWORK" ||
      error?.message?.includes("Network Error");

    return (
      <div className="h-full flex flex-col">
        {controlsPanel}
        <Card
          title={
            landlordId
              ? "Monthly Transactions (Selected Landlord)"
              : "Monthly Transactions (All)"
          }
          className="flex-1 flex flex-col dark:bg-[#171f2f] dark:border-gray-600"
          headStyle={{ color: "var(--text-color)" }}
          bodyStyle={{
            padding: 16,
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div className="flex-1 flex flex-col justify-center items-center space-y-4">
            <div className="text-red-500 text-center">
              {isConnectionError
                ? "Unable to connect to server"
                : "Error loading monthly transaction data"}
            </div>
            <div className="text-sm text-gray-500 text-center">
              {isConnectionError
                ? "Please check if the backend server is running on http://localhost:3333"
                : "Please try again later"}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        {controlsPanel}
        <Card
          title={
            landlordId
              ? "Monthly Transactions (Selected Landlord)"
              : "Monthly Transactions (All)"
          }
          className="flex-1 flex flex-col dark:bg-[#171f2f] dark:border-gray-600"
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

  // Show no data state
  if (!processedData || processedData.length === 0) {
    return (
      <div className="h-full flex flex-col">
        {controlsPanel}
        <Card
          title={
            landlordId
              ? "Monthly Transactions (Selected Landlord)"
              : "Monthly Transactions (All)"
          }
          className="flex-1 flex flex-col dark:bg-[#171f2f] dark:border-gray-600"
          headStyle={{ color: "var(--text-color)" }}
          bodyStyle={{
            padding: 16,
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div className="flex-1 flex justify-center items-center">
            <div className="text-gray-500">No transaction data available</div>
          </div>
        </Card>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const formatMonth = (monthString: string) => {
    const date = new Date(monthString + "-01");
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
    });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-300 dark:border-gray-600 rounded shadow-lg">
          <p className="font-semibold text-gray-900 dark:text-white">
            {formatMonth(label)}
          </p>
          {payload.map((entry: any, index: number) => (
            <p
              key={index}
              style={{ color: entry.color }}
              className="text-gray-700 dark:text-gray-200"
            >
              {entry.name}: {formatCurrency(entry.value || 0)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full flex flex-col">
      {controlsPanel}
      <Card
        title={
          landlordId
            ? "Monthly Transactions (Selected Landlord)"
            : "Monthly Transactions (All)"
        }
        className="flex-1 flex flex-col dark:bg-[#171f2f] dark:border-gray-600"
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
            <BarChart
              data={processedData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e0e0e0"
                className="!dark:stroke-gray-600"
              />
              <XAxis
                dataKey="month"
                tickFormatter={formatMonth}
                fontSize={12}
                stroke="#666"
                className="!dark:stroke-gray-400"
              />
              <YAxis
                tickFormatter={(value) =>
                  new Intl.NumberFormat("vi-VN", {
                    notation: "compact",
                    compactDisplay: "short",
                  }).format(value) + " ₫"
                }
                fontSize={12}
                stroke="#666"
                className="!dark:stroke-gray-400"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: "var(--text-color)" }} />

              {/* Bar for "Gia hạn/Đăng bài" - Green */}
              <Bar
                dataKey="Gia hạn/Đăng bài"
                fill="#10B981"
                name="Gia hạn/Đăng bài"
                radius={[2, 2, 0, 0]}
              />

              {/* Bar for "Nạp VNPAY" - Blue */}
              <Bar
                dataKey="Nạp VNPAY"
                fill="#3B82F6"
                name="Nạp VNPAY"
                radius={[2, 2, 0, 0]}
              />

              {/* Bar for "Hoàn trả" - Orange */}
              <Bar
                dataKey="Hoàn trả"
                fill="#F59E0B"
                name="Hoàn trả"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default MonthlyTransactionChart;
