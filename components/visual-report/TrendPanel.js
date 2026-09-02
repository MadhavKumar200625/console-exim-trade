"use client";

import { RefreshCw } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const chartColors = ["#1d4ed8", "#0ea5e9", "#06b6d4", "#8b5cf6", "#f59e0b", "#ec4899", "#14b8a6", "#64748b", "#2563eb", "#84cc16"];

function valueFor(row) {
  return Number(row?.value ?? row?.total_value_usd ?? 0) || 0;
}

export default function TrendPanel({ title, rows, loading, error, chartFirst, chartType, tableColumns = [] }) {
  const chartRows = rows.slice(0, 10);
  const total = chartRows.reduce((sum, row) => sum + valueFor(row), 0) || 1;
  const pieGradient = chartRows.map((row, index) => {
    const start = (chartRows.slice(0, index).reduce((sum, item) => sum + valueFor(item), 0) / total) * 100;
    const end = start + (valueFor(row) / total) * 100;
    return `${chartColors[index % chartColors.length]} ${start}% ${end}%`;
  }).join(", ");

  const displayTableValue = (row, column) => {
    if (column === "Total_Value_in_USD") return valueFor(row);
    if (column === "Month") return row.Month ?? row.month ?? row.dim ?? "-";
    if (column === "Country") return row.Country ?? row.country ?? row.dim ?? "-";
    if (column === "HS_Code") return row.HS_Code ?? row.hs_code ?? row.dim ?? "-";
    if (column === "Importer_Name") return row.Importer_Name ?? row.importer_name ?? row.dim ?? "-";
    if (column === "Exporter_Name") return row.Exporter_Name ?? row.exporter_name ?? "-";
    return row[column] ?? "-";
  };
  const table = (
    <div className="min-w-0 overflow-auto rounded-2xl border border-blue-100 bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-blue-50/80 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-blue-600"><tr>{tableColumns.map((column) => <th key={column} className="px-4 py-3">{column.replaceAll("_", " ")}</th>)}</tr></thead>
        <tbody>{rows.slice(0, 10).map((row, index) => <tr key={`${row.dim ?? "dimension"}-${row.month ?? index}-${index}`} className="border-t border-blue-50 text-slate-700">{tableColumns.map((column) => <td key={column} className="max-w-[220px] truncate px-4 py-3 font-mono text-xs" title={String(displayTableValue(row, column))}>{column === "Total_Value_in_USD" ? Number(displayTableValue(row, column)).toLocaleString() : displayTableValue(row, column)}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );

  const barChart = (
    <div className="min-w-0 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-4"><p className="mb-4 text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600">Total value in USD</p><div className="h-[300px] min-w-0"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartRows.map((row) => ({ dimension: String(row.dim ?? "-"), value: valueFor(row) }))} margin={{ top: 8, right: 8, left: 0, bottom: 40 }}><defs><linearGradient id={`bar-gradient-${title}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2563eb" /><stop offset="100%" stopColor="#06b6d4" /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dbeafe" /><XAxis dataKey="dimension" interval={0} angle={-35} textAnchor="end" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} /><YAxis tickFormatter={(value) => Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value)} tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} width={48} /><Tooltip cursor={{ fill: "#dbeafe" }} formatter={(value) => [Number(value).toLocaleString(), "Value"]} labelFormatter={(label) => `${title}: ${label}`} contentStyle={{ borderRadius: 12, border: "1px solid #bfdbfe", boxShadow: "0 10px 30px rgba(0, 52, 102, 0.12)" }} /><Bar dataKey="value" fill={`url(#bar-gradient-${title})`} radius={[6, 6, 0, 0]} maxBarSize={42} /></BarChart></ResponsiveContainer></div></div>
  );

  const pieChart = (
    <div className="min-w-0 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-4"><p className="mb-4 text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600">Share of total value</p><div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start"><div className="relative h-40 w-40 shrink-0 rounded-full shadow-inner" style={{ background: `conic-gradient(${pieGradient})` }}><div className="absolute inset-8 flex items-center justify-center rounded-full bg-white text-center text-xs font-black text-[#003466]">${(total / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })}K</div></div><div className="grid min-w-0 flex-1 grid-cols-1 gap-2 text-xs">{chartRows.map((row, index) => <div key={`${row.dim ?? index}-legend`} className="flex items-center justify-between gap-2"><span className="flex min-w-0 items-center gap-2"><i className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: chartColors[index % chartColors.length] }} /><span className="truncate font-semibold text-slate-600">{row.dim ?? "-"}</span></span><span className="font-mono text-slate-500">{((valueFor(row) / total) * 100).toFixed(1)}%</span></div>)}</div></div></div>
  );

  const chart = chartType === "pie" ? pieChart : barChart;
  return <section className="rounded-[24px] border border-blue-100 bg-white/80 p-5 shadow-sm"><div className="mb-4 flex items-center justify-between gap-3"><h4 className="text-sm font-black uppercase tracking-[0.14em] text-[#003466]">{title} trend</h4><span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700">{chartType === "pie" ? "Pie chart" : "Bar chart"}</span></div>{loading ? <div className="flex h-52 items-center justify-center gap-2 text-sm font-bold text-blue-700"><RefreshCw size={18} className="animate-spin" />Loading trend</div> : error ? <div className="flex h-52 items-center justify-center text-center text-sm font-semibold text-amber-800">{error}</div> : !rows.length ? <div className="flex h-52 items-center justify-center text-sm font-semibold text-slate-500">No trend data available.</div> : <div className="grid gap-5 lg:grid-cols-2">{chartFirst ? <>{chart}{table}</> : <>{table}{chart}</>}</div>}</section>;
}
