"use client";

import { motion } from "framer-motion";
import { DollarSign, Package, Layers } from "lucide-react";
import AnalyticsChart from "./analytics/AnalyticsChart";
import YearComparison from "./analytics/YearComparision";
import SmartTable from "./analytics/SmartTable";

const analyticsData = [
  {
    label: "Total Trade Value",
    value: "$57,151",
    sub: "Currency (USD)",
    icon: DollarSign,
    trend: "+12.4%",
  },
  {
    label: "Total Volume",
    value: "26,260",
    sub: "Quantity",
    icon: Package,
    trend: "+4.2%",
  },
  {
    label: "Unit Type",
    value: "Select Unit",
    sub: "Filter applied",
    icon: Layers,
    isDropdown: true,
  },
];

export default function Analytics() {
  return (
    <section className="w-full px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-[#003466]">
          Analytics Overview
        </h2>

        <div className="flex gap-6 mt-3 text-sm">
          <span className="text-[#003466] font-medium relative">
            Search: <span className="font-semibold">coin</span>
            <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-[#003466]" />
          </span>

          <span className="text-gray-400 hover:text-[#003466] cursor-pointer transition">
            All Products
          </span>
        </div>
      </div>

      {/* STRIP DESIGN */}
      <div className="flex flex-col md:flex-row gap-4">
        {analyticsData.map((item, i) => {
          const Icon = item.icon;

          return (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02 }}
              className="flex-1 relative overflow-hidden rounded-2xl p-[1px] bg-gradient-to-br from-blue-200/40 to-blue-500/30"
            >
              {/* Inner Glass Card */}
              <div className="h-full rounded-2xl bg-white/70 backdrop-blur-xl p-6 flex flex-col justify-between shadow-md">

                {/* Top Row */}
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-[#003466]/10 text-[#003466]">
                    <Icon size={22} />
                  </div>

                  {item.trend && (
                    <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-md">
                      {item.trend}
                    </span>
                  )}
                </div>

                {/* Main Value */}
                <div className="mt-6">
                  <h3 className="text-2xl font-bold text-[#003466] tracking-tight">
                    {item.value}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {item.sub}
                  </p>
                </div>

                {/* Bottom Section */}
                <div className="mt-6 flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-700">
                    {item.label}
                  </p>

                  {/* Micro Bar */}
                  <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="w-2/3 h-full bg-[#003466]" />
                  </div>
                </div>

                {/* Glow Hover */}
                <div className="absolute inset-0 opacity-0 hover:opacity-100 transition bg-gradient-to-br from-blue-100/20 to-transparent pointer-events-none" />
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnalyticsChart></AnalyticsChart>
      <YearComparison/>
      <SmartTable></SmartTable>
    </section>
  );
}