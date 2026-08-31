"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";

export const reportByOptions = [
  ["Export Country", "Export_Country"], ["Supplier Name", "Supplier_Name"], ["Importer ID", "Importer_ID"],
  ["Importer Name", "Importer_Name"], ["Unloading Port", "Unloading_Port"], ["Dispatch Port", "Dispatch_Port"],
  ["HS Code", "HS_Code"], ["Heading", "Heading"], ["Chapter", "Chapter"], ["Month", "Month"], ["Transport Mode", "Transport_Mode"],
];
const emptyRows = [];

function apiRows(payload) {
  if (Array.isArray(payload)) return payload;
  for (const key of ["data", "results", "rows", "items", "records"]) if (Array.isArray(payload?.[key])) return payload[key];
  return payload?.data && typeof payload.data === "object" ? apiRows(payload.data) : [];
}

function value(value) {
  if (value === null || value === undefined || value === "") return "-";
  return typeof value === "object" ? JSON.stringify(value) : String(value);
}

const defaultTotal = 1000;

function responseTotal(payload) {
  const candidates = [payload?.meta?.total_value, payload?.data?.meta?.total_value, payload?.total_value];
  const total = candidates.find((item) => Number(item) > 0);
  return total === undefined ? defaultTotal : Number(total);
}

export default function ReportBy({ requestBase, groupBy }) {
  const [cache, setCache] = useState({});
  const [offset, setOffset] = useState(0);
  const [reloadToken, setReloadToken] = useState(0);
  const limit = 50;
  const requestKey = JSON.stringify(requestBase);
  const cacheKey = `${groupBy}-${offset}`;
  const entry = cache[cacheKey];
  const rows = entry?.rows || emptyRows;
  const columns = useMemo(() => Array.from(new Set(rows.flatMap((row) => Object.keys(row || {})))), [rows]);

  useEffect(() => {
    if (!groupBy || entry?.loading || entry?.loaded) return;
    let cancelled = false;
    fetch("/api/trades/trends/monthly", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...requestBase, group_by: groupBy, metric: "Total_Value_in_USD", limit, offset }) })
      .then(async (response) => { const payload = await response.json(); if (!response.ok) throw new Error(payload?.message || "Unable to load report data."); return payload; })
      .then((payload) => { if (!cancelled) setCache((current) => ({ ...current, [cacheKey]: { rows: apiRows(payload), loading: false, error: "", loaded: true, total: responseTotal(payload) } })); })
      .catch((error) => { if (!cancelled) setCache((current) => ({ ...current, [cacheKey]: { rows: [], loading: false, error: error.message || "Unable to load report data.", loaded: false, total: defaultTotal } })); });
    return () => { cancelled = true; };
  }, [cacheKey, entry?.loaded, entry?.loading, groupBy, limit, offset, reloadToken, requestBase, requestKey]);

  const total = entry?.total || defaultTotal;
  return <div className="min-h-[420px] p-5">{!groupBy ? <div className="flex min-h-[280px] items-center justify-center text-sm font-semibold text-slate-500">Choose a report option from the tab bar to load its table.</div> : !entry || entry.loading ? <div className="flex min-h-[280px] items-center justify-center gap-3 text-sm font-bold text-blue-700"><RefreshCw size={18} className="animate-spin" />Loading report</div> : entry.error ? <div className="flex min-h-[280px] flex-col items-center justify-center gap-4"><p className="text-sm font-semibold text-amber-800">{entry.error}</p><button onClick={() => { setCache((current) => { const { [cacheKey]: _removed, ...rest } = current; return rest; }); setReloadToken((token) => token + 1); }} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white">Try again</button></div> : entry.loaded && !rows.length ? <div className="flex min-h-[280px] items-center justify-center text-sm font-semibold text-slate-500">No data returned for this report.</div> : entry.loaded ? <><div className="overflow-auto rounded-2xl border border-blue-100"><table className="min-w-full border-separate border-spacing-0 text-sm"><thead className="bg-blue-50/80"><tr>{columns.map((column) => <th key={column} className="whitespace-nowrap border-b border-r border-blue-100 px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-blue-600">{column.replaceAll("_", " ")}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={index} className="hover:bg-blue-50/50">{columns.map((column) => <td key={column} className="max-w-[320px] truncate border-b border-r border-blue-50 px-4 py-3 text-slate-700" title={value(row[column])}>{value(row[column])}</td>)}</tr>)}</tbody></table></div><div className="mt-4 flex flex-wrap items-center justify-between gap-3"><span className="text-sm font-bold text-[#003466]">Showing {(offset + 1).toLocaleString()}-{Math.min(offset + rows.length, total).toLocaleString()} of {total.toLocaleString()} <span className="ml-2 rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700">50 per page</span></span><div className="flex items-center gap-2"><button onClick={() => setOffset(Math.max(0, offset - limit))} disabled={offset === 0} className="inline-flex h-10 items-center gap-1 rounded-xl border border-blue-100 bg-white px-3 text-sm font-bold text-blue-700 disabled:opacity-40"><ChevronLeft size={15} />Previous</button><span className="rounded-xl bg-[#031c35] px-3 py-2 font-mono text-xs font-bold text-cyan-200">Page {Math.floor(offset / limit) + 1} / {Math.max(1, Math.ceil(total / limit))}</span><button onClick={() => setOffset(offset + limit)} disabled={offset + limit >= total} className="inline-flex h-10 items-center gap-1 rounded-xl bg-blue-600 px-3 text-sm font-bold text-white disabled:opacity-40">Next<ChevronRight size={15} /></button></div></div></> : null}</div>;
}
