"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { motion } from "framer-motion";
import { useState } from "react";
import Pie3DChart from "./pie3dChart";

const COLORS = [
  "#3b82f6",
  "#1e293b",
  "#22c55e",
  "#06b6d4",
  "#f97316",
  "#a855f7",
];

function ChartCard({ title, data }) {
  const [activeIndex, setActiveIndex] = useState(null);

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl p-[1px] bg-gradient-to-br from-blue-200/40 to-blue-500/20 shadow-xl"
    >
      {/* GLASS CARD */}
      <div className="bg-white/70 backdrop-blur-2xl rounded-3xl p-6 h-full">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-[#003466]">
            {title}
          </h3>
          <span className="text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Live Data
          </span>
        </div>

        {/* CHART */}
        <div className="w-full h-[300px]">
  <Pie3DChart data={data} />
</div>

        {/* LEGEND */}
        <div className="mt-4 space-y-2 max-h-[160px] overflow-auto">
          {data.map((item, i) => {
            const percent = ((item.value / total) * 100).toFixed(1);

            return (
              <div
                key={i}
                className="flex items-center justify-between text-xs bg-white/60 px-3 py-2 rounded-lg hover:bg-blue-50 transition"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      background: COLORS[i % COLORS.length],
                    }}
                  />
                  <span className="font-medium text-[#003466]">
                    {item.name}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-gray-500">
                    {percent}%
                  </span>
                  <span className="font-semibold text-[#003466]">
                    ${item.value.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

export default function Synopsis() {
  const data = {
    buyers: [
      { name: "Thailand", value: 562342370 },
      { name: "USA", value: 171377914 },
      { name: "UAE", value: 99301679 },
      { name: "Vietnam", value: 37483507 },
    ],
    sellers: [
      { name: "Indonesia", value: 690880105 },
      { name: "Mexico", value: 171257510 },
      { name: "Vietnam", value: 91047477 },
      { name: "India", value: 46008367 },
    ],
    companies: [
      { name: "Amaryllis Jewelry", value: 375377515 },
      { name: "Siam Jewelry", value: 104784250 },
      { name: "Tigris Gold", value: 86154695 },
    ],
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <ChartCard title="Top Buyer Country" data={data.buyers} />
      <ChartCard title="Top Seller Country" data={data.sellers} />
      <ChartCard title="Top Buyers" data={data.companies} />
    </div>
  );
}