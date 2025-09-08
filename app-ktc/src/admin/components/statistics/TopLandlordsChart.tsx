import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, Spin, Table, Form, Button, Space, Select } from "antd";
import { FilterOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { getTopLandlordsQueryOptions } from "../../service/ReactQueryStatistic";
import type { TopLandlord } from "../../types/type";

interface TopLandlordsChartProps {
  limit?: number;
}

const TopLandlordsChart = ({
  limit: initialLimit = 8,
}: TopLandlordsChartProps) => {
  const [limit, setLimit] = useState(initialLimit);
  const [form] = Form.useForm();

  const { data: topLandlords, isLoading } = useQuery(
    getTopLandlordsQueryOptions(limit)
  );

  const handleApply = () => {
    form.validateFields().then((values) => {
      setLimit(values.limit || 8);
    });
  };

  const handleReset = () => {
    form.setFieldsValue({ limit: 8 });
    setLimit(8);
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
        initialValues={{ limit: 8 }}
        className="flex items-center gap-3"
      >
        <Form.Item name="limit" label="Top Count" className="mb-0">
          <Select placeholder="8" style={{ width: 70 }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((count) => (
              <Select.Option key={count} value={count}>
                {count}
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

  if (isLoading) {
    return (
      <div>
        {controlsPanel}
        <Card title="Top Landlords" className="h-96">
          <div className="flex justify-center items-center h-full">
            <Spin size="large" />
          </div>
        </Card>
      </div>
    );
  }

  const columns: ColumnsType<TopLandlord> = [
    {
      title: "Rank",
      key: "rank",
      width: 60,
      render: (_, __, index) => (
        <span className="font-bold text-blue-600">#{index + 1}</span>
      ),
    },
    {
      title: "Landlord Name",
      dataIndex: "landlordName",
      key: "landlordName",
      render: (text) => (
        <span className="font-semibold dark:text-white">{text}</span>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (text) => (
        <span className="text-gray-600 dark:text-gray-300">{text}</span>
      ),
    },
    {
      title: "Room Count",
      dataIndex: "roomCount",
      key: "roomCount",
      sorter: (a, b) => a.roomCount - b.roomCount,
      render: (count) => (
        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded dark:bg-blue-900 dark:text-blue-200">
          {count} rooms
        </span>
      ),
    },
    {
      title: "Total Revenue",
      dataIndex: "totalRevenue",
      key: "totalRevenue",
      sorter: (a, b) => a.totalRevenue - b.totalRevenue,
      render: (revenue) => (
        <span className="bg-green-100 text-green-800 px-2 py-1 rounded dark:bg-green-900 dark:text-green-200">
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(revenue)}
        </span>
      ),
    },
  ];

  return (
    <div className="h-full flex flex-col">
      {controlsPanel}
      <Card
        title="Top Landlords by Room Count"
        className="dark:bg-[#171f2f] dark:border-gray-600 flex-1 flex flex-col"
        headStyle={{ color: "var(--text-color)" }}
        bodyStyle={{
          padding: 0,
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div className="flex-1 overflow-hidden">
          <Table
            columns={columns}
            dataSource={topLandlords || []}
            pagination={false}
            size="small"
            rowKey="id"
            className="dark:bg-[#171f2f]"
            scroll={{
              y: 400, // Fixed height for scrolling
              x: "max-content", // Horizontal scroll if needed
            }}
            showHeader={true}
            sticky={true}
          />
        </div>
      </Card>
    </div>
  );
};

export default TopLandlordsChart;
