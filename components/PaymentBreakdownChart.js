"use client";
import { PieChart as PieIcon } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "@/utils/format";

const COLORS = { Principal: "#6C5DD3", Interest: "#FFA600", Fees: "#FF754C" };

export default function PaymentBreakdownChart({ stats }) {
  const empty =
    !stats ||
    (stats.totalPrincipal === 0 &&
      stats.totalInterest === 0 &&
      stats.totalFees === 0);

  const data = [
    { name: "Principal", value: stats?.totalPrincipal || 0, color: COLORS.Principal },
    { name: "Interest", value: stats?.totalInterest || 0, color: COLORS.Interest },
    { name: "Fees", value: stats?.totalFees || 0, color: COLORS.Fees },
  ].filter((d) => d.value > 0);
  const total = data.reduce((s, d) => s + d.value, 0);

  const Custom = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const p = payload[0];
    return (
      <div className="rounded-xl border border-hairline/10 bg-surface px-3 py-2 shadow-card">
        <p className="text-xs" style={{ color: p.payload.color }}>
          {p.name}
        </p>
        <p className="text-sm font-semibold text-main tabular">
          {formatCurrency(p.value)} · {total ? ((p.value / total) * 100).toFixed(1) : 0}%
        </p>
      </div>
    );
  };

  return (
    <div className="card flex flex-col p-5">
      <header className="mb-2 flex items-center gap-2">
        <PieIcon size={16} className="text-accent" />
        <h2 className="text-sm font-semibold text-main">Payment breakdown</h2>
      </header>

      {empty ? (
        <div className="flex h-[220px] items-center justify-center text-sm text-secondary">
          No payment data yet.
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={62}
                  outerRadius={88}
                  paddingAngle={3}
                  stroke="none"
                >
                  {data.map((e) => (
                    <Cell key={e.name} fill={e.color} />
                  ))}
                </Pie>
                <Tooltip content={<Custom />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs text-secondary">Total paid</span>
              <span className="text-base font-bold text-main tabular">
                {new Intl.NumberFormat("ro-RO", {
                  notation: "compact",
                  maximumFractionDigits: 1,
                }).format(total)}
              </span>
            </div>
          </div>
          <ul className="w-full space-y-1.5">
            {data.map((e) => (
              <li key={e.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-secondary">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: e.color }}
                  />
                  {e.name}
                </span>
                <span className="tabular text-main">
                  {total ? ((e.value / total) * 100).toFixed(1) : 0}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
