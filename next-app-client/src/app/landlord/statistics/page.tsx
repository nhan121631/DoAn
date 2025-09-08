/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";
import {
  getLandlordFavoritedRoomCount,
  getLandlordFeePostRoomStatistics,
  getLandlordMaintainceStatistics,
  getLandlordPostedRoomCount,
  getLandlordRentedRoomCount,
  getLandlordViewedRoomCount,
} from "@/services/LandLordStatisticsService";
import { MaintainStatisticDto, TransactionStatisticsDto } from "@/types/types";
import { Button, Card, DatePicker, Select } from "antd";
import { Dayjs } from "dayjs";
import { motion } from "framer-motion";
import { Download, PieChart as PieChartIcon } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import CardStatistics from "../components/statistics/Card";

// ----------- Types -----------
export type KPI = {
  date: string; // YYYY-MM-DD
  users: number;
  revenue: number; // USD
  orders: number;
  conversion: number; // 0..1
};

// ----------- Mock Data Generator -----------
const makeData = (days = 30): KPI[] => {
  const out: KPI[] = [];
  const base = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(base.getDate() - i);
    const users = 200 + Math.round(Math.random() * 300);
    const orders = 50 + Math.round(users * (0.15 + Math.random() * 0.1));
    const revenue = orders * (15 + Math.random() * 25);
    const conversion = orders / users;
    out.push({
      date: d.toISOString().slice(0, 10),
      users,
      orders,
      revenue: Math.round(revenue * 100) / 100,
      conversion: Math.round(conversion * 1000) / 1000,
    });
  }
  return out;
};

const COLORS = [
  "#0ea5e9",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#14b8a6",
]; // tailwind palette

// ----------- Reusable UI -----------
function ChartCard({
  title,
  icon,
  children,
  right,
}: {
  title: string;
  icon?: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-lg font-semibold">{title}</span>
        </div>
      }
      extra={right}
      className="rounded-2xl shadow-sm border border-slate-200"
      styles={{ body: { height: 320, padding: 16 } }}
    >
      {children}
    </Card>
  );
}

