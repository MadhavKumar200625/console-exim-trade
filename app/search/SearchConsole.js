"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  Expand,
  Save,
  X,
  ChevronDown,
  Filter,
  ArrowRight,
  Calendar,
  Lightbulb,
  Eye,
  Copy,
  Settings,
  Download,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  RefreshCw,
  Database,
  CheckCircle2,
  Users,
  Truck,
  BarChart3,
  FileBarChart,
  TrendingUp,
} from "lucide-react";
import { labelForField } from "./searchConfig";
import AdvancedSearchFields, { createAdvancedRow } from "./AdvancedSearchFields";
import VisualReport from "@/components/visual-report/VisualReport";
import ReportBy, { reportByOptions } from "@/components/report-by/ReportBy";
import { COUNTRIES } from "./countries";

const exportColumns = [
  "Date",
  "Country",
  "Import_Country",
  "Importer_ID",
  "Importer_Name",
  "Importer_Address",
  "Exporter_ID",
  "Exporter_Name",
  "Exporter_Address",
  "Loading_Port",
  "Unloading_Port",
  "HS_Code",
  "HS_Code_Description",
  "Product_Description",
  "Quantity",
  "Net_Weight_in_KG",
  "Gross_Weight_in_KG",
  "Unit_Name",
  "Total_Value_in_USD",
  "Heading",
  "Chapter",
  "Month",
  "Year",
  "Package_Unit",
  "No_of_Packages",
  "Transport_Mode",
  "ID",
];

const importColumns = [
  "Date",
  "Country",
  "Export_Country",
  "Exporter_ID",
  "Exporter_Name",
  "Exporter_Address",
  "Importer_ID",
  "Importer_Name",
  "Importer_Address",
  "Unloading_Port",
  "Loading_Port",
  "HS_Code",
  "HS_Code_Description",
  "Product_Description",
  "Quantity",
  "Net_Weight_in_KG",
  "Gross_Weight_in_KG",
  "Unit_Name",
  "Total_Value_in_USD",
  "Heading",
  "Chapter",
  "Month",
  "Year",
  "Package_Unit",
  "No_of_Packages",
  "Transport_Mode",
  "ID",
];

const apiColumnMap = {
  Date: "Date",
  Country: "Country",
  Import_Country: "Import_Country",
  Export_Country: "Export_Country",
  Importer_ID: "Importer_ID",
  Importer_Name: "Importer_Name",
  Importer_Address: "Importer_Address",
  Exporter_ID: "Exporter_ID",
  Exporter_Name: "Exporter_Name",
  Exporter_Address: "Exporter_Address",
  Loading_Port: "Loading_Port",
  Unloading_Port: "Unloading_Port",
  HS_Code: "HS_Code",
  HS_Code_Description: "HS_CODE_Description",
  Product_Description: "Product_Description",
  Quantity: "Quantity",
  Net_Weight_in_KG: "Net_Weight_in_KG",
  Gross_Weight_in_KG: "Gross_Weight_in_KG",
  Unit_Name: "Unit_Name",
  Total_Value_in_USD: "Total_Value_in_USD",
  Heading: "Heading",
  Chapter: "Chapter",
  Month: "month",
  Year: "year",
  Package_Unit: "Package_Unit",
  No_of_Packages: "No_of_Packages",
  Transport_Mode: "Transport_Mode",
  ID: "ID",
};

const measurableColumns = new Set([
  "Quantity",
  "Net_Weight_in_KG",
  "Gross_Weight_in_KG",
  "Total_Value_in_USD",
  "Heading",
  "Chapter",
  "Month",
  "Year",
  "No_of_Packages",
  "ID",
]);

const randomRows = Array.from({ length: 120 }).map((_, i) => ({
  Date: `${String((i % 27) + 1).padStart(2, "0")} Oct 2025`,
  "HS Code": ["847130", "87089900", "850440", "851762"][i % 4],
  Product: [
    "Laptop Computers",
    "Motor Vehicle Parts",
    "Static Converters",
    "Network Equipment",
  ][i % 4],
  Exporter: ["Tech Global Ltd", "Chongqing Machinery Co", "Voltex Systems", "Nexus Components"][i % 4],
  "Exporter Country": ["China", "Germany", "Vietnam", "USA"][i % 4],
  Importer: ["India Electronics", "Volvo India Pvt Ltd", "Nova Imports", "Apex Mobility"][i % 4],
  "Importer Country": "India",
  Quantity: 500 + i,
  Unit: "PCS",
  Price: 1200 + i * 3,
  Currency: "USD",
  Port: "Shanghai",
  "Shipment Mode": "Sea",
  "Trade Type": "Export",
}));

const defaultGlobalSummary = {
  total_shipments: 538413846,
  total_quantity: 20180394833963.258,
  total_value_usd: 8642876888368.149,
};
const DEFAULT_PAGINATION_TOTAL = 1000;
const globalMetrics = ["Quantity", "shipment_count", "Total_Value_in_USD"];
const countryMetrics = [...globalMetrics, "Total_Value_in_INR", "Total_Value_in_VND"];
const tradeSearchCache = new Map();
const TRADE_SEARCH_CACHE_TTL = 10 * 60 * 1000;

function defaultDateRange() {
  const end = new Date();
  const start = new Date(end);
  start.setFullYear(start.getFullYear() - 1);
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
}

function googleCompanyUrl(name) {
  return `https://www.google.com/search?q=${encodeURIComponent(String(name || ""))}`;
}

