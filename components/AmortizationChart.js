"use client";
import { Activity } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const fmtCompact = (v) =>
  new Intl.NumberFormat("ro-RO", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(v || 0);

const fmtFull = (v) =>
  new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency: "RON",
    maximumFractionDigits: 0,
  }).format(v || 0);

const fmtDate = (d) =>
  new Intl.DateTimeFormat("ro-RO", { month: "short", year: "2-digit" }).format(
    new Date(d),
  );

export default function AmortizationChart({ schedule }) {
  // schedule is newest-first with remainingBalance; build an oldest-first series.
  const data = [...(schedule || [])]
    .filter((p) => p.date)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((p) => ({ date: p.date, balance: p.remainingBalance }));

  const Custom = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const p = payload[0];
    return (
      <div className="rounded-xl border border-hairline/10 bg-surface px-3 py-2 shadow-card">
        <p className="text-xs text-secondary">{fmtDate(p.payload.date)}</p>
        <p className="text-sm font-semibold text-main tabular">{fmtFull(p.value)}</p>
      </div>
    );
  };

  return (
    <div className="card flex flex-col p-5">
      <header className="mb-2 flex items-center gap-2">
        <Activity size={16} className="text-primary" />
        <h2 className="text-sm font-semibold text-main">Balance over time</h2>
      </header>

      {data.length < 2 ? (
        <div className="flex h-[260px] items-center justify-center text-center text-sm text-secondary">
          Add payments to see your balance trend.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="balFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(108 93 211)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="rgb(108 93 211)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgb(142 146 188 / 0.12)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tickFormatter={fmtDate}
              stroke="rgb(142 146 188)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              minTickGap={24}
            />
            <YAxis
              tickFormatter={fmtCompact}
              stroke="rgb(142 146 188)"
              fontSize={11}
              width={48}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              content={<Custom />}
              cursor={{ stroke: "rgb(142 146 188 / 0.25)" }}
            />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="rgb(108 93 211)"
              strokeWidth={2.5}
              fill="url(#balFill)"
              dot={false}
              activeDot={{ r: 4, fill: "rgb(108 93 211)" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
