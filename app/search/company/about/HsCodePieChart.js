"use client";

import { Chart } from "react-google-charts";

/* ---------- SAMPLE DATA ---------- */
const data = [
  ["HS Code", "Share"],
  ["4202", 52.3],
  ["4820", 14.8],
  ["4203", 10.2],
  ["4205", 7.4],
  ["6403", 6.1],
  ["4201", 4.2],
  ["7117", 2.5],
  ["8308", 2.5],
];

export default function HSCodePieChart() {
  const options = {
  backgroundColor: "transparent",

  is3D: true,
  pieStartAngle: 120,

  chartArea: {
    width: "92%",
    height: "78%",
  },

  // 🔥 Better labels
  pieSliceText: "percentage",
  pieSliceTextStyle: {
    color: "#ffffff",
    fontSize: 12,
    bold: true,
  },

  legend: {
    position: "bottom",
    alignment: "center",
    textStyle: {
      color: "#003466",
      fontSize: 12,
    },
  },

  tooltip: {
    text: "both",
  },

  // 🔥 Softer + premium palette
  colors: [
    "#4f6fd8", // primary
    "#22c55e",
    "#06b6d4",
    "#f97316",
    "#a855f7",
    "#f43f5e",
    "#14b8a6",
    "#6366f1",
  ],

  sliceVisibilityThreshold: 0.01,
};

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-blue-100 rounded-2xl p-6 shadow-sm">

      {/* HEADER */}
      <h2 className="text-lg font-semibold text-[#003466] mb-4">
        HS Code Distribution
      </h2>

      {/* CHART */}
      <div className="w-full h-[400px]">
        <Chart
          chartType="PieChart"
          data={data}
          options={options}
          width="100%"
          height="100%"
        />
      </div>
    </div>
  );
}