function AggregationTable({ title, rows, loading, error, onRetry, offset, limit, total, onPrevious, onNext, companyField, onCompanySelect }) {
  const columns = Array.from(
    new Set(rows.flatMap((row) => (row && typeof row === "object" ? Object.keys(row) : []))),
  );
  const displayValue = (value) => {
    if (value === null || value === undefined || value === "") return "-";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  return (
    <div className="min-h-[420px]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-blue-100 bg-blue-50/40 px-5 py-4">
        <div>
          <h4 className="text-sm font-black uppercase tracking-[0.14em] text-[#003466]">{title}</h4>
          <p className="mt-1 text-xs text-slate-500">Loaded on demand from the trade aggregation API.</p>
        </div>
        {rows.length > 0 && <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-blue-700 ring-1 ring-blue-100">{total.toLocaleString()} records</span>}
      </div>

      {loading ? (
        <div className="flex min-h-[330px] flex-col items-center justify-center gap-4 px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-xl"><RefreshCw size={22} className="animate-spin" /></div>
          <div><p className="font-bold text-[#003466]">Loading {title.toLowerCase()}</p><p className="mt-1 text-xs text-slate-500">Fetching only this tab&apos;s data.</p></div>
        </div>
      ) : error ? (
        <div className="flex min-h-[330px] flex-col items-center justify-center gap-4 px-6 text-center"><p className="max-w-md text-sm font-semibold text-amber-800">{error}</p><button onClick={onRetry} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow">Try again</button></div>
      ) : !rows.length ? (
        <div className="flex min-h-[330px] items-center justify-center px-6 text-center text-sm font-semibold text-slate-500">No {title.toLowerCase()} were returned for the current search.</div>
      ) : (
        <div className="w-full overflow-auto">
          <table className="min-w-full border-separate border-spacing-0 text-sm">
            <thead className="bg-white/90"><tr><th className="sticky left-0 z-10 border-b border-r border-blue-100 bg-blue-50 px-4 py-4 text-left text-[10px] font-bold uppercase tracking-[0.18em] text-blue-500">#</th>{columns.map((column) => <th key={column} className="whitespace-nowrap border-b border-r border-blue-100 px-4 py-4 text-left text-[11px] font-bold uppercase tracking-[0.08em] text-[#003466]">{column.replaceAll("_", " ")}</th>)}</tr></thead>
            <tbody>{rows.map((row, index) => <tr key={index} className="group hover:bg-blue-50/60"><td className="sticky left-0 z-10 border-b border-r border-blue-50 bg-white px-4 py-3 font-mono text-xs font-bold text-blue-600 group-hover:bg-blue-50">{String(offset + index + 1).padStart(2, "0")}</td>{columns.map((column) => <td key={column} className="max-w-[280px] truncate border-b border-blue-50 px-4 py-3 text-slate-700" title={displayValue(row[column])}>{column.toLowerCase() === companyField.toLowerCase() && row[column] ? <button onClick={() => onCompanySelect(row[column], row)} className="inline-flex max-w-full items-center gap-1 truncate text-left font-bold text-blue-700 underline decoration-blue-300 underline-offset-2 hover:text-cyan-600 hover:decoration-cyan-500">{displayValue(row[column])}<ArrowUpRight size={13} aria-hidden="true" /></button> : displayValue(row[column])}</td>)}</tr>)}</tbody>
          </table>
        </div>
      )}
      {!loading && !error && total > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-blue-100 bg-gradient-to-r from-white via-blue-50/60 to-white px-5 py-4">
          <span className="text-sm font-bold text-[#003466]">Showing {(offset + 1).toLocaleString()}-{Math.min(offset + rows.length, total).toLocaleString()} of {total.toLocaleString()}</span>
          <div className="flex items-center gap-2"><button onClick={onPrevious} disabled={offset === 0} className="inline-flex h-10 items-center gap-1 rounded-xl border border-blue-100 bg-white px-3 text-sm font-bold text-blue-700 disabled:opacity-40"><ChevronLeft size={15} />Previous</button><span className="rounded-xl bg-[#031c35] px-3 py-2 font-mono text-xs font-bold text-cyan-200">Page {Math.floor(offset / limit) + 1} / {Math.max(1, Math.ceil(total / limit))}</span><button onClick={onNext} disabled={offset + limit >= total} className="inline-flex h-10 items-center gap-1 rounded-xl bg-blue-600 px-3 text-sm font-bold text-white disabled:opacity-40">Next<ChevronRight size={15} /></button></div>
        </div>
      )}
    </div>
  );
}

export default function SearchConsole({
  initialSuggestions = [],
  initialSuggestionQuery = "",
  initialSuggestionRequestPayload = null,
  initialSuggestionEndpoint = null,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const homeSearchRun = searchParams.get("run");
  const homeAdvancedFilters = searchParams.get("advancedFilters") || "";
  const [country, setCountry] = useState(() => searchParams.get("suggestCountry") || "");

  const [showCountry, setShowCountry] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const filteredCountries = COUNTRIES.filter((name) => name.toLowerCase().includes(countrySearch.trim().toLowerCase()));
  const [searchType, setSearchType] = useState(() => searchParams.get("suggestType") || "hscode");
  const [tradeType, setTradeType] = useState(() => searchParams.get("suggestTradeType") || "export");
  const isGlobalSearch = !country;
  const columns = tradeType === "export" ? exportColumns : importColumns;
  const globalAwareColumns = useMemo(() => {
    if (!isGlobalSearch) return columns;

    const ordered = columns.filter(
      (column) => column !== "Country" && column !== "Import_Country" && column !== "Export_Country",
    );

    const importerIndex = ordered.findIndex((column) => column === "Importer_ID");
    if (importerIndex !== -1) {
      ordered.splice(importerIndex, 0, "Import_Country");
    }

    const exporterIndex = ordered.findIndex((column) => column === "Exporter_ID");
    if (exporterIndex !== -1) {
      ordered.splice(exporterIndex, 0, "Export_Country");
    }

    return ordered;
  }, [columns, isGlobalSearch]);
  const activeColumns = isGlobalSearch ? globalAwareColumns : columns;
  const [query, setQuery] = useState(initialSuggestionQuery);
  const [suggestions, setSuggestions] = useState(initialSuggestions);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [pageSize, setPageSize] = useState(25);
  const [pageOffset, setPageOffset] = useState(0);
  const [totalRecords, setTotalRecords] = useState(DEFAULT_PAGINATION_TOTAL);
  const [lastIncludeAdvanced, setLastIncludeAdvanced] = useState(true);
  const [rows, setRows] = useState(randomRows.slice(0, 25));
  const [summary, setSummary] = useState(defaultGlobalSummary);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [apiMessage, setApiMessage] = useState("");
  const [toast, setToast] = useState(null);
  const [columnFilters, setColumnFilters] = useState({});
  const [filterOptions, setFilterOptions] = useState({});
  const [filterQueries, setFilterQueries] = useState({});
  const [filterLoading, setFilterLoading] = useState(null);
  const [filterErrors, setFilterErrors] = useState({});
  const [advancedRows, setAdvancedRows] = useState(() => {
    try {
      const rows = JSON.parse(searchParams.get("advancedFilters") || "[]");
      if (!Array.isArray(rows)) return [];
      const seen = new Set();
      return rows
        .filter((row) => row?.field && row?.value?.trim() && !seen.has(row.field) && seen.add(row.field))
        .map((row) => ({ ...row, id: createAdvancedRow().id }));
    } catch {
      return [];
    }
  });

  const [dateRange, setDateRange] = useState(defaultDateRange);
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    setSuggestions(initialSuggestions);
  }, [initialSuggestions]);

  useEffect(() => {
    if (!initialSuggestionRequestPayload) return;
    console.log(
      `[UPSTREAM API] POST ${initialSuggestionEndpoint || "trades search"}`,
      "Request payload:",
      initialSuggestionRequestPayload,
    );
  }, [initialSuggestionEndpoint, initialSuggestionRequestPayload]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const trimmedQuery = query.trim();

      if (trimmedQuery.length >= 2) {
        params.set("suggestQuery", trimmedQuery);
        params.set("suggestType", searchType);
        if (country) {
          params.set("suggestCountry", country);
        } else {
          params.delete("suggestCountry");
        }
        params.set("suggestTradeType", tradeType);
        params.set("suggestFrom", dateRange.start);
        params.set("suggestTo", dateRange.end);
      } else {
        params.delete("suggestQuery");
        params.delete("suggestType");
        params.delete("suggestCountry");
        params.delete("suggestTradeType");
        params.delete("suggestFrom");
        params.delete("suggestTo");
        setSuggestions([]);
      }

      const nextQueryString = params.toString();
      if (nextQueryString !== searchParams.toString()) {
        router.replace(
          nextQueryString ? `/search?${nextQueryString}` : "/search",
          { scroll: false },
        );
      }
    }, 350);

    return () => clearTimeout(timeout);
  }, [
    country,
    dateRange.end,
    dateRange.start,
    query,
    router,
    searchParams,
    searchType,
    tradeType,
  ]);
  const [visibleColumns, setVisibleColumns] = useState(activeColumns);
  const [columnDraft, setColumnDraft] = useState(activeColumns);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [filterColumn, setFilterColumn] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [showAdvance, setShowAdvance] = useState(false);
  const [activeTab, setActiveTab] = useState("data");
  const [reportByGroup, setReportByGroup] = useState("");
  const [trendByGroup, setTrendByGroup] = useState("");
  const [reportMetric, setReportMetric] = useState("Total_Value_in_USD");
  const [trendMetric, setTrendMetric] = useState("Total_Value_in_USD");
  const [aggregationData, setAggregationData] = useState({
    importers: { rows: [], loading: false, error: "", loaded: false, offset: 0, limit: 50, total: DEFAULT_PAGINATION_TOTAL },
    suppliers: { rows: [], loading: false, error: "", loaded: false, offset: 0, limit: 50, total: DEFAULT_PAGINATION_TOTAL },
  });
  const [countryChoices, setCountryChoices] = useState(null);
  const [workspaceReady, setWorkspaceReady] = useState(false);
  const initialSearchRequested = useRef(false);
  const availableColumns = useMemo(
    () => (
      isGlobalSearch
        ? globalAwareColumns
        : columns.filter((column) => column !== "Country")
    ),
    [columns, globalAwareColumns, isGlobalSearch],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = JSON.parse(window.sessionStorage.getItem("trade-search-workspace") || "null");
        const runKey = homeSearchRun ? `trade-search-run:${homeSearchRun}` : "";
        const isFreshHomeSearch = Boolean(runKey && !window.sessionStorage.getItem(runKey));
        // Only a freshly initiated Home search replaces the existing workspace.
        // Reloading its URL restores the saved table instead of clearing it.
        if (saved && !isFreshHomeSearch) {
          setCountry(saved.country || ""); setTradeType(saved.tradeType || "export"); setQuery(saved.query || "");
          setRows(Array.isArray(saved.rows) ? saved.rows : []); setSummary(saved.summary || defaultGlobalSummary);
          setTotalRecords(saved.totalRecords || 0); setPageOffset(saved.pageOffset || 0); setPageSize(saved.pageSize || 25);
          setDateRange(saved.dateRange || dateRange); setVisibleColumns((saved.visibleColumns || columns).filter((column) => saved.country || column !== "Country")); setColumnFilters(saved.columnFilters || {});
        }
      } catch {} finally { setWorkspaceReady(true); }
    }, 0);
    return () => window.clearTimeout(timer);
  // Restore once per mounted search workspace.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!workspaceReady) return;
    try { window.sessionStorage.setItem("trade-search-workspace", JSON.stringify({ country, tradeType, query, rows, summary, totalRecords, pageOffset, pageSize, dateRange, visibleColumns, columnFilters })); } catch {}
  }, [columnFilters, country, dateRange, pageOffset, pageSize, query, rows, summary, totalRecords, tradeType, visibleColumns, workspaceReady]);

  const filterRef = useRef(null);
  const dropdownRef = useRef(null);
  const calendarRef = useRef(null);
  const searchBoxRef = useRef(null);
  const columnSelectorRef = useRef(null);

  const formatDate = (date) =>
  new Intl.DateTimeFormat("en-GB").format(new Date(date));
  useEffect(() => {
    function handleClickOutside(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterColumn(null);
      }

      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowCountry(false);
      if (calendarRef.current && !calendarRef.current.contains(e.target)) setShowCalendar(false);
      if (columnSelectorRef.current && !columnSelectorRef.current.contains(e.target)) {
        setShowColumnSelector(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const metricOptions = country ? countryMetrics : globalMetrics;

  useEffect(() => {
    if (!metricOptions.includes(reportMetric)) setReportMetric("Total_Value_in_USD");
    if (!metricOptions.includes(trendMetric)) setTrendMetric("Total_Value_in_USD");
  }, [country, metricOptions, reportMetric, trendMetric]);

  useEffect(() => {
    if (!toast) return undefined;

    const timeout = window.setTimeout(() => {
      setToast(null);
    }, 2600);

    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    setVisibleColumns(availableColumns);
    setColumnDraft(availableColumns);
    setFilterColumn(null);
    setColumnFilters({});
  }, [availableColumns, columns, tradeType]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCountry(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function toggleColumn(col) {
    if (columnDraft.includes(col)) {
      setColumnDraft(columnDraft.filter((c) => c !== col));
    } else {
      setColumnDraft([...columnDraft, col]);
    }
  }

  function formatInputDate(date) {
    return date.toISOString().slice(0, 10);
  }

  function normalizeApiRows(apiRows) {
    return apiRows.map((item) =>
      activeColumns.reduce((acc, column) => {
        const apiKey = apiColumnMap[column];
        const value =
          item?.[apiKey] ??
          item?.[column] ??
          (column === "Country" ? country || "Global" : "");
        acc[column] = typeof value === "number" && !Number.isInteger(value)
          ? Number(value.toFixed(2))
          : value;
        return acc;
      }, {}),
    );
  }

  function getApiField(column) {
    return apiColumnMap[column] || column;
  }

  function getOptionLabel(option) {
    if (option === null || option === undefined) return "";
    if (typeof option !== "object") return String(option);
    return String(
      option.value ??
        option.key ??
        option.name ??
        option.label ??
        option[getApiField(filterColumn)] ??
        "",
    );
  }

  function getFacetValues(data, field) {
    if (!data || typeof data !== "object") return [];

    const candidates = [
      data[field],
      data.facets?.[field],
      data.filters?.[field],
      data.data?.[field],
      data.data?.facets?.[field],
      data.data?.filters?.[field],
      data.result?.[field],
      data.results?.[field],
    ];

    for (const candidate of candidates) {
      if (Array.isArray(candidate)) return candidate;
      if (candidate && typeof candidate === "object") {
        return Object.entries(candidate).map(([value, count]) => ({
          value,
          count,
        }));
      }
    }

    for (const value of Object.values(data)) {
      if (!value || typeof value !== "object") continue;
      const nested = getFacetValues(value, field);
      if (nested.length) return nested;
    }

    return [];
  }

  function getApiRows(data) {
    if (Array.isArray(data)) return data;
    if (!data || typeof data !== "object") return [];

    for (const key of ["data", "results", "rows", "items", "records"]) {
      if (Array.isArray(data[key])) return data[key];
    }

    if (data.data && typeof data.data === "object") {
      return getApiRows(data.data);
    }

    return [];
  }

  function getApiTotal(data, fallback) {
    if (!data || typeof data !== "object") return fallback;
    const candidates = [
      data.meta?.total_value,
      data.data?.meta?.total_value,
      data.result?.meta?.total_value,
      data.total_value,
    ];
    const total = candidates.find((value) => Number(value) > 0);
    return total === undefined ? fallback : Number(total);
  }

  function getSummaryData(data) {
    if (!data || typeof data !== "object") return null;

    if (
      data.total_shipments !== undefined ||
      data.total_quantity !== undefined ||
      data.total_value_usd !== undefined
    ) {
      return data;
    }

    for (const key of ["data", "summary", "result", "totals"]) {
      const value = data[key];
      if (!value || typeof value !== "object") continue;
      const nested = getSummaryData(value);
      if (nested) return nested;
    }

    return null;
  }

  function getDemoPage(offset = pageOffset, limit = pageSize) {
    return Array.from({ length: limit }, (_, index) => randomRows[(offset + index) % randomRows.length]);
  }

  function showTableToast(message) {
    setToast({
      id: Date.now(),
      message,
    });
  }

  function notifyUsageChanged() {
    window.dispatchEvent(new Event("console-usage-updated"));
  }

  function rowsToCsv() {
    const headers = visibleColumns;
    const escapeCell = (value) => {
      const text = String(value ?? "");
      return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
    };

    return [
      headers.map(escapeCell).join(","),
      ...rows.map((row) => headers.map((column) => escapeCell(row[column])).join(",")),
    ].join("\n");
  }

  async function handleSaveTable() {
    setIsSaving(true);
    try {
      const payload = {
        ...buildSearchPayload(lastIncludeAdvanced, pageOffset, pageSize),
        name: query.trim() || `${country || "Global"} ${tradeType} table`,
      };
      const response = await fetch("/api/user/workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to save table.");
      showTableToast(data.saved ? "Table saved to workspace." : "SQL is not configured yet.");
    } catch (error) {
      showTableToast(error.message || "Unable to save table.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDownload() {
    setIsDownloading(true);
    try {
      const payload = {
        ...buildSearchPayload(lastIncludeAdvanced, pageOffset, pageSize),
        category: "Data",
        fileName: `${country || "global"}-${tradeType}-search`,
        count: rows.length,
      };
      const response = await fetch("/api/user/downloads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to log download.");

      const blob = new Blob([rowsToCsv()], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${payload.fileName}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      notifyUsageChanged();
      showTableToast(data.downloaded ? "Download logged and CSV created." : "CSV created. SQL is not configured yet.");
    } catch (error) {
      showTableToast(error.message || "Unable to download table.");
    } finally {
      setIsDownloading(false);
    }
  }

  function buildFilters(includeAdvanced = true) {
    const filters = {};
    const trimmedQuery = query.trim();

    if (trimmedQuery) {
      if (searchType === "industry") {
        filters.Product_Description = trimmedQuery;
        filters.Product_Description_mode = "contains";
      } else if (/^[0-9]+$/.test(trimmedQuery)) {
        filters.HS_Code = trimmedQuery;
        filters.HS_Code_mode = trimmedQuery.length >= 8 ? "exact" : "prefix";
      } else {
        filters.Product_Description = trimmedQuery;
        filters.Product_Description_mode = "contains";
      }
    }

    if (includeAdvanced) {
      advancedRows.forEach((row) => {
        if (!row.field || !row.value?.trim()) return;
        const existing = filters[row.field];
        filters[row.field] = existing ? [...(Array.isArray(existing) ? existing : [existing]), row.value.trim()] : row.value.trim();
        filters[`${row.field}_mode`] = row.mode;
        filters[`${row.field}_operator`] = row.operator || "AND";
      });
    }

    Object.entries(columnFilters).forEach(([column, filter]) => {
      const field = getApiField(column);
      if (filter?.type === "number") {
        if (filter.min !== "" && filter.min !== undefined) {
          filters[`${field}_min`] = Number(filter.min);
        }
        if (filter.max !== "" && filter.max !== undefined) {
          filters[`${field}_max`] = Number(filter.max);
        }
        return;
      }

      if (filter?.values?.length) {
        filters[field] = filter.values;
        filters[`${field}_mode`] = "exact";
      }
    });

    return filters;
  }

  function buildSearchPayload(includeAdvanced = true, nextOffset = 0, nextLimit = pageSize) {
    const payload = {
      date_range: {
        from: dateRange.start,
        to: dateRange.end,
      },
      columns: activeColumns.map((column) => getApiField(column)),
      filters: buildFilters(includeAdvanced),
      sort: {
        field: "Date",
        order: "desc",
      },
      pagination: {
        limit: nextLimit,
        offset: nextOffset,
      },
    };

    if (country) {
      payload.Table_Name = `${country}_${tradeType === "import" ? "Import" : "Export"}`;
    } else {
      payload.global = true;
    }

    if (!Object.keys(payload.filters).length) {
      delete payload.filters;
    }

    return payload;
  }

  function buildAggregationPayload(offset = 0, limit = 50) {
    const payload = {
      date_range: { from: dateRange.start, to: dateRange.end },
      filters: buildFilters(true),
      limit,
      offset,
    };

    if (country) {
      payload.Table_Name = `${country}_${tradeType === "import" ? "Import" : "Export"}`;
    } else {
      payload.global = true;
    }

    if (!Object.keys(payload.filters).length) delete payload.filters;
    return payload;
  }

  function buildTrendPayload() {
    const payload = {
      date_range: { from: dateRange.start, to: dateRange.end },
      filters: buildFilters(true),
    };
    if (country) {
      payload.Table_Name = `${country}_${tradeType === "import" ? "Import" : "Export"}`;
    } else {
      payload.global = true;
    }
    if (!Object.keys(payload.filters).length) delete payload.filters;
    return payload;
  }

  async function loadAggregation(type, nextOffset = aggregationData[type].offset) {
    if (aggregationData[type].loading || (aggregationData[type].loaded && nextOffset === aggregationData[type].offset)) return;

    setAggregationData((current) => ({
      ...current,
      [type]: { ...current[type], loading: true, error: "" },
    }));

    try {
      const response = await fetch(`/api/trades/aggregations/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildAggregationPayload(nextOffset, aggregationData[type].limit)),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || `Unable to load ${type}.`);

      setAggregationData((current) => ({
        ...current,
        [type]: {
          ...current[type],
          rows: getApiRows(data),
          loading: false,
          error: "",
          loaded: true,
          offset: nextOffset,
          total: getApiTotal(data, DEFAULT_PAGINATION_TOTAL),
        },
      }));
    } catch (error) {
      setAggregationData((current) => ({
        ...current,
        [type]: { ...current[type], loading: false, error: error.message || `Unable to load ${type}.` },
      }));
    }
  }

  function handleTabChange(tab) {
    setActiveTab(tab);
    if (tab === "importers" || tab === "suppliers") loadAggregation(tab);
  }

  function tableCountry(tableName) {
    return String(tableName || "").replace(/_(Import|Export)$/i, "");
  }

  function facetValues(data) {
    return getFacetValues(data, "Table_Name")
      .map((item) => typeof item === "string" ? item : item.value || item.key || item.name)
      .filter(Boolean);
  }

  async function openCompanyProfile(name, row, role) {
    const field = role === "importer" ? "Importer_Name" : "Exporter_Name";
    const directTable = row?.Table_Name || row?.table_name;
    const directCountry = directTable ? tableCountry(directTable) : country;
    if (directCountry) {
      router.push(`/search/company?name=${encodeURIComponent(name)}&role=${role}&country=${encodeURIComponent(directCountry)}`);
      return;
    }
    try {
      const response = await fetch("/api/trades/filters", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ global: true, date_range: { from: dateRange.start, to: dateRange.end }, facets: ["Table_Name"], filters: { [field]: name, [`${field}_mode`]: "exact" }, include_counts: true }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Unable to identify the company country.");
      const countries = [...new Set(facetValues(data).map(tableCountry).filter(Boolean))];
      if (countries.length > 1) {
        setCountryChoices({ name, role, countries });
      } else {
        router.push(`/search/company?name=${encodeURIComponent(name)}&role=${role}${countries[0] ? `&country=${encodeURIComponent(countries[0])}` : ""}`);
      }
    } catch {
      // Country detection is a convenience for ambiguous global matches. Do not
      // prevent access to the profile if the facet endpoint is unavailable.
      router.push(`/search/company?name=${encodeURIComponent(name)}&role=${role}`);
    }
  }

  async function fetchSummary(payload) {
    const response = await fetch("/api/trades/summary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Unable to load trade summary.");
    }

    const nextSummary = getSummaryData(data);
    if (nextSummary) {
      setSummary(nextSummary);
    }
    return nextSummary;
  }

  async function fetchColumnFilterOptions(column) {
    if (measurableColumns.has(column) || filterOptions[column]?.length) return;

    const field = getApiField(column);
    const payload = {
      date_range: {
        from: dateRange.start,
        to: dateRange.end,
      },
      facets: [field],
      include_counts: true,
      filters: buildFilters(false),
    };

    if (country) {
      payload.Table_Name = `${country}_${tradeType === "import" ? "Import" : "Export"}`;
    } else {
      payload.global = true;
    }

    if (!Object.keys(payload.filters).length) {
      delete payload.filters;
    }

    setFilterLoading(column);
    setFilterErrors((current) => ({ ...current, [column]: "" }));

    try {
      const response = await fetch("/api/trades/filters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Unable to load filter values.");
      }

      setFilterOptions((current) => ({
        ...current,
        [column]: getFacetValues(data, field).slice(0, 200),
      }));
    } catch (error) {
      setFilterErrors((current) => ({
        ...current,
        [column]: error.message || "Unable to load filter values.",
      }));
    } finally {
      setFilterLoading(null);
    }
  }

  function openColumnFilter(column) {
    if (isLoading) return;
    setFilterColumn((current) => (current === column ? null : column));
    fetchColumnFilterOptions(column);
  }

  function updateColumnFilter(column, value) {
    setColumnFilters((current) => {
      const currentFilter = current[column] || {
        type: "list",
        values: [],
      };
      const values = currentFilter.values?.includes(value)
        ? currentFilter.values.filter((item) => item !== value)
        : [...(currentFilter.values || []), value];

      if (!values.length) {
        const { [column]: _removed, ...rest } = current;
        return rest;
      }

      return {
        ...current,
        [column]: {
          type: "list",
          values,
        },
      };
    });
  }

  function updateNumericFilter(column, key, value) {
    setColumnFilters((current) => ({
      ...current,
      [column]: {
        type: "number",
        min: current[column]?.min ?? getNumericRange(column).min,
        max: current[column]?.max ?? getNumericRange(column).max,
        [key]: value,
      },
    }));
  }

  function clearColumnFilter(column) {
    setColumnFilters((current) => {
      const { [column]: _removed, ...rest } = current;
      return rest;
    });
    setFilterQueries((current) => ({ ...current, [column]: "" }));
  }

  async function handleSearch(includeAdvanced = true, nextOffset = 0, nextLimit = pageSize) {
    const payload = buildSearchPayload(includeAdvanced, nextOffset, nextLimit);
    const cacheKey = JSON.stringify(payload);
    for (const [key, entry] of tradeSearchCache) {
      if (Date.now() - entry.savedAt >= TRADE_SEARCH_CACHE_TTL) tradeSearchCache.delete(key);
    }
    const cached = tradeSearchCache.get(cacheKey);

    if (cached && Date.now() - cached.savedAt < TRADE_SEARCH_CACHE_TTL) {
      setPageOffset(nextOffset);
      setPageSize(nextLimit);
      setLastIncludeAdvanced(includeAdvanced);
      setRows(cached.rows);
      setTotalRecords(cached.total);
      if (cached.summary) setSummary(cached.summary);
      setApiMessage("Showing recently loaded results.");
      setShowSuggestions(false);
      setSuggestions([]);
      setAggregationData({
        importers: { rows: [], loading: false, error: "", loaded: false, offset: 0, limit: 50, total: DEFAULT_PAGINATION_TOTAL },
        suppliers: { rows: [], loading: false, error: "", loaded: false, offset: 0, limit: 50, total: DEFAULT_PAGINATION_TOTAL },
      });
      setIsLoading(false);
      showTableToast("Restored recent results.");
      return;
    }

    setPageOffset(nextOffset);
    setPageSize(nextLimit);
    setLastIncludeAdvanced(includeAdvanced);
    setIsLoading(true);
    setApiMessage("");
    setShowSuggestions(false);
    setSuggestions([]);
    setAggregationData({
      importers: { rows: [], loading: false, error: "", loaded: false, offset: 0, limit: 50, total: DEFAULT_PAGINATION_TOTAL },
      suppliers: { rows: [], loading: false, error: "", loaded: false, offset: 0, limit: 50, total: DEFAULT_PAGINATION_TOTAL },
    });

    try {
      const [response, summaryResult] = await Promise.allSettled([
        fetch("/api/trades/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        }),
        fetchSummary(payload),
      ]);

      if (summaryResult.status === "rejected") {
        setApiMessage(summaryResult.reason?.message || "Unable to load trade summary.");
      }

      if (response.status === "rejected") {
        throw response.reason;
      }

      const data = await response.value.json();

      if (!response.value.ok) {
        throw new Error(data?.message || "Unable to load trade data.");
      }

      const apiRows = getApiRows(data);
      if (apiRows.length) {
        const normalizedRows = normalizeApiRows(apiRows);
        const total = getApiTotal(data, DEFAULT_PAGINATION_TOTAL);
        setRows(normalizedRows);
        setTotalRecords(total);
        tradeSearchCache.set(cacheKey, {
          rows: normalizedRows,
          total,
          summary: summaryResult.status === "fulfilled" ? summaryResult.value : null,
          savedAt: Date.now(),
        });
        setApiMessage("");
        notifyUsageChanged();
        showTableToast(`Table updated with ${apiRows.length.toLocaleString()} records.`);
      } else {
        setRows(getDemoPage(nextOffset, nextLimit));
        setTotalRecords(DEFAULT_PAGINATION_TOTAL);
        setApiMessage((current) =>
          current || "No API rows returned. Showing demo data.",
        );
        notifyUsageChanged();
        showTableToast("Table updated with demo data.");
      }
    } catch (error) {
      setRows(getDemoPage(nextOffset, nextLimit));
      setTotalRecords(DEFAULT_PAGINATION_TOTAL);
      setApiMessage(`${error.message} Showing demo data.`);
      showTableToast("Table updated with demo data.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!workspaceReady || initialSearchRequested.current || (!initialSuggestionQuery.trim() && !homeAdvancedFilters)) return;
    if (homeSearchRun) window.sessionStorage.setItem(`trade-search-run:${homeSearchRun}`, "started");
    initialSearchRequested.current = true;
    handleSearch(true, 0, pageSize);
  // The request is intentionally made only once for a Home-page handoff.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceReady, initialSuggestionQuery, homeAdvancedFilters, homeSearchRun]);

  function changePage(nextOffset) {
    const safeOffset = Math.max(0, nextOffset);
    handleSearch(lastIncludeAdvanced, safeOffset, pageSize);
  }

  function changePageSize(nextPageSize) {
    handleSearch(lastIncludeAdvanced, 0, nextPageSize);
  }

  const totalShipmentValue = rows.reduce(
    (sum, row) => sum + (Number(row["Price"]) || 0),
    0,
  );
  const maxQuantity = Math.max(
    ...rows.map((row) => Number(row["Quantity"]) || 0),
    1,
  );
  const maxPrice = Math.max(...rows.map((row) => Number(row["Price"]) || 0), 1);
  const currentPage = Math.floor(pageOffset / pageSize) + 1;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const pageStart = totalRecords === 0 ? 0 : pageOffset + 1;
  const pageEnd = Math.min(pageOffset + rows.length, totalRecords);

  function formatNumber(value, options = {}) {
    return Number(value || 0).toLocaleString(undefined, {
      maximumFractionDigits: 2,
      ...options,
    });
  }

  function formatUsdValue(value) {
    const number = Number(value || 0);
    if (Math.abs(number) >= 1_000_000) {
      return `$${(number / 1_000_000).toLocaleString(undefined, {
        maximumFractionDigits: 2,
      })}M`;
    }

    return `$${number.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  }

  function getNumericRange(column) {
    const values = rows
      .map((row) => Number(row[column]))
      .filter((value) => Number.isFinite(value));
    const min = values.length ? Math.min(...values) : 0;
    const max = values.length ? Math.max(...values) : 100;

    return {
      min,
      max: max > min ? max : min + 1,
    };
  }

  function getActiveSearchChips() {
    const chips = [
      { label: "Scope", value: country || "Global" },
      { label: "Trade", value: tradeType === "export" ? "Exports" : "Imports" },
      {
        label: "Dates",
        value: `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`,
      },
    ];

    if (query.trim()) {
      chips.push({
        label: searchType === "industry" ? "Company" : "Search",
        value: query.trim(),
      });
    }

    advancedRows.forEach((row) => {
      if (!row.value.trim()) return;
      chips.push({
        label: row.field,
        value: `${labelForField(row.mode)} ${row.value.trim()}`,
      });
    });

    Object.entries(columnFilters).forEach(([column, filter]) => {
      if (filter.type === "number") {
        chips.push({
          label: column,
          value: `${formatNumber(filter.min)} - ${formatNumber(filter.max)}`,
        });
        return;
      }

      if (filter.values?.length) {
        chips.push({
          label: column,
          value: filter.values.join(", "),
        });
      }
    });

    return chips;
  }

  const activeSearchChips = getActiveSearchChips();

  function getReportCards() {
    return [
      {
        label: "Total Shipments",
        value: Number(summary?.total_shipments || totalRecords).toLocaleString(),
      },
      {
        label: "Total Quantity",
        value: Number(
          summary?.total_quantity ||
            rows.reduce((sum, row) => sum + (Number(row["Quantity"]) || 0), 0),
            ).toLocaleString(undefined, { maximumFractionDigits: 2 }),
      },
      {
        label: "Total Value USD",
        value: formatUsdValue(summary?.total_value_usd || totalShipmentValue),
      },
      
    ];
  }

  const reportCards = getReportCards();

  function renderCellContent(row, col, index) {
    const value = row[col] || "-";

    if (col === "HS_Code") {
      return (
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 font-mono text-xs font-semibold text-blue-700 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.7)]"></span>
          {value}
        </div>
      );
    }

    if (col === "Product_Description" || col === "HS_Code_Description") {
      return (
        <div className="min-w-[240px]">
          <p className="font-semibold text-[#003466]">{value}</p>
          <p className="mt-1 text-[11px] font-medium text-blue-500">
            Shipment signal #{String(index + 1).padStart(3, "0")}
          </p>
        </div>
      );
    }

    if (col === "Exporter_Name" || col === "Importer_Name") {
      return (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 text-xs font-bold text-white shadow-md">
            {String(value).slice(0, 1)}
          </div>
          <div>
            <a href={googleCompanyUrl(value)} target="_blank" rel="noreferrer" className="inline-flex max-w-[210px] items-center gap-1 truncate font-semibold text-blue-700 underline decoration-blue-300 underline-offset-2 hover:text-cyan-600 hover:decoration-cyan-500">
              {value}
              <ArrowUpRight size={13} aria-hidden="true" />
            </a>
            <p className="text-[11px] text-slate-400">
              {col === "Exporter_Name" ? "Seller node" : "Buyer node"}
            </p>
          </div>
        </div>
      );
    }

    if (col.includes("Country")) {
      return (
        <span className="inline-flex items-center gap-2 rounded-md bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
            <span className="h-2 w-2 rounded-full bg-blue-400"></span>
          {value}
        </span>
      );
    }

    if (measurableColumns.has(col)) {
      const numericValue = Number(value) || 0;
      const maxValue = Math.max(
        ...rows.map((row) => Number(row[col]) || 0),
        1,
      );
      const width = Math.max(8, Math.min(100, (numericValue / maxValue) * 100));

      return (
        <div className="min-w-[160px]">
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-xs font-semibold text-slate-700">
              {numericValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] uppercase text-slate-400">
              {col.includes("Value") ? "USD" : "Units"}
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-blue-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 via-sky-400 to-blue-300"
              style={{ width: `${width}%` }}
            ></div>
          </div>
        </div>
      );
    }

    if (col === "Transport_Mode") {
      return (
        <span className="inline-flex items-center rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700 ring-1 ring-cyan-100">
          {value}
        </span>
      );
    }

    const numericValue = typeof value === "number" || (typeof value === "string" && value.trim() !== "")
      ? Number(value)
      : NaN;
    return <span className="text-slate-700">{Number.isFinite(numericValue) ? numericValue.toLocaleString(undefined, { maximumFractionDigits: 2 }) : value}</span>;
  }

  return (
    <div className="min-h-screen w-full bg-linear-to-b from-[#f5f9ff] to-[#eaf3ff] text-[#003466] py-8 px-4 relative overflow-hidden">
      {/* Background blur */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-20 w-80 h-80 bg-blue-200/40 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-300/40 blur-[140px] rounded-full"></div>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="fixed right-5 top-5 z-[10000] flex items-center gap-3 rounded-2xl border border-blue-100 bg-white/95 px-4 py-3 text-sm font-semibold text-[#003466] shadow-[0_18px_45px_rgba(0,52,102,0.16)] backdrop-blur-xl"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
              <CheckCircle2 size={17} />
            </span>
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading && (
        <div className="fixed inset-0 z-[9000] flex cursor-wait items-center justify-center bg-white/45 backdrop-blur-[2px]">
          <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-white px-5 py-4 text-sm font-bold text-[#003466] shadow-2xl">
            <RefreshCw size={18} className="animate-spin text-blue-700" />
            Loading trade data
          </div>
        </div>
      )}

      {/* ================= TOP CONTROL BAR ================= */}

      <div className="max-w-full mx-auto mb-8 space-y-6">
        <div className="relative z-[120] overflow-visible rounded-[32px] border border-white/80 bg-white/80 p-4 shadow-[0_22px_60px_rgba(0,52,102,0.10)] backdrop-blur-2xl">
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent"></div>
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#031c35] text-cyan-200 shadow-xl shadow-blue-900/20">
                <Database size={22} />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-700 ring-1 ring-blue-100">
                    Console Search
                  </span>
                </div>
                <h1 className="mt-2 text-2xl font-black tracking-tight text-[#003466] sm:text-3xl">
                  Global Trade Command Center
                </h1>
              </div>
            </div>

            <div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-blue-100 bg-blue-50/70 p-1 text-sm font-semibold shadow-inner">
              {[
                { id: "hscode", label: "HS / Product" },
                { id: "industry", label: "Company" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSearchType(item.id)}
                  className={`cursor-pointer rounded-xl px-4 py-2 transition ${
                    searchType === item.id
                      ? "bg-white text-blue-700 shadow-sm"
                      : "text-slate-500 hover:text-blue-700"
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <button
                onClick={() => setShowAdvance(true)}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2 text-slate-500 transition hover:bg-white hover:text-blue-700"
              >
                <SlidersHorizontal size={15} />
                Advanced
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 xl:grid-cols-[auto_auto_auto_auto_minmax(360px,1fr)] xl:items-center">
            <div className="flex rounded-2xl bg-[#031c35] p-1 shadow-lg shadow-blue-950/10">
              {[
                { id: "import", label: "Imports" },
                { id: "export", label: "Exports" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setTradeType(item.id)}
                  disabled={isLoading}
                  className={`cursor-pointer rounded-xl px-5 py-3 text-sm font-bold transition ${
                    tradeType === item.id
                      ? "bg-white text-[#031c35] shadow-sm"
                      : "text-blue-100 hover:bg-white/10"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div ref={dropdownRef} className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCountry((prev) => !prev);
                  setCountrySearch("");
                }}
                disabled={isLoading}
                className="flex h-14 cursor-pointer items-center gap-3 rounded-2xl border border-blue-100 bg-white px-4 text-sm shadow-sm transition hover:bg-blue-50 disabled:cursor-wait disabled:opacity-60"
              >
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500"></span>
                <span className="font-bold text-[#003466]">{country || "Global"}</span>
                <ChevronDown
                  size={16}
                  className={`transition ${showCountry ? "rotate-180 text-black" : "text-gray-400"}`}
                />
              </button>

              {showCountry && (
                <div className="absolute top-16 left-0 z-[9999] w-64 overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-2xl">
                  <div className="flex items-center justify-between border-b border-blue-100 bg-blue-50 px-4 py-3">
                    <span className="text-xs font-bold text-[#003466]">Choose country</span>
                    <button
                      onClick={() => setShowCountry(false)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-slate-500 hover:text-blue-700"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div className="border-b border-blue-100 p-3">
                    <div className="flex items-center gap-2 rounded-xl border border-blue-100 bg-white px-3 focus-within:ring-2 focus-within:ring-blue-300">
                      <Search size={15} className="shrink-0 text-slate-400" />
                      <input autoFocus value={countrySearch} onChange={(event) => setCountrySearch(event.target.value)} placeholder="Search countries" aria-label="Search countries" className="h-10 min-w-0 flex-1 bg-transparent text-sm text-[#003466] outline-none placeholder:text-slate-400" />
                    </div>
                  </div>
                  <div className="max-h-64 overflow-y-auto p-1">
                    <button onClick={() => { setCountry(""); setShowCountry(false); }} className={`block w-full cursor-pointer rounded-xl px-3 py-2.5 text-left text-sm font-bold transition hover:bg-blue-50 ${!country ? "bg-blue-50 text-blue-700" : "text-[#003466]"}`}>Global</button>
                    {filteredCountries.length ? filteredCountries.map((c) => (
                      <button key={c} onClick={() => { setCountry(c); setShowCountry(false); }} className={`block w-full cursor-pointer rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition hover:bg-blue-50 ${country === c ? "bg-blue-50 text-blue-700" : "text-slate-700"}`}>{c}</button>
                    )) : <p className="px-3 py-6 text-center text-sm text-slate-400">No countries found</p>}
                  </div>
                </div>
              )}
            </div>

              <div ref={calendarRef} className="relative">
                <button
                  onClick={() => setShowCalendar(!showCalendar)}
                  disabled={isLoading}
                  className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-2xl border border-blue-100 bg-white text-blue-700 shadow-sm transition hover:bg-blue-50 disabled:cursor-wait disabled:opacity-60"
                >
                  <Calendar size={18} />
                </button>

                {showCalendar && (
                  <div className="absolute top-16 left-0 z-[9999] w-[330px] rounded-2xl border border-blue-100 bg-white p-3 shadow-2xl">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-bold text-[#003466]">Select date range</span>
                      <button
                        onClick={() => setShowCalendar(false)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-slate-500 hover:text-blue-700"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) =>
                          setDateRange((prev) => ({
                            ...prev,
                            start: e.target.value,
                          }))
                        }
                        className="rounded-xl border border-blue-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                      />

                      <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) =>
                          setDateRange((prev) => ({
                            ...prev,
                            end: e.target.value,
                          }))
                        }
                        className="rounded-xl border border-blue-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                  </div>
                )}
              </div>

            <div className="h-14 rounded-2xl border border-blue-100 bg-white px-4 py-3 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Date Window
              </p>
              <p className="mt-1 text-sm font-bold text-[#003466]">
                {formatDate(dateRange.start)} - {formatDate(dateRange.end)}
              </p>
            </div>

            <div ref={searchBoxRef} className="relative xl:justify-self-end xl:w-full xl:max-w-3xl">
              <div className="flex min-h-[64px] items-center gap-3 rounded-[24px] border border-blue-100 bg-white px-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.7),0_18px_45px_rgba(0,52,102,0.10)]">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-400 text-white shadow-md">
                  <Search size={20} />
                </div>
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setShowSuggestions(e.target.value.trim().length >= 2);
                  }}
                  onFocus={() => {
                    if (query.trim().length >= 2) {
                      setShowSuggestions(true);
                    }
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") handleSearch(false, 0, pageSize);
                  }}
                  disabled={isLoading}
                  placeholder={
                    searchType === "industry"
                      ? "Search company, importer, or exporter"
                      : "Search HS code, product ..."
                  }
                  className="min-w-0 flex-1 bg-transparent text-base font-semibold text-[#003466] outline-none placeholder:text-slate-400"
                />
                <button
                  onClick={() => handleSearch(false, 0, pageSize)}
                  disabled={isLoading}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-800 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-700/25 transition hover:scale-[1.02] disabled:cursor-wait disabled:opacity-60"
                >
                  {isLoading ? <RefreshCw size={16} className="animate-spin" /> : <Search size={16} />}
                  Search
                </button>
              </div>

              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-[72px] left-16 right-4 z-[9999] overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-2xl">
                  <div className="flex items-center justify-between border-b border-blue-100 bg-blue-50 px-4 py-2">
                    <span className="text-xs font-bold text-[#003466]">Suggestions</span>
                    <button
                      onClick={() => setShowSuggestions(false)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-slate-500 hover:text-blue-700"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  {suggestions.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setQuery(item);
                        setShowSuggestions(false);
                        setSuggestions([]);
                      }}
                      className="block w-full px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-blue-50"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          {/* STATS */}
          <div className="flex items-center gap-4 flex-wrap">

  {reportCards.slice(0, 4).map((card) => (
    <div
      key={card.label}
      className="flex items-center gap-4 rounded-2xl border border-white/80 bg-white/85 px-5 py-3 shadow-[0_16px_45px_rgba(0,52,102,0.10)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-[0_20px_55px_rgba(0,52,102,0.14)]"
    >
      <span className="text-sm font-medium text-gray-500">
        {card.label}
      </span>

      <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold tracking-wide shadow">
        {card.value}
      </span>
    </div>
  ))}

</div>

          <div className="rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-md">
            Data Sheet
          </div>
        </div>
        <div className="relative z-10 rounded-2xl border border-white/80 bg-white/80 px-4 py-3 shadow-[0_16px_45px_rgba(0,52,102,0.08)] backdrop-blur-xl">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
              Current Search
            </p>
            <span className="text-xs font-semibold text-slate-500">
              {activeSearchChips.length} active items
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeSearchChips.map((chip) => (
              <span
                key={`${chip.label}-${chip.value}`}
                className="inline-flex max-w-full items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-semibold text-[#003466]"
              >
                <span className="text-blue-600">{chip.label}</span>
                <span className="max-w-[260px] truncate">{chip.value}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* COLUMN SELECTOR */}
      <AnimatePresence>
        {showColumnSelector && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="w-full mb-6"
          >
            <div ref={columnSelectorRef} className="relative bg-white/80 backdrop-blur-xl border border-blue-100 rounded-2xl shadow-xl p-6">
              {/* HEADER */}
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h3 className="text-sm font-semibold text-[#003466]">
                    Customize Columns
                  </h3>
                  <p className="text-xs text-gray-500">
                    Select the fields you want visible in the table
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setColumnDraft(availableColumns)}
                    disabled={isLoading}
                    className="text-xs px-3 py-1 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                  >
                    Select All
                  </button>

                  <button
                    onClick={() => setColumnDraft([])}
                    disabled={isLoading}
                    className="text-xs px-3 py-1 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => setShowColumnSelector(false)}
                    className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-slate-500 ring-1 ring-blue-100 hover:text-blue-700"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* COLUMN GRID */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {availableColumns.map((col) => {
                  const active = columnDraft.includes(col);

                  return (
                    <button
                      key={col}
                      onClick={() => toggleColumn(col)}
                      className={`flex items-center justify-between px-4 py-2 rounded-lg text-sm transition-all border
                ${
                  active
                    ? "bg-blue-600 text-white border-blue-600 shadow-md"
                    : "bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                }`}
                    >
                      <span className="truncate">{col}</span>

                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center transition
                  ${active ? "bg-white border-white" : "border-gray-300"}`}
                      >
                        {active && (
                          <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-5 flex justify-end gap-3 border-t border-blue-100 pt-4"><button onClick={() => { setColumnDraft(visibleColumns); setShowColumnSelector(false); }} className="rounded-xl border border-blue-100 px-4 py-2 text-sm font-bold text-slate-600">Cancel</button><button onClick={() => { setVisibleColumns(columnDraft); setShowColumnSelector(false); }} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white">Update view</button></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full flex flex-wrap justify-between items-center mb-6 gap-4 relative z-10">
        <div className="flex flex-wrap items-center gap-3 rounded-[24px] border border-white/80 bg-white/80 px-3 py-2 shadow-[0_18px_55px_rgba(0,52,102,0.12)] backdrop-blur-2xl">
          <button
            onClick={() => { setColumnDraft(visibleColumns); setShowColumnSelector(!showColumnSelector); }}
            disabled={isLoading}
            className="flex cursor-pointer items-center gap-2 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-100 hover:shadow-md"
          >
            <SlidersHorizontal size={16} />
            Columns
          </button>

          <button
            onClick={handleSaveTable}
            disabled={isLoading || isSaving}
            className="flex cursor-pointer items-center gap-2 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-100 hover:shadow-md disabled:cursor-wait disabled:opacity-60"
          >
            {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
            {isSaving ? "Saving" : "Save Table"}
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownload}
            disabled={isLoading || isDownloading}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-800 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-700/20 transition hover:scale-[1.02] disabled:cursor-wait disabled:opacity-60"
          >
            {isDownloading ? <RefreshCw size={16} className="animate-spin" /> : <Download size={16} />}
            {isDownloading ? "Downloading" : "Download"}
          </button>

          <button
            onClick={() => setFullscreen(!fullscreen)}
            disabled={isLoading}
            className="flex cursor-pointer items-center gap-2 rounded-2xl border border-blue-200 bg-white px-5 py-3 text-sm font-bold text-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-50 hover:shadow-md"
          >
            <Expand size={16} />
            {fullscreen ? "Exit Fullscreen" : "Expand"}
          </button>
        </div>
      </div>

      {/* TABLE CONTAINER */}

      <div
        className={`${fullscreen ? "fixed inset-0 z-50 bg-white p-6" : "w-full"}`}
      >
        {apiMessage && (
          <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm">
            {apiMessage}
          </div>
        )}
        <div className="relative overflow-hidden rounded-[28px] border border-white/80 bg-white/88 shadow-[0_20px_60px_rgba(0,52,102,0.12)] backdrop-blur-2xl">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-blue-700/7 via-blue-300/8 to-slate-100/20"></div>
          <div className="relative flex flex-wrap items-center justify-between gap-4 border-b border-blue-100/80 bg-white/75 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-700 to-cyan-500 text-white shadow-lg shadow-blue-500/25">
                <Settings size={18} />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-[#003466]">
                    Trade Intelligence Grid
                  </h3>
                  <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500 ring-1 ring-slate-200">
                    Loaded
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {country ? `${country} ${tradeType}` : "Global"} data · {formatDate(dateRange.start)} to {formatDate(dateRange.end)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-blue-50 px-3 py-1.5 font-semibold text-blue-700 ring-1 ring-blue-100">
                {visibleColumns.length} columns
              </span>
              <span className="rounded-full bg-slate-50 px-3 py-1.5 font-semibold text-slate-600 ring-1 ring-slate-200">
                {pageStart.toLocaleString()}-{pageEnd.toLocaleString()} of {totalRecords.toLocaleString()}
              </span>
              <button className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 font-semibold text-blue-700 shadow-sm ring-1 ring-blue-100 hover:bg-blue-50">
                <Copy size={13} />
                Copy View
              </button>
            </div>
          </div>

          <div className="relative border-b border-blue-100/80 bg-white/70 px-5 pt-3">
            <div className="flex min-w-max gap-2 overflow-x-auto pb-3">
              {[
                { id: "data", label: "Data", icon: Database },
                { id: "importers", label: "Importer List", icon: Users },
                { id: "suppliers", label: "Supplier List", icon: Truck },
                { id: "visual-report", label: "Visual Report", icon: BarChart3 },
                { id: "report-by", label: "Report By", icon: FileBarChart },
                { id: "trend-by", label: "Trend By", icon: TrendingUp },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                const loading = aggregationData[tab.id]?.loading;
                if (tab.id === "report-by" || tab.id === "trend-by") {
                  const selectedGroup = tab.id === "report-by" ? reportByGroup : trendByGroup;
                  const setSelectedGroup = tab.id === "report-by" ? setReportByGroup : setTrendByGroup;
                  const selectedMetric = tab.id === "report-by" ? reportMetric : trendMetric;
                  const setSelectedMetric = tab.id === "report-by" ? setReportMetric : setTrendMetric;
                  return (
                    <div key={tab.id} className={`flex items-center gap-1 rounded-xl p-1 ${active ? "bg-blue-600 shadow-md shadow-blue-500/25" : "bg-white ring-1 ring-slate-200"}`}>
                      <button onClick={() => handleTabChange(tab.id)} className={`inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-bold transition ${active ? "text-white" : "text-slate-600 hover:text-blue-700"}`}><Icon size={14} />{tab.label}</button>
                      {active && <><select value={selectedGroup} onChange={(event) => setSelectedGroup(event.target.value)} className="max-w-[150px] rounded-lg border-0 bg-white/95 px-2 py-2 text-xs font-bold text-[#003466] outline-none"><option value="">Select report</option>{reportByOptions.map(([label, field]) => <option key={field} value={field}>{label}</option>)}</select><select value={selectedMetric} onChange={(event) => setSelectedMetric(event.target.value)} className="max-w-[180px] rounded-lg border-0 bg-white/95 px-2 py-2 text-xs font-bold text-[#003466] outline-none">{metricOptions.map((metric) => <option key={metric} value={metric}>{metric.replaceAll("_", " ")}</option>)}</select></>}
                    </div>
                  );
                }
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold transition ${active ? "bg-blue-600 text-white shadow-md shadow-blue-500/25" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-blue-50 hover:text-blue-700"}`}
                  >
                    {loading ? <RefreshCw size={14} className="animate-spin" /> : <Icon size={14} />}
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {activeTab === "data" ? (
            <>
          <div className="relative w-full overflow-auto">
          <table className="min-w-[1900px] w-full border-separate border-spacing-0 text-sm">
            {/* HEADER */}
            <thead className="sticky top-0 z-20 bg-white/90 shadow-[0_10px_30px_rgba(15,47,79,0.08)] backdrop-blur-xl">
              <tr>
                <th className="sticky left-0 z-40 w-[86px] border-b border-r border-blue-100 bg-gradient-to-b from-white to-blue-50 px-4 py-4 text-left">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-500">
                    Row
                  </span>
                </th>
                {visibleColumns.map((col, i) => {
                  const active = filterColumn === col;

                  return (
                    <th
                      key={col}
                      className={`relative px-4 py-4 text-left whitespace-nowrap border-b border-r border-blue-100/80 group transition
          ${active ? "bg-blue-50 ring-1 ring-blue-200" : "bg-white/70"}
          `}
                    >
                      {/* COLUMN HEADER */}
                      <div
                        onClick={() => openColumnFilter(col)}
                        className={`flex min-h-14 items-center justify-between gap-4 cursor-pointer rounded-2xl border border-transparent px-3 py-2 transition-all
            hover:border-blue-100 hover:bg-blue-50/70 hover:shadow-sm`}
                      >
                        {/* COLUMN NAME */}
                        <div className="flex flex-col leading-tight">
                          <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#003466]">
                            {col}
                          </span>

                          <span className="mt-1 text-[10px] text-blue-500 font-semibold">
                            Filter / Sort
                          </span>
                        </div>

                        {/* FILTER INDICATOR */}
                        <div className="flex items-center gap-1 transition">
                          <div
                            className={`w-8 h-8 flex items-center justify-center rounded-xl transition shadow-sm
                ${
                  active
                    ? "bg-blue-600 text-white"
                    : "bg-blue-100 text-blue-600 group-hover:bg-blue-200"
                }`}
                          >
                            <Filter size={12} />
                          </div>

                          <ChevronDown
                            size={14}
                            className={`transition
                ${
                  active
                    ? "text-blue-600 rotate-180"
                    : "text-gray-400 group-hover:text-blue-600"
                }`}
                          />
                        </div>
                      </div>

                      {/* FILTER POPUP */}
                      {active && (
                        <div
                          ref={filterRef}
                          className="absolute top-20 left-2 w-[290px] bg-white rounded-2xl border border-blue-200 shadow-2xl z-40 overflow-hidden"
                        >
                          {/* HEADER */}
                          <div className="px-4 py-3 border-b bg-gradient-to-r from-blue-100 to-blue-50">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs font-semibold text-[#003466]">
                                  Filter Column
                                </p>

                                <p className="text-[11px] text-blue-600 font-medium">
                                  {col}
                                </p>
                              </div>

                              <button
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setFilterColumn(null);
                                }}
                                className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-slate-500 shadow ring-1 ring-blue-100 hover:text-blue-700"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>

                          {measurableColumns.has(col) ? (
                            <div className="p-4">
                              {(() => {
                                const range = getNumericRange(col);
                                const current = columnFilters[col] || {
                                  type: "number",
                                  min: range.min,
                                  max: range.max,
                                };

                                return (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                      <label className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                                        Min
                                        <input
                                          type="number"
                                          value={current.min}
                                          onChange={(event) =>
                                            updateNumericFilter(col, "min", event.target.value)
                                          }
                                          className="mt-2 w-full rounded-xl border border-blue-100 px-3 py-2 text-sm font-semibold text-[#003466] outline-none focus:ring-2 focus:ring-blue-400"
                                        />
                                      </label>
                                      <label className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                                        Max
                                        <input
                                          type="number"
                                          value={current.max}
                                          onChange={(event) =>
                                            updateNumericFilter(col, "max", event.target.value)
                                          }
                                          className="mt-2 w-full rounded-xl border border-blue-100 px-3 py-2 text-sm font-semibold text-[#003466] outline-none focus:ring-2 focus:ring-blue-400"
                                        />
                                      </label>
                                    </div>
                                    <input
                                      type="range"
                                      min={range.min}
                                      max={range.max}
                                      value={current.max}
                                      onChange={(event) =>
                                        updateNumericFilter(col, "max", event.target.value)
                                      }
                                      className="w-full accent-blue-600"
                                    />
                                  </div>
                                );
                              })()}
                            </div>
                          ) : (
                            <>
                              <div className="p-4 border-b bg-blue-50/40">
                                <input
                                  value={filterQueries[col] || ""}
                                  onChange={(event) =>
                                    setFilterQueries((current) => ({
                                      ...current,
                                      [col]: event.target.value,
                                    }))
                                  }
                                  placeholder={`Search ${col}`}
                                  className="w-full text-sm px-3 py-2 rounded-md border border-blue-200 focus:ring-2 focus:ring-blue-400 outline-none"
                                />
                              </div>

                              <div className="max-h-[220px] overflow-auto p-3 space-y-1 text-sm">
                                {filterLoading === col && (
                                  <div className="flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-3 text-xs font-semibold text-blue-700">
                                    <RefreshCw size={14} className="animate-spin" />
                                    Loading options
                                  </div>
                                )}
                                {filterErrors[col] && (
                                  <div className="rounded-xl bg-amber-50 px-3 py-3 text-xs font-semibold text-amber-800">
                                    {filterErrors[col]}
                                  </div>
                                )}
                                {(filterOptions[col] || [])
                                  .filter((option) =>
                                    getOptionLabel(option)
                                      .toLowerCase()
                                      .includes((filterQueries[col] || "").toLowerCase()),
                                  )
                                  .map((option) => {
                                    const optionLabel = getOptionLabel(option);
                                    const checked = columnFilters[col]?.values?.includes(optionLabel);

                                    return (
                                      <label
                                        key={optionLabel}
                                        className="flex items-center gap-2 p-2 rounded-md hover:bg-blue-50 cursor-pointer"
                                      >
                                        <input
                                          type="checkbox"
                                          checked={Boolean(checked)}
                                          onChange={() => updateColumnFilter(col, optionLabel)}
                                        />
                                        <span className="min-w-0 flex-1 truncate">{optionLabel}</span>
                                        {option?.count !== undefined && (
                                          <span className="text-[10px] font-semibold text-slate-400">
                                            {Number(option.count).toLocaleString()}
                                          </span>
                                        )}
                                      </label>
                                    );
                                  })}
                                {filterLoading !== col &&
                                  !filterErrors[col] &&
                                  !(filterOptions[col] || []).length && (
                                    <div className="rounded-xl bg-slate-50 px-3 py-3 text-xs font-semibold text-slate-500">
                                      No options loaded yet.
                                    </div>
                                  )}
                              </div>
                            </>
                          )}

                          {/* FOOTER */}
                          <div className="flex justify-between items-center p-3 border-t bg-blue-50">
                            <button
                              onClick={() => clearColumnFilter(col)}
                              className="text-xs text-gray-600 hover:text-blue-700 font-medium"
                            >
                              Clear
                            </button>

                            <button
                              onClick={() => {
                                setFilterColumn(null);
                                handleSearch(lastIncludeAdvanced, 0, pageSize);
                              }}
                              disabled={isLoading}
                              className="text-xs px-4 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 shadow disabled:cursor-wait disabled:opacity-60"
                            >
                              Apply Filter
                            </button>
                          </div>
                        </div>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* BODY */}
            <tbody className="bg-white">
              {isLoading && (
                <tr>
                  <td
                    colSpan={visibleColumns.length + 1}
                    className="px-6 py-14 text-center"
                  >
                    <div className="mx-auto flex max-w-sm flex-col items-center gap-4">
                      <div className="relative h-14 w-14">
                        <div className="absolute inset-0 rounded-2xl bg-blue-500/20 animate-ping"></div>
                        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-400 text-white shadow-xl">
                          <Search size={22} />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#003466]">
                          Loading trade data
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Building the latest grid from your payload.
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && rows.map((row, i) => (
                <tr
                  key={i}
                  className="group relative transition hover:bg-gradient-to-r hover:from-blue-50/80 hover:via-white hover:to-cyan-50/70"
                >
                  <td className="sticky left-0 z-10 border-b border-r border-blue-50 bg-white px-4 py-4 shadow-[8px_0_22px_rgba(15,47,79,0.04)] group-hover:bg-blue-50">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 font-mono text-[11px] font-bold text-cyan-200 shadow-md">
                        {String(pageOffset + i + 1).padStart(2, "0")}
                      </div>
                      <button className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100 transition group-hover:bg-blue-600 group-hover:text-white">
                        <Eye size={14} />
                      </button>
                    </div>
                  </td>
                  {visibleColumns.map((col, ci) => (
                    <td
                      key={col}
                      className="border-b border-r border-blue-50/80 px-4 py-4 align-middle whitespace-nowrap transition group-hover:border-blue-100"
                    >
                      {renderCellContent(row, col, i)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          </div>

          <div className="relative flex flex-col gap-4 border-t border-blue-100/80 bg-gradient-to-r from-white via-blue-50/60 to-white px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-blue-100">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Showing
                </p>
                <p className="mt-1 text-sm font-bold text-[#003466]">
                  {pageStart.toLocaleString()} - {pageEnd.toLocaleString()} of {totalRecords.toLocaleString()}
                </p>
              </div>

              <label className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm ring-1 ring-blue-100">
                Rows
                <select
                  value={pageSize}
                  onChange={(event) => changePageSize(Number(event.target.value))}
                  className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-700 outline-none"
                >
                  {[10, 25, 50, 100].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleSearch(lastIncludeAdvanced, pageOffset, pageSize)}
                disabled={isLoading}
                className="inline-flex h-11 items-center gap-2 rounded-2xl border border-blue-100 bg-white px-4 text-sm font-bold text-blue-700 shadow-sm transition hover:bg-blue-50 disabled:cursor-wait disabled:opacity-60"
              >
                <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
                Refresh
              </button>

              <button
                onClick={() => changePage(pageOffset - pageSize)}
                disabled={isLoading || pageOffset <= 0}
                className="inline-flex h-11 items-center gap-2 rounded-2xl border border-blue-100 bg-white px-4 text-sm font-bold text-blue-700 shadow-sm transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              <div className="flex h-11 items-center rounded-2xl bg-[#031c35] px-4 font-mono text-sm font-bold text-cyan-200 shadow-lg">
                Page {currentPage} / {totalPages}
              </div>

              <button
                onClick={() => changePage(pageOffset + pageSize)}
                disabled={isLoading || pageOffset + pageSize >= totalRecords}
                className="inline-flex h-11 items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-800 px-4 text-sm font-bold text-white shadow-lg shadow-blue-700/20 transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
            </>
          ) : activeTab === "visual-report" ? (
            <VisualReport requestBase={buildTrendPayload()} tradeType={tradeType} />
          ) : activeTab === "report-by" ? (
            <ReportBy key={`${reportByGroup}-${reportMetric}`} requestBase={buildTrendPayload()} groupBy={reportByGroup} metric={reportMetric} />
          ) : activeTab === "trend-by" ? (
            <ReportBy key={`${trendByGroup}-${trendMetric}`} requestBase={buildTrendPayload()} groupBy={trendByGroup} metric={trendMetric} trend />
          ) : (activeTab === "importers" || activeTab === "suppliers") ? (
            <AggregationTable
              title={activeTab === "importers" ? "Importer List" : "Supplier List"}
              rows={aggregationData[activeTab].rows}
              loading={aggregationData[activeTab].loading}
              error={aggregationData[activeTab].error}
              onRetry={() => loadAggregation(activeTab)}
              offset={aggregationData[activeTab].offset}
              limit={aggregationData[activeTab].limit}
              total={aggregationData[activeTab].total}
              companyField={activeTab === "importers" ? "Importer_Name" : "Exporter_Name"}
              onCompanySelect={(name, row) => openCompanyProfile(name, row, activeTab === "importers" ? "importer" : "supplier")}
              onPrevious={() => loadAggregation(activeTab, Math.max(0, aggregationData[activeTab].offset - aggregationData[activeTab].limit))}
              onNext={() => loadAggregation(activeTab, aggregationData[activeTab].offset + aggregationData[activeTab].limit)}
            />
          ) : (
            <div className="flex min-h-[420px] flex-col items-center justify-center px-6 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                <BarChart3 size={24} />
              </div>
              <h4 className="mt-5 text-lg font-black text-[#003466]">Trend By</h4>
              <p className="mt-2 max-w-sm text-sm text-slate-500">This workspace is ready for its report view. Data will be added here in a future update.</p>
            </div>
          )}
        </div>

        {fullscreen && (
          <button
            onClick={() => setFullscreen(false)}
            className="absolute top-6 right-6 bg-white border rounded-full p-2 shadow hover:bg-blue-50"
          >
            <X size={18} />
          </button>
        )}
      </div>
      
      {/* ADVANCED SEARCH MODAL */}
      <AnimatePresence>
        {countryChoices && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-4" onClick={() => setCountryChoices(null)}>
            <motion.div initial={{ y: 16, scale: 0.98 }} animate={{ y: 0, scale: 1 }} exit={{ y: 16, scale: 0.98 }} onClick={(event) => event.stopPropagation()} className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
              <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">Company profile</p><h3 className="mt-1 text-xl font-black text-[#003466]">Choose a country</h3><p className="mt-2 text-sm text-slate-500">{countryChoices.name} appears in more than one country. Select the record you want to view.</p></div><button onClick={() => setCountryChoices(null)} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X size={18} /></button></div>
              <div className="mt-5 grid gap-2">{countryChoices.countries.map((choice) => <button key={choice} onClick={() => router.push(`/search/company?name=${encodeURIComponent(countryChoices.name)}&role=${countryChoices.role}&country=${encodeURIComponent(choice)}`)} className="flex items-center justify-between rounded-2xl border border-blue-100 px-4 py-3 text-left font-bold text-[#003466] transition hover:border-blue-300 hover:bg-blue-50"><span>{choice}</span><ArrowRight size={16} className="text-blue-600" /></button>)}</div>
            </motion.div>
          </motion.div>
        )}
        {/* Legacy advanced-search menu retained for reference.
        {showAdvance && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="max-h-[86vh] w-[92%] overflow-hidden rounded-[28px] border border-white/80 bg-white shadow-[0_28px_90px_rgba(0,35,70,0.26)] sm:w-[860px]"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-blue-100 bg-gradient-to-r from-blue-50 via-white to-cyan-50 px-6 py-5 sm:px-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#031c35] text-cyan-200 shadow-lg shadow-blue-950/20">
                    <SlidersHorizontal size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black tracking-tight text-[#003466] sm:text-xl">
                      Advanced Search
                    </h2>
                    <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">
                      Refine the API payload with fixed trade fields.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setShowAdvance(false);
                      handleSearch(true);
                    }}
                    disabled={isLoading}
                    className="inline-flex h-10 items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-800 px-5 text-sm font-bold text-white shadow-lg shadow-blue-700/25 transition hover:scale-[1.01] disabled:cursor-wait disabled:opacity-60"
                  >
                    {isLoading && <RefreshCw size={15} className="animate-spin" />}
                    {isLoading ? "Loading" : "Search"}
                  </button>
                  <button
                    onClick={() => setShowAdvance(false)}
                    className="flex h-10 w-10 items-center justify-center rounded-2xl border border-blue-100 bg-white text-slate-500 shadow-sm transition hover:bg-blue-50 hover:text-blue-700"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="max-h-[calc(86vh-170px)] overflow-auto px-6 py-6 sm:px-8">
                <div className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
                  <div className="hidden grid-cols-[92px_1.25fr_150px_1.3fr] gap-3 border-b border-blue-100 bg-slate-50 px-4 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400 sm:grid">
                    <span>Logic</span>
                    <span>Field</span>
                    <span>Match</span>
                    <span>Value</span>
                  </div>
                  <div className="divide-y divide-blue-50">
                    {advancedRows.map((row, index) => (
                      <div
                        key={row.field}
                        className="grid grid-cols-1 gap-3 px-4 py-3 transition hover:bg-blue-50/45 sm:grid-cols-[92px_1.25fr_150px_1.3fr] sm:items-center"
                      >
                        <select
                          value={row.operator}
                          onChange={(event) =>
                            updateAdvancedRow(index, "operator", event.target.value)
                          }
                          className="h-11 rounded-xl border border-blue-100 bg-white px-3 text-sm font-bold text-blue-700 outline-none transition focus:ring-2 focus:ring-blue-400"
                        >
                          <option value="AND">AND</option>
                          <option value="OR">OR</option>
                        </select>
                        <div className="flex min-h-11 items-center rounded-xl border border-transparent bg-slate-50 px-4 font-mono text-xs font-bold text-[#003466] ring-1 ring-slate-200 sm:text-sm">
                          {row.field}
                        </div>
                        <select
                          value={row.mode}
                          onChange={(event) =>
                            updateAdvancedRow(index, "mode", event.target.value)
                          }
                          className="h-11 rounded-xl border border-blue-100 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:ring-2 focus:ring-blue-400"
                        >
                          {MATCH_MODES.map((mode) => (
                            <option key={mode} value={mode}>
                              {labelForField(mode)}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={row.value}
                          onChange={(event) =>
                            updateAdvancedRow(index, "value", event.target.value)
                          }
                          placeholder="Keyword"
                          className="h-11 rounded-xl border border-blue-100 bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-blue-400"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end border-t border-blue-100 bg-white px-6 py-4 sm:px-8">
                <button
                  onClick={() => setShowAdvance(false)}
                  className="mr-3 rounded-xl border border-blue-100 bg-white px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowAdvance(false);
                    handleSearch(true);
                  }}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-700/25 transition hover:scale-[1.01] disabled:cursor-wait disabled:opacity-60"
                >
                  {isLoading && <RefreshCw size={16} className="animate-spin" />}
                  {isLoading ? "Loading" : "Search"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
        */}
        {showAdvance && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={() => setShowAdvance(false)}>
            <motion.section initial={{ scale: 0.96, opacity: 0, y: 12 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.96, opacity: 0, y: 12 }} onClick={(event) => event.stopPropagation()} className="max-h-[88vh] w-full max-w-4xl overflow-hidden rounded-[28px] border border-blue-100 bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-blue-100 bg-gradient-to-r from-blue-50 via-white to-cyan-50 px-6 py-5 sm:px-8">
                <div><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#031c35] text-cyan-200"><SlidersHorizontal size={18} /></span><h2 className="text-xl font-black text-[#003466]">Advanced Search</h2></div><p className="mt-2 text-sm text-slate-500">Add fields and choose how each condition connects.</p></div>
                <button onClick={() => setShowAdvance(false)} aria-label="Close advanced search" className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-white text-slate-500 hover:bg-blue-50"><X size={19} /></button>
              </div>
              <div className="max-h-[calc(88vh-150px)] space-y-5 overflow-auto px-6 py-6 sm:px-8">
                <AdvancedSearchFields rows={advancedRows} onChange={setAdvancedRows} />
                <div className="flex justify-end gap-3 border-t border-blue-100 pt-5">
                  <button onClick={() => setShowAdvance(false)} className="rounded-xl border border-blue-100 px-5 py-3 text-sm font-bold text-slate-600 hover:bg-blue-50">Cancel</button>
                  <button onClick={() => { setShowAdvance(false); handleSearch(true); }} disabled={isLoading} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-3 text-sm font-bold text-white shadow-lg disabled:opacity-60">{isLoading ? <RefreshCw size={16} className="animate-spin" /> : <Search size={16} />} {isLoading ? "Loading" : "Search"}</button>
                </div>
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
