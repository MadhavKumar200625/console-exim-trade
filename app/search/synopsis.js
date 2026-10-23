"use client";

import { motion } from "framer-motion";
import { BarChart3, Boxes, Globe2, TrendingUp } from "lucide-react";

function getRoot(report) {
  if (!report || typeof report !== "object") return {};
  if (report.data && typeof report.data === "object" && !Array.isArray(report.data)) {
    return report.data;
  }
  return report;
}

function humanizeKey(key) {
  return key
    .replace(/[_-]/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatValue(key, value) {
  if (value === null || value === undefined || value === "") return "-";
  const numericValue = Number(value);

  if (Number.isFinite(numericValue)) {
    if (/value|amount|price|usd|inr|fob|tax|duty/i.test(key)) {
      return `$${numericValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    }
    return numericValue.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }

  return String(value);
}

function metricCards(report, fallbackCards) {
  const root = getRoot(report);
  const cards = Object.entries(root)
    .filter(([, value]) => value !== null && value !== undefined && typeof value !== "object")
    .slice(0, 8)
    .map(([key, value]) => ({
      label: humanizeKey(key),
      value: formatValue(key, value),
    }));

  return cards.length ? cards : fallbackCards;
}

function reportLists(report) {
  const root = getRoot(report);
  return Object.entries(root)
    .filter(([, value]) => Array.isArray(value))
    .slice(0, 4)
    .map(([key, value]) => ({
      title: humanizeKey(key),
      rows: value.slice(0, 8),
    }));
}

function itemName(item) {
  if (typeof item !== "object" || item === null) return String(item);
  return (
    item.name ||
    item.label ||
    item.country ||
    item.company ||
    item.Importer_Name ||
    item.Exporter_Name ||
    item.HS_Code ||
    item.Product_Description ||
    "Unknown"
  );
}

function itemValue(item) {
  if (typeof item !== "object" || item === null) return "";
  const entry = Object.entries(item).find(([key, value]) => {
    if (/name|label|country|company|description/i.test(key)) return false;
    return typeof value === "number" || (typeof value === "string" && value.trim());
  });

  return entry ? formatValue(entry[0], entry[1]) : "";
}

function MetricCard({ card, index }) {
  const icons = [TrendingUp, BarChart3, Globe2, Boxes];
  const Icon = icons[index % icons.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="rounded-[24px] border border-white/80 bg-white/85 p-5 shadow-[0_18px_50px_rgba(0,52,102,0.10)] backdrop-blur-xl"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
            {card.label}
          </p>
          <p className="mt-3 text-2xl font-black text-[#003466]">
            {card.value}
          </p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
          <Icon size={20} />
        </div>
      </div>
    </motion.div>
  );
}

function RankedPanel({ section, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="rounded-[28px] border border-white/80 bg-white/85 p-5 shadow-[0_18px_50px_rgba(0,52,102,0.10)] backdrop-blur-xl"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-sm font-black uppercase tracking-[0.14em] text-[#003466]">
          {section.title}
        </h3>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-700 ring-1 ring-blue-100">
          Top {section.rows.length}
        </span>
      </div>

      <div className="space-y-2">
        {section.rows.map((item, rowIndex) => (
          <div
            key={`${section.title}-${rowIndex}`}
            className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50/80 px-4 py-3 ring-1 ring-slate-100"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#031c35] font-mono text-[11px] font-bold text-blue-100">
                {String(rowIndex + 1).padStart(2, "0")}
              </span>
              <span className="truncate text-sm font-bold text-slate-700">
                {itemName(item)}
              </span>
            </div>
            <span className="shrink-0 font-mono text-xs font-bold text-blue-700">
              {itemValue(item)}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function Synopsis({ report, fallbackCards = [] }) {
  const cards = metricCards(report, fallbackCards);
  const lists = reportLists(report);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card, index) => (
          <MetricCard key={`${card.label}-${index}`} card={card} index={index} />
        ))}
      </div>

      {lists.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {lists.map((section, index) => (
            <RankedPanel key={section.title} section={section} index={index} />
          ))}
        </div>
      ) : (
        <div className="rounded-[28px] border border-white/80 bg-white/85 p-8 text-center shadow-[0_18px_50px_rgba(0,52,102,0.10)] backdrop-blur-xl">
          <p className="text-sm font-bold text-[#003466]">
            Run a search to load deeper report breakdowns.
          </p>
          <p className="mt-2 text-sm text-slate-500">
            The synopsis will automatically render ranked sections from the report response.
          </p>
        </div>
      )}
    </div>
  );
}
