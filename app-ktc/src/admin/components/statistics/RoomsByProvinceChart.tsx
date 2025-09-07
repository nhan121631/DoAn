import { useQuery } from "@tanstack/react-query";
import { Card, Spin } from "antd";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { getRoomsByProvinceQueryOptions } from "../../service/ReactQueryStatistic";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FFC658",
  "#FF7C7C",
  "#8DD1E1",
  "#D084D0",
];

const RoomsByProvinceChart = () => {
  const {
    data: roomsByProvince,
    isLoading,
    error,
  } = useQuery(getRoomsByProvinceQueryOptions());

  // Debug logging
  console.log("RoomsByProvince - Data:", roomsByProvince);
  console.log("RoomsByProvince - Loading:", isLoading);
  console.log("RoomsByProvince - Error:", error);

  // Fallback data for testing
  const fallbackData = [
    { provinceName: "Hồ Chí Minh", roomCount: 120, averagePrice: 5000000 },
    { provinceName: "Hà Nội", roomCount: 85, averagePrice: 4500000 },
    { provinceName: "Đà Nẵng", roomCount: 45, averagePrice: 3500000 },
    { provinceName: "Cần Thơ", roomCount: 32, averagePrice: 2500000 },
    { provinceName: "Bình Dương", roomCount: 28, averagePrice: 3000000 },
  ];

  if (isLoading) {
    return (
      <Card
        title="Rooms by Province"
        className="h-full flex flex-col"
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
    );
  }

  const dataToUse =
    roomsByProvince && roomsByProvince.length > 0
      ? roomsByProvince
      : fallbackData;

  const chartData = dataToUse.slice(0, 10).map((item, index) => ({
    name: item.provinceName,
    value: item.roomCount,
    fill: COLORS[index % COLORS.length],
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderCustomLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return percent > 0.05 ? (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };

  return (
    <Card
      title="Rooms Distribution by Province"
      className="h-full flex flex-col"
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
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [value, "Rooms"]}
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                border: "none",
                borderRadius: "8px",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
                color: "#000",
              }}
            //   wrapperClassName="!dark:[&>div]:!bg-gray-800 !dark:[&>div]:!text-white !dark:[&>div]:!border-gray-600"
            />
            <Legend wrapperStyle={{ color: "var(--text-color)" }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default RoomsByProvinceChart;
