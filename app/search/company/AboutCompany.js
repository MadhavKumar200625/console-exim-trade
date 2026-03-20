"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import ProductAnalysisChart from "./about/productAnalysisChart";
import HSCodeBreakdown from "./about/HsCodeBreakDown";
import HSCodePieChart from "./about/HsCodePieChart";

const data = [
  { name: "Leather Goods", value: 400 },
  { name: "Textiles", value: 250 },
  { name: "Accessories", value: 180 },
  { name: "Footwear", value: 120 },
  { name: "Others", value: 90 },
];

const COLORS = [
  "#2563eb",
  "#3b82f6",
  "#60a5fa",
  "#22c55e",
  "#06b6d4",
];

export default function AboutCompany() {
  return (
    <div className="space-y-6">

      {/* ================= ABOUT TEXT ================= */}
      <div className="bg-white/80 backdrop-blur-xl border border-blue-100 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[#003466] mb-3">
          About Company
        </h2>

        <p className="text-sm text-gray-600 leading-relaxed">
          Gusti Leder Fulfillment Poland Sp Z O O is a leading importer and distributor...
        </p>
      </div>

      {/* ================= INDUSTRY ANALYSIS ================= */}
      <div className="bg-white/80 backdrop-blur-xl border border-blue-100 rounded-2xl p-6 shadow-sm">

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[#003466]">
            Industry Analysis
          </h2>

          <span className="text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Distribution
          </span>
        </div>

        <div className="w-full h-[320px]">
          <ResponsiveContainer>
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 30, bottom: 10 }}
            >
              {/* X axis */}
              <XAxis
                type="number"
                tick={{ fill: "#6b7280", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />

              {/* Y axis */}
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: "#003466", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />

              {/* Tooltip */}
              <Tooltip
                cursor={{ fill: "rgba(37,99,235,0.05)" }}
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                }}
                formatter={(v) => `$${v}M`}
              />

              {/* Bars */}
              <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                {data.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

       
      </div>
     <ProductAnalysisChart></ProductAnalysisChart>
     <HSCodeBreakdown/>
     <HSCodePieChart></HSCodePieChart>
    </div>
  );
}