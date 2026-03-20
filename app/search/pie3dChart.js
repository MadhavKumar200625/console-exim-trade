"use client";

import {
  RadialBarChart,
  RadialBar,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#3b82f6",
  "#22c55e",
  "#06b6d4",
  "#f97316",
  "#a855f7",
];

export default function PremiumRadialChart({ data }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  const formatted = data.map((d, i) => ({
    ...d,
    fill: COLORS[i % COLORS.length],
  }));

  return (
    <div className="relative w-full h-[320px] flex items-center justify-center">

      {/* CENTER KPI (FIXED SPACING) */}
      <div className="absolute flex flex-col items-center justify-center z-10">
        <span className="text-[11px] tracking-wide text-gray-400 uppercase">
          Total Trade
        </span>

        <span className="text-2xl font-bold text-[#003466] mt-1">
          ${total.toLocaleString()}
        </span>

        <span className="text-[11px] text-gray-400 mt-1">
          Across {data.length} segments
        </span>
      </div>

      <ResponsiveContainer>
        <RadialBarChart
          innerRadius="55%"   // 🔥 increased → no overlap
          outerRadius="95%"
          data={formatted}
          startAngle={90}
          endAngle={-270}
        >
          {/* BACKGROUND TRACK (premium look) */}
          <RadialBar
            dataKey="value"
            background={{
              fill: "#eef5ff",
            }}
            clockWise
            cornerRadius={12}
            stroke="white"
            strokeWidth={2}
          />

          <Tooltip
            contentStyle={{
              borderRadius: "10px",
              border: "none",
              boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
            }}
            formatter={(v) => `$${Number(v).toLocaleString()}`}
          />
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  );
}