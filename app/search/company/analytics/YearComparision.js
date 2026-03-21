"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Line,
} from "recharts";

const data = [
  {
    year: "2025",
    value: 40000,
    quantity: 17000,
  },
  {
    year: "2026",
    value: 20000,
    quantity: 10000,
  },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-100 shadow-xl rounded-xl p-3">
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

export default function YearComparisonChart() {
  return (
    <section className="w-full px-6 py-10">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-[#003466]">
          Yearly Comparison Analysis
        </h3>
        <p className="text-sm text-gray-500">
          Value vs Quantity Trend
        </p>
      </div>

      {/* Chart Card */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="w-full h-[350px]">
          <ResponsiveContainer>
            <BarChart data={data} barGap={20}>
              <defs>
                {/* VALUE GRADIENT */}
                <linearGradient id="valueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#003466" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#003466" stopOpacity={0.4} />
                </linearGradient>

                {/* QUANTITY GRADIENT */}
                <linearGradient id="qtyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0.4} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />

              <XAxis dataKey="year" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />

              <Tooltip content={<CustomTooltip />} />

              {/* VALUE BAR */}
              <Bar
                dataKey="value"
                fill="url(#valueGrad)"
                radius={[10, 10, 0, 0]}
                barSize={40}
              />

              {/* QUANTITY BAR */}
              <Bar
                dataKey="quantity"
                fill="url(#qtyGrad)"
                radius={[10, 10, 0, 0]}
                barSize={40}
              />

              {/* TREND LINE */}
              <Line
                type="monotone"
                dataKey="value"
                stroke="#003466"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}