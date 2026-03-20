"use client";

import { Chart } from "react-google-charts";

export default function Google3DChart({ data }) {
  // Convert to Google format
  const chartData = [
    ["Country", "Value"],
    ...data.map((d) => [d.name, d.value]),
  ];

  const options = {
    backgroundColor: "transparent",

    // 🔥 Clean 3D
    is3D: true,
    pieStartAngle: 110,

    chartArea: {
      width: "100%",
      height: "90%",
    },

    // ❌ REMOVE LEGEND
    legend: "none",

    // 🎨 PREMIUM COLOR PALETTE (balanced, not loud)
    colors: [
      "#4f46e5", // indigo
      "#0ea5e9", // sky
      "#22c55e", // green
      "#f59e0b", // amber
      "#ef4444", // red
      "#8b5cf6", // violet
    ],

    tooltip: {
      text: "value",
      showColorCode: true,
    },

    // cleaner slice text
    pieSliceText: "percentage",
    pieSliceTextStyle: {
      color: "#ffffff",
      fontSize: 12,
    },

    sliceVisibilityThreshold: 0.02,

    // subtle depth improvement
    enableInteractivity: true,
  };

  return (
    <div className="w-full h-[340px] flex items-center justify-center">
      <Chart
        chartType="PieChart"
        data={chartData}
        options={options}
        width="100%"
        height="100%"
      />
    </div>
  );
}