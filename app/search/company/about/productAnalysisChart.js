"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useState } from "react";

/* ---------- SAMPLE DATA ---------- */
const data = [
  {
    month: "Apr",
    leather: 120,
    bags: 80,
    belts: 40,
    footwear: 30,
  },
  {
    month: "May",
    leather: 180,
    bags: 90,
    belts: 60,
    footwear: 40,
  },
  {
    month: "Jun",
    leather: 200,
    bags: 100,
    belts: 70,
    footwear: 50,
  },
  {
    month: "Jul",
    leather: 170,
    bags: 90,
    belts: 60,
    footwear: 45,
  },
  {
    month: "Aug",
    leather: 350,
    bags: 120,
    belts: 80,
    footwear: 70,
  },
  {
    month: "Sep",
    leather: 320,
    bags: 140,
    belts: 90,
    footwear: 80,
  },
  {
    month: "Oct",
    leather: 330,
    bags: 160,
    belts: 120,
    footwear: 90,
  },
  {
    month: "Nov",
    leather: 360,
    bags: 180,
    belts: 140,
    footwear: 100,
  },
  {
    month: "Dec",
    leather: 200,
    bags: 110,
    belts: 80,
    footwear: 60,
  },
  {
    month: "Jan",
    leather: 170,
    bags: 90,
    belts: 70,
    footwear: 60,
  },
  {
    month: "Feb",
    leather: 260,
    bags: 120,
    belts: 80,
    footwear: 70,
  },
  {
    month: "Mar",
    leather: 60,
    bags: 30,
    belts: 20,
    footwear: 15,
  },
];

/* ---------- COLORS ---------- */
const COLORS = {
  leather: "#2563eb",
  bags: "#22c55e",
  belts: "#f97316",
  footwear: "#111827",
};

export default function ProductAnalysisChart() {
  const [digit, setDigit] = useState("6");

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-blue-100 rounded-2xl p-6 shadow-sm">

      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between mb-6">

        <h2 className="text-lg font-semibold text-[#003466]">
          Main Import Products Analysis (Last 12 Months)
        </h2>

        {/* TOGGLES */}
        <div className="flex items-center gap-2 bg-blue-50 p-1 rounded-full">
          {["8", "6", "4", "2"].map((d) => (
            <button
              key={d}
              onClick={() => setDigit(d)}
              className={`px-4 py-1.5 text-sm rounded-full transition
                ${
                  digit === d
                    ? "bg-blue-600 text-white shadow"
                    : "text-blue-700"
                }`}
            >
              {d} Digit
            </button>
          ))}
        </div>
      </div>

      {/* CHART */}
      <div className="w-full h-[350px]">
        <ResponsiveContainer>
          <BarChart data={data} barGap={4}>

            {/* GRID */}
            <CartesianGrid
              stroke="#edf4ff"
              vertical={false}
            />

            {/* AXES */}
            <XAxis
              dataKey="month"
              tick={{ fill: "#6b7280", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              tick={{ fill: "#6b7280", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />

            {/* TOOLTIP */}
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
              }}
            />

            {/* STACKED BARS */}
            <Bar dataKey="footwear" stackId="a" fill={COLORS.footwear} />
            <Bar dataKey="belts" stackId="a" fill={COLORS.belts} />
            <Bar dataKey="bags" stackId="a" fill={COLORS.bags} />
            <Bar dataKey="leather" stackId="a" fill={COLORS.leather} radius={[6,6,0,0]} />

          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}