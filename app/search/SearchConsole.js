"use client";

import { useState, useRef, useEffect } from "react";
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
  RefreshCw,
  Database,
  CheckCircle2,
} from "lucide-react";
import { MATCH_MODES, SEARCH_FIELDS, labelForField } from "./searchConfig";

const columns = [
  "Date",
  "HS Code",
  "Product",
  "Exporter",
  "Exporter Country",
  "Importer",
  "Importer Country",
  "Quantity",
  "Unit",
  "Price",
  "Currency",
  "Port",
  "Shipment Mode",
  "Trade Type",
];

const apiColumnMap = {
  Date: "Date",
  "HS Code": "HS_Code",
  Product: "Product_Description",
  Exporter: "Exporter_Name",
  "Exporter Country": "Export_Country",
  Importer: "Importer_Name",
  "Importer Country": "Import_Country",
  Quantity: "Quantity",
  Unit: "Unit_Name",
  Price: "Unit_Value_in_USD",
  Currency: "Currency_Name",
  Port: "Loading_Port",
  "Shipment Mode": "Transport_Mode",
  "Trade Type": "Table_Name",
};

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

export default function SearchConsole({
  initialSuggestions = [],
  initialSuggestionQuery = "",
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const countries = ["India", "USA", "China", "Germany"];
  const currencies = ["USD", "EUR", "INR", "CNY"];
  const [country, setCountry] = useState("");
  const [currency, setCurrency] = useState("USD");

  const [showCountry, setShowCountry] = useState(false);
  const [showCurrency, setShowCurrency] = useState(false);
  const [searchType, setSearchType] = useState("hscode");
  const [tradeType, setTradeType] = useState("export");
  const [range, setRange] = useState("3M");
  const [query, setQuery] = useState(initialSuggestionQuery);
  const [suggestions, setSuggestions] = useState(initialSuggestions);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [pageSize, setPageSize] = useState(25);
  const [pageOffset, setPageOffset] = useState(0);
  const [totalRecords, setTotalRecords] = useState(randomRows.length);
  const [lastIncludeAdvanced, setLastIncludeAdvanced] = useState(true);
  const [rows, setRows] = useState(randomRows.slice(0, 25));
  const [summary, setSummary] = useState(defaultGlobalSummary);
  const [isLoading, setIsLoading] = useState(false);
  const [apiMessage, setApiMessage] = useState("");
  const [toast, setToast] = useState(null);
  const [advancedRows, setAdvancedRows] = useState([
    { operator: "AND", field: "HS_Code", mode: "prefix", value: "" },
    { operator: "AND", field: "Importer_Name", mode: "contains", value: "" },
    { operator: "AND", field: "Product_Description", mode: "contains", value: "" },
  ]);
  const [activeFieldDropdown, setActiveFieldDropdown] = useState(null);
  const [fieldQueries, setFieldQueries] = useState({});

  const [dateRange, setDateRange] = useState({
    start: "2025-08-28",
    end: "2026-02-28",
  });
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    setSuggestions(initialSuggestions);
  }, [initialSuggestions]);

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
        params.set("suggestCurrency", currency);
        params.set("suggestFrom", dateRange.start);
        params.set("suggestTo", dateRange.end);
      } else {
        params.delete("suggestQuery");
        params.delete("suggestType");
        params.delete("suggestCountry");
        params.delete("suggestTradeType");
        params.delete("suggestCurrency");
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
    currency,
    dateRange.end,
    dateRange.start,
    query,
    router,
    searchParams,
    searchType,
    tradeType,
  ]);
  const [visibleColumns, setVisibleColumns] = useState(columns);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [filterColumn, setFilterColumn] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [showAdvance, setShowAdvance] = useState(false);

  const filterRef = useRef(null);
  const dropdownRef = useRef(null);
  const searchBoxRef = useRef(null);

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
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!toast) return undefined;

    const timeout = window.setTimeout(() => {
      setToast(null);
    }, 2600);

    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
  function handleClickOutside(event) {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowCountry(false);
      setShowCurrency(false);
    }
  }

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

  function toggleColumn(col) {
    if (visibleColumns.includes(col)) {
      setVisibleColumns(visibleColumns.filter((c) => c !== col));
    } else {
      setVisibleColumns([...visibleColumns, col]);
    }
  }

  function formatInputDate(date) {
    return date.toISOString().slice(0, 10);
  }

  function applyQuickRange(nextRange) {
    const end = new Date();
    const start = new Date(end);

    if (nextRange === "1M") start.setMonth(start.getMonth() - 1);
    if (nextRange === "3M") start.setMonth(start.getMonth() - 3);
    if (nextRange === "6M") start.setMonth(start.getMonth() - 6);
    if (nextRange === "1Yr") start.setFullYear(start.getFullYear() - 1);

    setRange(nextRange);
    setDateRange({
      start: formatInputDate(start),
      end: formatInputDate(end),
    });
  }

  function updateAdvancedRow(index, key, value) {
    setAdvancedRows((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    );
  }

  function getFieldQuery(index, field) {
    return fieldQueries[index] ?? labelForField(field);
  }

  function updateFieldQuery(index, value) {
    setFieldQueries((current) => ({ ...current, [index]: value }));
  }

  function selectAdvancedField(index, field) {
    updateAdvancedRow(index, "field", field);
    updateFieldQuery(index, labelForField(field));
    setActiveFieldDropdown(null);
  }

  function normalizeApiRows(apiRows) {
    return apiRows.map((item) =>
      columns.reduce((acc, column) => {
        const apiKey = apiColumnMap[column];
        acc[column] = item?.[apiKey] ?? item?.[column] ?? "";
        return acc;
      }, {}),
    );
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

    return (
      data.total ??
      data.totalRecords ??
      data.count ??
      data.recordsTotal ??
      data.data?.total ??
      data.data?.totalRecords ??
      data.data?.count ??
      fallback
    );
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
    return randomRows.slice(offset, offset + limit);
  }

  function showTableToast(message) {
    setToast({
      id: Date.now(),
      message,
    });
  }

  function buildFilters(includeAdvanced = true) {
    const filters = {};
    const trimmedQuery = query.trim();

    if (currency) {
      filters.Currency_Name = currency;
      filters.Currency_Name_mode = "exact";
    }

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
        if (!row.field || !row.value.trim()) return;
        filters[row.field] = row.value.trim();
        filters[`${row.field}_mode`] = row.mode;
      });
    }

    return filters;
  }

  function buildSearchPayload(includeAdvanced = true, nextOffset = 0, nextLimit = pageSize) {
    const payload = {
      date_range: {
        from: dateRange.start,
        to: dateRange.end,
      },
      columns: Object.values(apiColumnMap),
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
  }

  async function handleSearch(includeAdvanced = true, nextOffset = 0, nextLimit = pageSize) {
    const payload = buildSearchPayload(includeAdvanced, nextOffset, nextLimit);

    setPageOffset(nextOffset);
    setPageSize(nextLimit);
    setLastIncludeAdvanced(includeAdvanced);
    setIsLoading(true);
    setApiMessage("");
    setShowSuggestions(false);
    setSuggestions([]);

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
        setRows(normalizeApiRows(apiRows));
        setTotalRecords(Number(getApiTotal(data, nextOffset + apiRows.length)));
        setApiMessage("");
        showTableToast(`Table updated with ${apiRows.length.toLocaleString()} records.`);
      } else {
        setRows(getDemoPage(nextOffset, nextLimit));
        setTotalRecords(randomRows.length);
        setApiMessage((current) =>
          current || "No API rows returned. Showing demo data.",
        );
        showTableToast("Table updated with demo data.");
      }
    } catch (error) {
      setRows(getDemoPage(nextOffset, nextLimit));
      setTotalRecords(randomRows.length);
      setApiMessage(`${error.message} Showing demo data.`);
      showTableToast("Table updated with demo data.");
    } finally {
      setIsLoading(false);
    }
  }

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
        ).toLocaleString(undefined, { maximumFractionDigits: 3 }),
      },
      {
        label: "Total Value USD",
        value: `$${Number(
          summary?.total_value_usd || totalShipmentValue,
        ).toLocaleString(undefined, { maximumFractionDigits: 3 })}`,
      },
      {
        label: "Scope",
        value: country || "Global",
      },
    ];
  }

  const reportCards = getReportCards();

  function renderCellContent(row, col, index) {
    const value = row[col] || "-";

    if (col === "HS Code") {
      return (
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 font-mono text-xs font-semibold text-blue-700 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.7)]"></span>
          {value}
        </div>
      );
    }

    if (col === "Product") {
      return (
        <div className="min-w-[240px]">
          <p className="font-semibold text-[#003466]">{value}</p>
          <p className="mt-1 text-[11px] font-medium text-blue-500">
            Shipment signal #{String(index + 1).padStart(3, "0")}
          </p>
        </div>
      );
    }

    if (col === "Exporter" || col === "Importer") {
      return (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 text-xs font-bold text-white shadow-md">
            {String(value).slice(0, 1)}
          </div>
          <div>
            <p className="max-w-[210px] truncate font-semibold text-slate-800">
              {value}
            </p>
            <p className="text-[11px] text-slate-400">
              {col === "Exporter" ? "Seller node" : "Buyer node"}
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

    if (col === "Quantity" || col === "Price") {
      const numericValue = Number(value) || 0;
      const maxValue = col === "Quantity" ? maxQuantity : maxPrice;
      const width = Math.max(8, Math.min(100, (numericValue / maxValue) * 100));

      return (
        <div className="min-w-[160px]">
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-xs font-semibold text-slate-700">
              {numericValue.toLocaleString()}
            </span>
            <span className="text-[10px] uppercase text-slate-400">
              {col === "Quantity" ? "Units" : currency}
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

    if (col === "Currency") {
      return (
        <span className="rounded-md bg-blue-950 px-2.5 py-1 font-mono text-xs font-semibold text-cyan-100">
          {value}
        </span>
      );
    }

    if (col === "Shipment Mode") {
      return (
        <span className="inline-flex items-center rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700 ring-1 ring-cyan-100">
          {value}
        </span>
      );
    }

    if (col === "Trade Type") {
      return (
        <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-800 px-3 py-1 text-xs font-semibold text-white shadow-sm">
          <ArrowRight size={12} />
          {value}
        </span>
      );
    }

    return <span className="text-slate-700">{value}</span>;
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
                { id: "industry", label: "Industry" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSearchType(item.id)}
                  className={`rounded-xl px-4 py-2 transition ${
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
                className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-slate-500 transition hover:bg-white hover:text-blue-700"
              >
                <SlidersHorizontal size={15} />
                Advanced
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-4 xl:grid-cols-[auto_auto_minmax(360px,1fr)] xl:items-center">
            <div className="flex rounded-2xl bg-[#031c35] p-1 shadow-lg shadow-blue-950/10">
              {[
                { id: "import", label: "Imports" },
                { id: "export", label: "Exports" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setTradeType(item.id)}
                  className={`rounded-xl px-5 py-3 text-sm font-bold transition ${
                    tradeType === item.id
                      ? "bg-white text-[#031c35] shadow-sm"
                      : "text-blue-100 hover:bg-white/10"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-2xl border border-blue-100 bg-white px-4 py-3 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Date Window
                </p>
                <p className="mt-1 text-sm font-bold text-[#003466]">
                  {formatDate(dateRange.start)} - {formatDate(dateRange.end)}
                </p>
              </div>

              <div className="flex items-center gap-1 rounded-2xl border border-blue-100 bg-white p-1 shadow-sm">
                {["1M", "3M", "6M", "1Yr"].map((r) => (
                  <button
                    key={r}
                    onClick={() => applyQuickRange(r)}
                    className={`rounded-xl px-3 py-2 text-xs font-bold transition ${
                      range === r
                        ? "bg-blue-600 text-white shadow"
                        : "text-slate-500 hover:bg-blue-50 hover:text-blue-700"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-100 bg-white text-blue-700 shadow-sm transition hover:bg-blue-50"
                >
                  <Calendar size={18} />
                </button>

                {showCalendar && (
                  <div className="absolute top-14 right-0 z-50 flex gap-2 rounded-2xl border border-blue-100 bg-white p-3 shadow-2xl">
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
                )}
              </div>

              <button className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-100 bg-white text-blue-700 shadow-sm transition hover:bg-blue-50">
                <Lightbulb size={18} />
              </button>
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
                  placeholder={
                    searchType === "industry"
                      ? "Ask for an industry, market, or sector"
                      : "Search HS code, product, importer, exporter..."
                  }
                  className="min-w-0 flex-1 bg-transparent text-base font-semibold text-[#003466] outline-none placeholder:text-slate-400"
                />
                <button
                  onClick={() => handleSearch(false, 0, pageSize)}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-800 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-700/25 transition hover:scale-[1.02] disabled:cursor-wait disabled:opacity-60"
                >
                  {isLoading ? <RefreshCw size={16} className="animate-spin" /> : <Search size={16} />}
                  Search
                </button>
              </div>

              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-[72px] left-16 right-4 z-[9999] overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-2xl">
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
            <div className="relative bg-white/80 backdrop-blur-xl border border-blue-100 rounded-2xl shadow-xl p-6">
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
                    onClick={() => setVisibleColumns(columns)}
                    className="text-xs px-3 py-1 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                  >
                    Select All
                  </button>

                  <button
                    onClick={() => setVisibleColumns([])}
                    className="text-xs px-3 py-1 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* COLUMN GRID */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {columns.map((col) => {
                  const active = visibleColumns.includes(col);

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
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full flex flex-wrap justify-between items-center mb-6 gap-4 relative z-10">
        {/* LEFT SIDE */}
        <div ref={dropdownRef} className="flex flex-wrap items-center gap-3 rounded-[24px] border border-white/80 bg-white/80 px-3 py-2 shadow-[0_18px_55px_rgba(0,52,102,0.12)] backdrop-blur-2xl">
          {/* COUNTRY */}
          {/* COUNTRY DROPDOWN */}
          <div className="relative">
            <button
              onClick={(e) => {
  e.stopPropagation();
  setShowCountry((prev) => !prev);
  setShowCurrency(false);
}}
              className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-gradient-to-b from-white to-blue-50/60 px-4 py-3 text-sm shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500"></span>
              <span className="font-bold text-[#003466]">{country || "Global"}</span>

              <ChevronDown
                size={16}
                className={`transition ${showCountry ? "rotate-180 text-black" : "text-gray-400"}`}
              />
            </button>

            {showCountry && (
              <div className="absolute top-14 left-0 w-44 bg-white border border-blue-100 rounded-2xl shadow-2xl overflow-hidden z-50">
                {["", ...countries].map((c) => (
                  <div
                    key={c || "global"}
                    onClick={() => {
                      setCountry(c);
                      setShowCountry(false);
                    }}
                    className="px-4 py-3 text-sm font-semibold cursor-pointer hover:bg-blue-50 transition"
                  >
                    {c || "Global"}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CURRENCY DROPDOWN */}
          <div className="relative">
            <button
              onClick={(e) => {
  e.stopPropagation();
  setShowCurrency((prev) => !prev);
  setShowCountry(false);
}}
              className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-gradient-to-b from-white to-blue-50/60 px-4 py-3 text-sm shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="font-mono text-xs font-black text-cyan-600">$</span>
              <span className="font-bold text-[#003466]">{currency}</span>

              <ChevronDown
                size={16}
                className={`transition ${showCurrency ? "rotate-180 text-black" : "text-gray-400"}`}
              />
            </button>

            {showCurrency && (
              <div className="absolute top-14 left-0 w-36 bg-white border border-blue-100 rounded-2xl shadow-2xl overflow-hidden z-50">
                {currencies.map((c) => (
                  <div
                    key={c}
                    onClick={() => {
                      setCurrency(c);
                      setShowCurrency(false);
                    }}
                    className="px-4 py-3 text-sm font-semibold cursor-pointer hover:bg-blue-50 transition"
                  >
                    {c}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* DIVIDER */}
          <div className="h-8 w-px bg-blue-100"></div>

          {/* COLUMNS */}
          <button
            onClick={() => setShowColumnSelector(!showColumnSelector)}
            className="flex items-center gap-2 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-100 hover:shadow-md"
          >
            <SlidersHorizontal size={16} />
            Columns
          </button>

          {/* SAVE TABLE */}
          <button className="flex items-center gap-2 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-100 hover:shadow-md">
            <Save size={16} />
            Save Table
          </button>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-3">
          {/* DOWNLOAD */}
          <button className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-800 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-700/20 transition hover:scale-[1.02]">
            <Download size={16} />
            Download
          </button>

          {/* FULLSCREEN */}
          <button
            onClick={() => setFullscreen(!fullscreen)}
            className="flex items-center gap-2 rounded-2xl border border-blue-200 bg-white px-5 py-3 text-sm font-bold text-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-50 hover:shadow-md"
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
                  {country ? `${country} ${tradeType}` : "Global"} data · {currency} · {formatDate(dateRange.start)} to {formatDate(dateRange.end)}
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
                        onClick={() => setFilterColumn(col)}
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

                              <div className="w-8 h-8 flex items-center justify-center rounded-md bg-blue-600 text-white shadow">
                                <Filter size={14} />
                              </div>
                            </div>
                          </div>

                          {/* SEARCH */}
                          <div className="p-4 border-b bg-blue-50/40">
                            <input
                              placeholder={`Search ${col}`}
                              className="w-full text-sm px-3 py-2 rounded-md border border-blue-200 focus:ring-2 focus:ring-blue-400 outline-none"
                            />
                          </div>

                          {/* VALUES */}
                          <div className="max-h-[200px] overflow-auto p-3 space-y-1 text-sm">
                            <label className="flex items-center gap-2 p-2 rounded-md hover:bg-blue-50 cursor-pointer">
                              <input type="checkbox" />
                              <span>Example 1</span>
                            </label>

                            <label className="flex items-center gap-2 p-2 rounded-md hover:bg-blue-50 cursor-pointer">
                              <input type="checkbox" />
                              <span>Example 2</span>
                            </label>

                            <label className="flex items-center gap-2 p-2 rounded-md hover:bg-blue-50 cursor-pointer">
                              <input type="checkbox" />
                              <span>Example 3</span>
                            </label>
                          </div>

                          {/* FOOTER */}
                          <div className="flex justify-between items-center p-3 border-t bg-blue-50">
                            <button className="text-xs text-gray-600 hover:text-blue-700 font-medium">
                              Clear
                            </button>

                            <button className="text-xs px-4 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 shadow">
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
        {showAdvance && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-[90%] sm:w-[600px]"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-[#003466]">
                  Advanced Search
                </h2>
                <button onClick={() => setShowAdvance(false)}>
                  <X
                    size={22}
                    className="text-gray-500 hover:text-blue-600 transition"
                  />
                </button>
              </div>
              <p className="text-gray-600 mb-6 text-xs sm:text-sm">
                Configure more filters to refine your data exploration.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <select
                  value={country}
                  onChange={(event) => setCountry(event.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">Global</option>
                  {countries.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <select
                  value={tradeType}
                  onChange={(event) => setTradeType(event.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-400"
                >
                  <option value="import">Import</option>
                  <option value="export">Export</option>
                </select>
                {advancedRows.map((row, index) => {
                  const fieldQuery = getFieldQuery(index, row.field);
                  const filteredFields = SEARCH_FIELDS.filter((field) =>
                    labelForField(field)
                      .toLowerCase()
                      .includes(fieldQuery.toLowerCase()),
                  );

                  return (
                  <div key={index} className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:col-span-2">
                    <select
                      value={row.operator}
                      onChange={(event) =>
                        updateAdvancedRow(index, "operator", event.target.value)
                      }
                      className="border border-gray-300 rounded-lg px-4 py-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="AND">AND</option>
                      <option value="OR">OR</option>
                    </select>
                    <div className="relative">
                      <input
                        type="text"
                        value={fieldQuery}
                        onFocus={() => {
                          setActiveFieldDropdown(index);
                          updateFieldQuery(index, labelForField(row.field));
                        }}
                        onChange={(event) => {
                          setActiveFieldDropdown(index);
                          updateFieldQuery(index, event.target.value);
                        }}
                        placeholder="Search Field"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-9 text-sm sm:text-base outline-none focus:ring-2 focus:ring-blue-400"
                      />
                      <ChevronDown
                        size={16}
                        className={`pointer-events-none absolute right-3 top-3 text-gray-400 transition ${
                          activeFieldDropdown === index ? "rotate-180" : ""
                        }`}
                      />
                      {activeFieldDropdown === index && (
                        <div className="absolute top-12 left-0 z-50 max-h-56 w-full overflow-auto rounded-xl border border-blue-100 bg-white shadow-xl">
                          {filteredFields.length > 0 ? (
                            filteredFields.map((field) => (
                              <button
                                key={field}
                                type="button"
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() => selectAdvancedField(index, field)}
                                className={`block w-full px-4 py-2 text-left text-sm hover:bg-blue-50 ${
                                  row.field === field
                                    ? "bg-blue-50 text-blue-700"
                                    : "text-gray-700"
                                }`}
                              >
                                {labelForField(field)}
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-3 text-sm text-gray-500">
                              No fields found
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <select
                      value={row.mode}
                      onChange={(event) =>
                        updateAdvancedRow(index, "mode", event.target.value)
                      }
                      className="border border-gray-300 rounded-lg px-4 py-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-400"
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
                      className="border border-gray-300 rounded-lg px-4 py-2 text-sm sm:text-base outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  );
                })}
              </div>
              <div className="flex justify-between">
                <button
                  onClick={() =>
                    setAdvancedRows((current) => [
                      ...current,
                      {
                        operator: "AND",
                        field: "HS_Code",
                        mode: "contains",
                        value: "",
                      },
                    ])
                  }
                  className="px-5 py-2 text-sm sm:text-base text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                >
                  Add Field
                </button>
                <button
                  onClick={() => {
                    setShowAdvance(false);
                    handleSearch(true);
                  }}
                  disabled={isLoading}
                  className="px-5 py-2 text-sm sm:text-base text-white bg-linear-to-r from-blue-500 to-blue-700 rounded-lg hover:shadow-lg transition"
                >
                  {isLoading ? "Loading" : "Search Now"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