// ----------- Component -----------
export default function ChartsTemplate() {
  const [range, setRange] = useState<"7d" | "14d" | "30d">("30d");
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [dateError, setDateError] = useState("");
  const [totalPostedRooms, setTotalPostedRooms] = useState(0);
  const [totalRentedRooms, setTotalRentedRooms] = useState(0);
  const [totalViewedRooms, setTotalViewedRooms] = useState(0);
  const [totalFavoritedRooms, setTotalFavoritedRooms] = useState(0);
  const [dataMaintainedRooms, setDataMaintainedRooms] = useState<
    MaintainStatisticDto[]
  >([]);
  const [dataPostedRooms, setDataPostedRooms] = useState<
    TransactionStatisticsDto[]
  >([]);

  // Combine maintenance and posting data for chart
  const combinedChartData = useMemo(() => {
    const combinedData: {
      [key: string]: {
        date: string;
        maintenanceCost: number;
        postingCost: number;
      };
    } = {};

    // Add maintenance data
    dataMaintainedRooms.forEach((item) => {
      combinedData[item.date] = {
        date: item.date,
        maintenanceCost: item.cost || 0,
        postingCost: 0,
      };
    });

    // Add posting data
    dataPostedRooms.forEach((item) => {
      if (combinedData[item.date]) {
        combinedData[item.date].postingCost = item.cost || 0;
      } else {
        combinedData[item.date] = {
          date: item.date,
          maintenanceCost: 0,
          postingCost: item.cost || 0,
        };
      }
    });

    return Object.values(combinedData).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [dataMaintainedRooms, dataPostedRooms]);

  const days = range === "7d" ? 7 : range === "14d" ? 14 : 30;
  const data = useMemo(() => makeData(days), [days]);
  // statistics maintenance rooms
  useEffect(() => {
    const fetchDataWithValidation = async () => {
      console.log("useEffect triggered with:", { startDate, endDate });

      if (startDate && endDate) {
        if (endDate.isBefore(startDate)) {
          setDateError("The end date must be greater than the start date.");
          // Vẫn gọi API mặc định khi có lỗi validation
          try {
            const res = await getLandlordMaintainceStatistics();
            setDataMaintainedRooms(res);
            const resPost = await getLandlordFeePostRoomStatistics();
            setDataPostedRooms(resPost);
          } catch (error) {
            console.error("Error fetching default data:", error);
          }
        } else {
          const diffDays = endDate.diff(startDate, "day");
          if (diffDays > 31) {
            setDateError("The period must not exceed 31 days.");
            // Vẫn gọi API mặc định khi có lỗi validation
            try {
              const res = await getLandlordMaintainceStatistics();
              setDataMaintainedRooms(res);
              const resPost = await getLandlordFeePostRoomStatistics();
              setDataPostedRooms(resPost);
            } catch (error) {
              console.error("Error fetching default data:", error);
            }
          } else {
            try {
              console.log(
                "Fetching data with dates:",
                startDate.format("YYYY-MM-DD"),
                endDate.format("YYYY-MM-DD")
              );
              const res = await getLandlordMaintainceStatistics(
                startDate.format("YYYY-MM-DD"),
                endDate.format("YYYY-MM-DD")
              );
              console.log("API response:", res);
              setDataMaintainedRooms(res);
              setDateError("");

              const resPost = await getLandlordFeePostRoomStatistics(
                startDate.format("YYYY-MM-DD"),
                endDate.format("YYYY-MM-DD")
              );
              console.log("API response:", resPost);
              setDataPostedRooms(resPost);
            } catch (error) {
              console.error("Error fetching maintenance statistics:", error);
              setDateError("Error loading statistics data.");
            }
          }
        }
      } else {
        // Nếu không có startDate/endDate, gọi API mặc định
        try {
          console.log("Fetching default maintenance data");
          const res = await getLandlordMaintainceStatistics();
          console.log("Default API response:", res);
          setDataMaintainedRooms(res);
          setDateError("");
          const resPost = await getLandlordFeePostRoomStatistics();
          console.log("Default API response:", resPost);
          setDataPostedRooms(resPost);
        } catch (error) {
          console.error(
            "Error fetching default maintenance statistics:",
            error
          );
        }
      }
    };

    fetchDataWithValidation();
  }, [startDate, endDate]);

  // useeffect to fetch total posted rooms
  useEffect(() => {
    const fetchPostedRooms = async () => {
      const res = await getLandlordPostedRoomCount();
      setTotalPostedRooms(res);
    };
    fetchPostedRooms();
  }, [setTotalPostedRooms]);
  useEffect(() => {
    const fetchRentedRooms = async () => {
      const res = await getLandlordRentedRoomCount();
      setTotalRentedRooms(res);
    };
    fetchRentedRooms();
  }, [setTotalRentedRooms]);

  useEffect(() => {
    const fetchViewedRooms = async () => {
      const res = await getLandlordViewedRoomCount();
      setTotalViewedRooms(res);
    };
    fetchViewedRooms();
  }, [setTotalViewedRooms]);

  useEffect(() => {
    const fetchFavoritedRooms = async () => {
      const res = await getLandlordFavoritedRoomCount();
      setTotalFavoritedRooms(res);
    };
    fetchFavoritedRooms();
  }, [setTotalFavoritedRooms]);

  // Đã di chuyển logic fetch maintenance vào useEffect validation ở trên
  const pieData = [
    { name: "A", value: 400 },
    { name: "B", value: 300 },
    { name: "C", value: 300 },
    { name: "D", value: 200 },
  ];

  const radarData = [
    { metric: "Quality", value: 120 },
    { metric: "Speed", value: 98 },
    { metric: "UX", value: 86 },
    { metric: "Stability", value: 99 },
    { metric: "Features", value: 85 },
  ];

  const filtered = search ? data.filter((d) => d.date.includes(search)) : data;

  return (
    <div className="min-h-screen w-full bg-slate-50 p-6 dark:bg-[#001529] transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-auto max-w-7xl"
      >
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 dark:text-white dark:bg-[#001529]">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Statistics Dashboard
            </h1>
            <p className="text-slate-500">Overview of key metrics and trends</p>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={range}
              style={{ width: 140 }}
              onChange={(v) => setRange(v as typeof range)}
              options={[
                { value: "7d", label: "7 day" },
                { value: "14d", label: "14 day" },
                { value: "30d", label: "30 day" },
              ]}
            />
            {/* Form startDate và endDate antd */}
            <div className="flex items-center gap-2">
              <DatePicker
                placeholder="Ngày bắt đầu"
                value={startDate}
                onChange={(date) => setStartDate(date)}
                style={{ width: 140 }}
              />
              <DatePicker
                placeholder="Ngày kết thúc"
                value={endDate}
                onChange={(date) => setEndDate(date)}
                style={{ width: 140 }}
              />
            </div>

            <Button type="default" className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>
        {dateError && (
          <div className="mb-2 text-red-500 text-sm">{dateError}</div>
        )}

        {/* KPI Cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <CardStatistics title="Total Rooms Posted" value={totalPostedRooms} />
          <CardStatistics
            title="Total Rented Rooms"
            value={`${totalRentedRooms}`}
          />
          <CardStatistics
            title="Total Viewed Rooms"
            value={`${totalViewedRooms}`}
          />
          <CardStatistics
            title="Total Favorited Rooms"
            value={`${totalFavoritedRooms}`}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartCard
            title="Maintenance & Room Posting Fee (per Day)"
            icon={<PieChartIcon className="h-5 w-5 text-sky-500" />}
            // right={
            //   <span className="text-xs text-slate-500">Nguồn: mock data</span>
            // }
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={combinedChartData}
                margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} minTickGap={16} />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(v: any) =>
                    typeof v === "number" ? v.toLocaleString() : v
                  }
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="maintenanceCost"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  dot={false}
                  name="Maintenance Fee"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="postingCost"
                  stroke="#07c53d"
                  strokeWidth={2}
                  dot={false}
                  name="Post Room Fee"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Revenue theo ngày (Bar)"
            icon={<PieChartIcon className="h-5 w-5 text-amber-500" />}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={filtered}
                margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} minTickGap={16} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(v: any) =>
                    typeof v === "number" ? `$${v.toLocaleString()}` : v
                  }
                />
                <Legend />
                <Bar
                  dataKey="revenue"
                  name="Revenue"
                  fill="#8b5cf6"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Tỉ lệ chuyển đổi (Area)"
            icon={<PieChartIcon className="h-5 w-5 text-emerald-500" />}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={filtered}
                margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="conv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} minTickGap={16} />
                <YAxis
                  tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                  tick={{ fontSize: 12 }}
                  domain={[0, 1]}
                />
                <Tooltip
                  formatter={(v: any) =>
                    typeof v === "number" ? `${(v * 100).toFixed(1)}%` : v
                  }
                />
                <Area
                  type="monotone"
                  dataKey="conversion"
                  name="Conversion"
                  stroke="#10b981"
                  fill="url(#conv)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Cơ cấu danh mục (Pie)"
            icon={<PieChartIcon className="h-5 w-5 text-rose-500" />}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip />
                <Legend />
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={100}
                  paddingAngle={4}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Radar KPI"
            icon={<PieChartIcon className="h-5 w-5 text-sky-500" />}
          >
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis />
                <Radar
                  name="Score"
                  dataKey="value"
                  stroke="#0ea5e9"
                  fill="#0ea5e9"
                  fillOpacity={0.3}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">
          Tip: thay mock data bằng API, hoặc Server Actions rồi truyền props vào
          các chart.
        </p>
      </motion.div>
    </div>
  );
}
