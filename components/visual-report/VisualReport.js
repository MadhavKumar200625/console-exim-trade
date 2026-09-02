"use client";

import { useEffect, useMemo, useState } from "react";
import TrendPanel from "./TrendPanel";

const reports = [
  { id: "hs-code", title: "HS Code", groupBy: "HS_Code", tableColumns: ["HS_Code", "Total_Value_in_USD"], chartFirst: false, chartType: "bar" },
  { id: "month", title: "Month", groupBy: "Month", tableColumns: ["Month", "Total_Value_in_USD"], chartFirst: true, chartType: "pie" },
  { id: "country", title: "Country", groupBy: "Country", tableColumns: ["Country", "Total_Value_in_USD"], chartFirst: false, chartType: "bar" },
  { id: "partner", title: "Importer / Exporter", groupBy: "Importer_Name", tableColumns: ["Importer_Name", "Exporter_Name", "Total_Value_in_USD"], chartFirst: true, chartType: "pie" },
];

function extractRows(data) {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];
  for (const key of ["data", "results", "rows", "items", "records"]) if (Array.isArray(data[key])) return data[key];
  return data.data && typeof data.data === "object" ? extractRows(data.data) : [];
}

export default function VisualReport({ requestBase, tradeType }) {
  const metric = "Total_Value_in_USD";
  const requestKey = JSON.stringify(requestBase);
  const configs = useMemo(() => reports.map((report) => report.id === "partner" ? { ...report, groupBy: tradeType === "import" ? "Exporter_Name" : "Importer_Name" } : report), [tradeType]);
  const [data, setData] = useState({});

  useEffect(() => {
    let cancelled = false;
    setData(Object.fromEntries(configs.map((report) => [report.id, { rows: [], loading: true, error: "" }])));
    Promise.all(configs.map(async (report) => {
      try {
        const response = await fetch("/api/trades/trends/monthly", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...requestBase, group_by: report.groupBy, metric }) });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload?.message || "Unable to load trend data.");
        return [report.id, { rows: extractRows(payload), loading: false, error: "" }];
      } catch (error) {
        return [report.id, { rows: [], loading: false, error: error.message || "Unable to load trend data." }];
      }
    })).then((result) => { if (!cancelled) setData(Object.fromEntries(result)); });
    return () => { cancelled = true; };
  }, [configs, requestBase, requestKey]);

  return <div className="space-y-5 p-5">{configs.map((report) => <TrendPanel key={report.id} {...report} metric={metric} {...(data[report.id] || { rows: [], loading: true, error: "" })} />)}</div>;
}
