"use client";

import { useState, useRef, useEffect } from "react";
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
} from "lucide-react";
import Synopsis from "./synopsis";

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

const randomRows = Array.from({ length: 30 }).map((_, i) => ({
  Date: "12 Oct 2025",
  "HS Code": "847130",
  Product: "Laptop Computers",
  Exporter: "Tech Global Ltd",
  "Exporter Country": "China",
  Importer: "India Electronics",
  "Importer Country": "India",
  Quantity: 500 + i,
  Unit: "PCS",
  Price: 1200 + i * 3,
  Currency: "USD",
  Port: "Shanghai",
  "Shipment Mode": "Sea",
  "Trade Type": "Export",
}));

export default function SearchPage() {
  const countries = ["India", "USA", "China", "Germany"];
  const currencies = ["USD", "EUR", "INR", "CNY"];
  const [country, setCountry] = useState("India");
  const [currency, setCurrency] = useState("USD");

  const [showCountry, setShowCountry] = useState(false);
  const [showCurrency, setShowCurrency] = useState(false);
  const [searchType, setSearchType] = useState("hscode");
  const [tradeType, setTradeType] = useState("export");
  const [range, setRange] = useState("3M");
  const [activeTab, setActiveTab] = useState("data");
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const [dateRange, setDateRange] = useState({
    start: "2025-08-28",
    end: "2026-02-28",
  });
  const [showCalendar, setShowCalendar] = useState(false);

  const hsCodes = ["847130", "850440", "851762", "854231"];
  const products = [
    "Laptop Computers",
    "Smartphones",
    "Semiconductors",
    "Solar Panels",
  ];
  const industries = [
    "Electronics",
    "Automotive",
    "Pharmaceutical",
    "Textiles",
  ];
  useEffect(() => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    const isNumeric = /^[0-9]+$/.test(query);
    const isMixed = /[a-zA-Z]/.test(query) && /[0-9]/.test(query);

    let source = [];

    if (searchType === "industry") {
      source = industries;
    } else if (searchType === "hscode") {
      source = isNumeric ? hsCodes : products;
    } else {
      source = products;
    }

    const filtered = source.filter((item) =>
      item.toLowerCase().includes(query.toLowerCase()),
    );

    setSuggestions(filtered);
  }, [query, searchType]);
  const [visibleColumns, setVisibleColumns] = useState(columns);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [filterColumn, setFilterColumn] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [showAdvance, setShowAdvance] = useState(false);

  const filterRef = useRef(null);
  const dropdownRef = useRef(null);

  const formatDate = (date) =>
  new Intl.DateTimeFormat("en-GB").format(new Date(date));
  useEffect(() => {
    function handleClickOutside(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterColumn(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  return (
    <div className="min-h-screen w-full bg-linear-to-b from-[#f5f9ff] to-[#eaf3ff] text-[#003466] py-8 px-4 relative overflow-hidden">
      {/* Background blur */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-20 w-80 h-80 bg-blue-200/40 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-300/40 blur-[140px] rounded-full"></div>
      </div>

      {/* ================= TOP CONTROL BAR ================= */}

      <div className="max-w-full mx-auto mb-8 space-y-6">
        {/* SEARCH TYPE */}
        <div className="w-full flex flex-col items-center gap-6">

  {/* SEARCH TYPE */}
  <div className="flex items-center gap-6 bg-white/70 backdrop-blur-md border border-blue-100 px-6 py-3 rounded-xl shadow-sm">

    <span className="text-sm font-medium text-gray-600">
      Search by
    </span>

    {[
      { id: "hscode", label: "HS Code / Product" },
      { id: "industry", label: "Industry" },
    ].map((item) => (
      <label
        key={item.id}
        className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700 hover:text-blue-700 transition"
      >
        <input
          type="radio"
          checked={searchType === item.id}
          onChange={() => setSearchType(item.id)}
          className="accent-blue-600 cursor-pointer"
        />

        {item.label}
      </label>
    ))}

  </div>



  {/* SEARCH CONTROLS */}
  <div className="flex items-center flex-wrap justify-center gap-4 bg-white/60 backdrop-blur-xl border border-blue-100 px-5 py-4 rounded-2xl shadow-md">

    {/* IMPORT EXPORT */}
    <div className="flex bg-blue-50 rounded-full p-1">

      <button
        onClick={() => setTradeType("import")}
        className={`px-5 py-2 rounded-full text-sm font-medium transition cursor-pointer
        ${
          tradeType === "import"
            ? "bg-white text-blue-700 shadow-sm"
            : "text-gray-600 hover:text-blue-700"
        }`}
      >
        Imports
      </button>

      <button
        onClick={() => setTradeType("export")}
        className={`px-5 py-2 rounded-full text-sm font-medium transition cursor-pointer
        ${
          tradeType === "export"
            ? "bg-blue-600 text-white shadow"
            : "text-gray-600 hover:text-blue-700"
        }`}
      >
        Exports
      </button>

    </div>



    {/* SEARCH BAR */}
    <div className="relative flex items-center bg-white border border-blue-100 rounded-full px-4 py-2 shadow-sm min-w-[420px] max-w-xl">

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={
          searchType === "industry"
            ? "Search by Industry"
            : "Search by HS Code / Product"
        }
        className="flex-1 outline-none text-sm text-gray-700"
      />

      <button className="bg-blue-600 text-white rounded-full p-2 ml-3 hover:bg-blue-700 transition cursor-pointer">
        <Search size={16} />
      </button>

      {searchType === "hscode" && (
        <button
          onClick={() => setShowAdvance(true)}
          className="ml-2 flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium hover:bg-blue-100 transition cursor-pointer"
        >
          <SlidersHorizontal size={14} />
          Advanced
        </button>
      )}

      {suggestions.length > 0 && (
        <div className="absolute top-12 left-0 w-full bg-white border border-blue-100 rounded-lg shadow-lg z-50 overflow-hidden">

          {suggestions.map((item, i) => (
            <div
              key={i}
              onClick={() => {
                setQuery(item);
                setSuggestions([]);
              }}
              className="px-4 py-2 hover:bg-blue-50 text-sm cursor-pointer"
            >
              {item}
            </div>
          ))}

        </div>
      )}

    </div>



    {/* DATE CONTROLS */}
    <div className="flex items-center gap-3">

      {/* DATE RANGE */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm px-5 py-2 rounded-lg shadow font-medium">
        {formatDate(dateRange.start)} — {formatDate(dateRange.end)}
      </div>



      {/* RANGE BUTTONS */}
      <div className="flex items-center gap-3 bg-white border border-blue-100 rounded-full px-4 py-2 shadow-sm text-sm">

        {["1M", "3M", "6M", "1Yr"].map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`px-2 cursor-pointer transition
            ${
              range === r
                ? "text-blue-600 font-semibold"
                : "text-gray-600 hover:text-blue-600"
            }`}
          >
            {r}
          </button>
        ))}

      </div>



      {/* CALENDAR */}
      <div className="relative">

        <button
          onClick={() => setShowCalendar(!showCalendar)}
          className="bg-white border border-blue-100 rounded-full p-3 shadow-sm hover:bg-blue-50 transition cursor-pointer"
        >
          <Calendar size={18} />
        </button>

        {showCalendar && (
          <div className="absolute top-12 right-0 bg-white border border-blue-100 rounded-lg shadow-lg p-3 z-50 flex gap-2">

            <input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange((prev) => ({
                  ...prev,
                  start: e.target.value,
                }))
              }
              className="border rounded-md px-2 py-1 text-sm"
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
              className="border rounded-md px-2 py-1 text-sm"
            />

          </div>
        )}

      </div>



      {/* IDEA BUTTON */}
      <button className="bg-white border border-blue-100 rounded-full p-3 shadow-sm hover:bg-blue-50 transition cursor-pointer">
        <Lightbulb size={18} />
      </button>

    </div>

  </div>

</div>
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* STATS */}
          <div className="flex items-center gap-4 flex-wrap">

  {/* TOTAL VALUE */}
  <div className="flex items-center gap-4 bg-white/80 backdrop-blur-md border border-blue-100 px-5 py-3 rounded-xl shadow-sm hover:shadow-md transition">

    <span className="text-sm font-medium text-gray-500">
      Total Shipment Value
    </span>

    <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold tracking-wide shadow">
      $860,658,618.95
    </span>

  </div>


  {/* RECORD COUNT */}
  <div className="flex items-center gap-4 bg-white/80 backdrop-blur-md border border-blue-100 px-5 py-3 rounded-xl shadow-sm hover:shadow-md transition">

    <span className="text-sm font-medium text-gray-500">
      Export Shipment Records
    </span>

    <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold shadow">
      22,600
    </span>

  </div>

</div>

          {/* DATA TAB */}
          <div className="flex items-center bg-white/70 backdrop-blur-md border border-blue-100 rounded-full p-1 shadow-sm">

  <button
    onClick={() => setActiveTab("data")}
    className={`px-6 py-2 text-sm font-medium rounded-full transition-all duration-200 cursor-pointer
      ${
        activeTab === "data"
          ? "bg-blue-600 text-white shadow-md"
          : "text-blue-700 hover:bg-blue-50"
      }`}
  >
    Data Sheet
  </button>

  <button
    onClick={() => setActiveTab("synopsis")}
    className={`px-6 py-2 text-sm font-medium rounded-full transition-all duration-200 cursor-pointer
      ${
        activeTab === "synopsis"
          ? "bg-blue-600 text-white shadow-md"
          : "text-blue-700 hover:bg-blue-50"
      }`}
  >
    Synopsis
  </button>

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

      <div className="w-full flex flex-wrap justify-between items-center mb-6 gap-4 relative z-50">
        {/* LEFT SIDE */}
        <div ref={dropdownRef} className="flex flex-wrap items-center gap-3 bg-white/70 backdrop-blur-xl border border-blue-100 shadow-sm px-3 py-2 rounded-xl">
          {/* COUNTRY */}
          {/* COUNTRY DROPDOWN */}
          <div className="relative">
            <button
              onClick={(e) => {
  e.stopPropagation();
  setShowCountry((prev) => !prev);
  setShowCurrency(false);
}}
              className="flex items-center gap-2 px-4 py-2 bg-white/80 border border-blue-100 rounded-lg text-sm shadow-sm hover:bg-blue-50 transition"
            >
              <span className="font-medium text-black">{country}</span>

              <ChevronDown
                size={16}
                className={`transition ${showCountry ? "rotate-180 text-black" : "text-gray-400"}`}
              />
            </button>

            {showCountry && (
              <div className="absolute top-11 left-0 w-40 bg-white border border-blue-100 rounded-xl shadow-lg overflow-hidden z-50">
                {countries.map((c) => (
                  <div
                    key={c}
                    onClick={() => {
                      setCountry(c);
                      setShowCountry(false);
                    }}
                    className="px-4 py-2 text-sm cursor-pointer hover:bg-blue-50 transition"
                  >
                    {c}
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
              className="flex items-center gap-2 px-4 py-2 bg-white/80 border border-blue-100 rounded-lg text-sm shadow-sm hover:bg-blue-50 transition"
            >
              <span className="font-medium text-black">{currency}</span>

              <ChevronDown
                size={16}
                className={`transition ${showCurrency ? "rotate-180 text-black" : "text-gray-400"}`}
              />
            </button>

            {showCurrency && (
              <div className="absolute top-11 left-0 w-32 bg-white border border-blue-100 rounded-xl shadow-lg overflow-hidden z-50">
                {currencies.map((c) => (
                  <div
                    key={c}
                    onClick={() => {
                      setCurrency(c);
                      setShowCurrency(false);
                    }}
                    className="px-4 py-2 text-sm cursor-pointer hover:bg-blue-50 transition"
                  >
                    {c}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* DIVIDER */}
          <div className="h-6 w-px bg-blue-100"></div>

          {/* COLUMNS */}
          <button
            onClick={() => setShowColumnSelector(!showColumnSelector)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition shadow-sm"
          >
            <SlidersHorizontal size={16} />
            Columns
          </button>

          {/* SAVE TABLE */}
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition shadow-sm">
            <Save size={16} />
            Save Table
          </button>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-3">
          {/* DOWNLOAD */}
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-md hover:shadow-lg hover:scale-[1.02] transition">
            <Download size={16} />
            Download
          </button>

          {/* FULLSCREEN */}
          <button
            onClick={() => setFullscreen(!fullscreen)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-200 rounded-lg shadow-sm hover:bg-blue-50 transition"
          >
            <Expand size={16} />
            {fullscreen ? "Exit Fullscreen" : "Expand"}
          </button>
        </div>
      </div>

      {/* TABLE CONTAINER */}

      {activeTab === "data" ?(
        <div
        className={`${fullscreen ? "fixed inset-0 z-50 bg-white p-6" : "w-full"}`}
      >
        <div className="w-full overflow-auto rounded-2xl border border-white/70 shadow-lg bg-white/80 backdrop-blur-xl">
          <table className="min-w-[1800px] w-full text-sm">
            {/* HEADER */}
            <thead className="sticky top-0 z-20 backdrop-blur-xl bg-gradient-to-b from-[#ffffff] to-[#eef5ff] border-b  shadow-sm">
              <tr>
                {visibleColumns.map((col, i) => {
                  const active = filterColumn === col;

                  return (
                    <th
                      key={col}
                      className={`relative px-5 py-3 text-left whitespace-nowrap border-r border-blue-100 group transition
          ${i === 0 ? "sticky left-0 bg-gradient-to-b from-white to-blue-50 z-30" : ""}
          ${active ? "bg-blue-50 ring-1 ring-blue-200" : ""}
          `}
                    >
                      {/* COLUMN HEADER */}
                      <div
                        onClick={() => setFilterColumn(col)}
                        className={`flex items-center justify-between gap-3 cursor-pointer px-3 py-2 rounded-md transition-all
            hover:bg-blue-100/60`}
                      >
                        {/* COLUMN NAME */}
                        <div className="flex flex-col leading-tight">
                          <span className="text-[13px] font-semibold text-[#003466] tracking-wide">
                            {col}
                          </span>

                          <span className="text-[10px] text-blue-500 font-medium">
                            Filter / Sort
                          </span>
                        </div>

                        {/* FILTER INDICATOR */}
                        <div className="flex items-center gap-1 transition">
                          <div
                            className={`w-6 h-6 flex items-center justify-center rounded-md transition shadow-sm
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
                          className="absolute top-16 left-0 w-[290px] bg-white rounded-xl border border-blue-200 shadow-2xl z-40 overflow-hidden"
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
            <tbody>
              {randomRows.map((row, i) => (
                <tr key={i} className="border-b hover:bg-blue-50/60 transition">
                  {visibleColumns.map((col, ci) => (
                    <td
                      key={col}
                      className={`px-4 py-2 whitespace-nowrap border-r border-gray-100 ${
                        ci === 0 ? "sticky left-0 bg-white" : ""
                      }`}
                    >
                      {row[col]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
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
      ) : (<Synopsis />)}
      
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
                <input
                  type="text"
                  placeholder="Enter HS Code"
                  className="border border-gray-300 rounded-lg px-4 py-2 text-sm sm:text-base outline-none focus:ring-2 focus:ring-blue-400"
                />
                <input
                  type="text"
                  placeholder="Enter Product Name"
                  className="border border-gray-300 rounded-lg px-4 py-2 text-sm sm:text-base outline-none focus:ring-2 focus:ring-blue-400"
                />
                <select className="border border-gray-300 rounded-lg px-4 py-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-400">
                  <option>Select Country</option>
                  <option>India</option>
                  <option>USA</option>
                </select>
                <select className="border border-gray-300 rounded-lg px-4 py-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-400">
                  <option>Select Data Type</option>
                  <option>Import</option>
                  <option>Export</option>
                </select>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowAdvance(false)}
                  className="px-5 py-2 text-sm sm:text-base text-white bg-linear-to-r from-blue-500 to-blue-700 rounded-lg hover:shadow-lg transition"
                >
                  Search Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
