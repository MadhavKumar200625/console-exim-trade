"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const data = [
  { month: "Jan", value: 12000, quantity: 6000 },
  { month: "Feb", value: 9000, quantity: 5000 },
  { month: "Mar", value: 3000, quantity: 2000 },
  { month: "Apr", value: 1000, quantity: 800 },
  { month: "May", value: 1200, quantity: 900 },
  { month: "Jun", value: 1500, quantity: 1100 },
  { month: "Jul", value: 2000, quantity: 1500 },
  { month: "Aug", value: 4000, quantity: 2500 },
  { month: "Sep", value: 8610, quantity: 3950 },
  { month: "Oct", value: 25000, quantity: 10000 },
  { month: "Nov", value: 3000, quantity: 1200 },
  { month: "Dec", value: 5000, quantity: 2000 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white shadow-xl border border-gray-100 rounded-xl p-3">
        <p className="text-sm font-semibold text-[#003466]">{label}</p>
        <p className="text-xs text-gray-600">
          Value: <span className="font-medium">${payload[0].value}</span>
        </p>
        <p className="text-xs text-gray-600">
          Quantity: <span className="font-medium">{payload[1].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function AnalyticsChart() {
  return (
    <section className="w-full px-6 py-10">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-[#003466]">
            Monthly Trend Analysis
          </h3>
          <p className="text-sm text-gray-500">
            Search Key: <span className="font-medium">coin</span>
          </p>
        </div>

        {/* Toggle (UI only for now) */}
        <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
          <button className="px-3 py-1 text-sm bg-white rounded-md shadow">
            Combined
          </button>
          <button className="px-3 py-1 text-sm text-gray-500">
            Value
          </button>
          <button className="px-3 py-1 text-sm text-gray-500">
            Quantity
          </button>
        </div>
      </div>

      {/* Chart Container */}
      <div className="w-full h-[350px] bg-white rounded-2xl p-4 shadow-md">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#003466" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#003466" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />

            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 12 }}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* VALUE → Area */}
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="value"
              stroke="#003466"
              fill="url(#colorValue)"
              strokeWidth={2}
            />

            {/* QUANTITY → Line */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="quantity"
              stroke="#22c55e"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}