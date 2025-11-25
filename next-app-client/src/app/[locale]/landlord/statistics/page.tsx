/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import {
  getLandlordFavoritedRoomCount,
  getLandlordFeePostRoomStatistics,
  getLandlordMaintainceStatistics,
  getLandlordPostedRoomCount,
  getLandlordRentedRoomCount,
  getLandlordRevenueStatistics,
  getLandlordViewedRoomCount,
} from "@/services/LandLordStatisticsService";
import {
  MaintainStatisticDto,
  RevenueStatisticsDto,
  TransactionStatisticsDto,
} from "@/types/types";
import { Button, Card, DatePicker, Select } from "antd";
import { Dayjs } from "dayjs";
import { motion } from "framer-motion";
import { Download, PieChart as PieChartIcon } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Line,
  LineChart,
} from "recharts";
import CardStatistics from "../components/statistics/Card";

// ----------- Types -----------
// ...existing code...

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
  const [dataRevenueRooms, setDataRevenueRooms] = useState<
    RevenueStatisticsDto[]
  >([]);

  // Sort revenue data by date ascending for chart
  const sortedRevenueRooms = useMemo(() => {
    return [...dataRevenueRooms].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [dataRevenueRooms]);

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

  // ...existing code...
  // statistics maintenance rooms
  useEffect(() => {
    const fetchDataWithValidation = async () => {
      console.log("useEffect triggered with:", { startDate, endDate });

      if (startDate && endDate) {
        if (endDate.isBefore(startDate)) {
          setDateError("End date must be after start date.");
          return;
        }
        // Tính số tháng giữa 2 mốc
        const monthDiff = endDate.diff(startDate, "month") + 1;
        if (monthDiff > 12) {
          setDateError("You can only select up to 12 months.");
          return;
        }
        try {
          const startMonth = startDate.format("YYYY-MM-01");
          const endMonth = endDate.endOf("month").format("YYYY-MM-DD");
          const res = await getLandlordMaintainceStatistics(
            startMonth,
            endMonth
          );
          setDataMaintainedRooms(res);
          setDateError("");
          const resPost = await getLandlordFeePostRoomStatistics(
            startMonth,
            endMonth
          );
          setDataPostedRooms(resPost);
          const resRevenue = await getLandlordRevenueStatistics(
            startMonth,
            endMonth
          );
          setDataRevenueRooms(resRevenue);
        } catch (error) {
          console.error("Error fetching maintenance statistics:", error);
          setDateError("Error loading statistics data.");
        }
      } else {
        // Nếu không có startDate/endDate, gọi API mặc định (12 tháng gần nhất)
        try {
          const res = await getLandlordMaintainceStatistics();
          setDataMaintainedRooms(res);
          setDateError("");
          const resPost = await getLandlordFeePostRoomStatistics();
          setDataPostedRooms(resPost);
          const restRevenue = await getLandlordRevenueStatistics();
          setDataRevenueRooms(restRevenue);
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

  // ...existing code...

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
            {/* Form startDate và endDate antd */}
            <div className="flex items-center gap-2">
              <DatePicker
                picker="month"
                placeholder="Month start"
                value={startDate}
                onChange={(date) => setStartDate(date)}
                style={{ width: 140 }}
              />
              <DatePicker
                picker="month"
                placeholder="Month end"
                value={endDate}
                onChange={(date) => setEndDate(date)}
                style={{ width: 140 }}
              />
            </div>
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
            title="Revenue"
            icon={<PieChartIcon className="h-5 w-5 text-amber-500" />}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sortedRevenueRooms}
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

          {/* <ChartCard
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
          </ChartCard> */}
        </div>
      </motion.div>
    </div>
  );
}
