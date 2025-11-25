import { Card } from "antd";

export default function CardStatistics({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <Card className="rounded-2xl border border-slate-200">
      <div style={{ padding: "16px 24px 8px" }}>
        <div className="text-sm text-slate-500 mb-2">{title}</div>
        <div className="flex items-end justify-between">
          <span className="text-3xl font-semibold">{value}</span>
          {/* <TrendingUp className="h-6 w-6 text-emerald-500" /> */}
        </div>
      </div>
    </Card>
  );
}
