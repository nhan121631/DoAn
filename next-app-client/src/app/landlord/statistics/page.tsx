"use client";
import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import {
  Calendar,
  Download,
  PieChart as PieChartIcon,
  TrendingUp,
} from "lucide-react";
import { Button, Card, Input, Select } from "antd";

/**
 * Next.js (App Router) usage:
 * 1) Install deps:
 *    npm i recharts framer-motion lucide-react
 *    # If you use shadcn/ui, ensure Button, Card, Input, Select are generated.
 * 2) Create a route: app/charts/page.tsx
 * 3) Paste this component as default export.
 */

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
      bodyStyle={{ height: 320, padding: 16 }}
    >
      {children}
    </Card>
  );
}

// ----------- Component -----------
export default function ChartsTemplate() {
  const [range, setRange] = useState<"7d" | "14d" | "30d">("30d");
  const [search, setSearch] = useState("");

  const days = range === "7d" ? 7 : range === "14d" ? 14 : 30;
  const data = useMemo(() => makeData(days), [days]);

  const totalUsers = useMemo(
    () => data.reduce((a, b) => a + b.users, 0),
    [data]
  );
  const totalRevenue = useMemo(
    () => data.reduce((a, b) => a + b.revenue, 0),
    [data]
  );
  const avgConv = useMemo(
    () => data.reduce((a, b) => a + b.conversion, 0) / data.length,
    [data]
  );

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
    <div className="min-h-screen w-full bg-slate-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-auto max-w-7xl"
      >
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Analytics Dashboard
            </h1>
            <p className="text-slate-500">
              Template Next.js + TypeScript + Recharts
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={range}
              style={{ width: 140 }}
              onChange={(v) => setRange(v as typeof range)}
              options={[
                { value: "7d", label: "7 ngày" },
                { value: "14d", label: "14 ngày" },
                { value: "30d", label: "30 ngày" },
              ]}
            />
            <div className="relative">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Lọc theo ngày (YYYY-MM-DD)"
                style={{ paddingLeft: 32, width: 240 }}
              />
              <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
            </div>
            <Button type="default" className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="rounded-2xl border border-slate-200">
            <div style={{ padding: "16px 24px 8px" }}>
              <div className="text-sm text-slate-500 mb-2">Tổng Users</div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-semibold">
                  {totalUsers.toLocaleString()}
                </span>
                <TrendingUp className="h-6 w-6 text-emerald-500" />
              </div>
              <p className="mt-1 text-xs text-slate-500">
                So với kỳ trước +4.2%
              </p>
            </div>
          </Card>
          <Card className="rounded-2xl border border-slate-200">
            <div style={{ padding: "16px 24px 8px" }}>
              <div className="text-sm text-slate-500 mb-2">Tổng Revenue</div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-semibold">
                  ${totalRevenue.toFixed(0)}
                </span>
                <TrendingUp className="h-6 w-6 text-emerald-500" />
              </div>
              <p className="mt-1 text-xs text-slate-500">
                So với kỳ trước +3.1%
              </p>
            </div>
          </Card>
          <Card className="rounded-2xl border border-slate-200">
            <div style={{ padding: "16px 24px 8px" }}>
              <div className="text-sm text-slate-500 mb-2">Số Orders</div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-semibold">
                  {filtered.reduce((a, b) => a + b.orders, 0).toLocaleString()}
                </span>
                <TrendingUp className="h-6 w-6 text-emerald-500" />
              </div>
              <p className="mt-1 text-xs text-slate-500">Tăng trưởng ổn định</p>
            </div>
          </Card>
          <Card className="rounded-2xl border border-slate-200">
            <div style={{ padding: "16px 24px 8px" }}>
              <div className="text-sm text-slate-500 mb-2">
                Tỉ lệ Chuyển đổi
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-semibold">
                  {(avgConv * 100).toFixed(1)}%
                </span>
                <TrendingUp className="h-6 w-6 text-emerald-500" />
              </div>
              <p className="mt-1 text-xs text-slate-500">Theo dõi theo ngày</p>
            </div>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartCard
            title="Users & Orders theo ngày"
            icon={<PieChartIcon className="h-5 w-5 text-sky-500" />}
            right={
              <span className="text-xs text-slate-500">Nguồn: mock data</span>
            }
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={filtered}
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
                  dataKey="users"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  dot={false}
                  name="Users"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="orders"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                  name="Orders"
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
