"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Download,
  Search,
  User,
  X,
  SlidersHorizontal,
} from "lucide-react";
import AdvancedSearchFields from "./search/AdvancedSearchFields";
import { COUNTRIES } from "./search/countries";
import { buildSuggestionPayload } from "@/lib/tradeSuggestions";

export default function Dashboard() {
  const router = useRouter();
  const [showAdvance, setShowAdvance] = useState(false);
  const [country, setCountry] = useState("");
  const [tradeType, setTradeType] = useState("export");
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const suggestionRequestId = useRef(0);
  const searchBoxRef = useRef(null);
  const [searchType, setSearchType] = useState("hscode");
  const [advancedRows, setAdvancedRows] = useState([]);
  const [dashboard, setDashboard] = useState({
    usage: {
      search: { used: 0, total: 0 },
      downloads: { used: 0, total: 0 },
    },
    favorites: [],
    downloads: [],
  });

  useEffect(() => {
    function closeSuggestions(event) {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target)) {
        setSuggestionsOpen(false);
      }
    }

    document.addEventListener("mousedown", closeSuggestions);
    return () => document.removeEventListener("mousedown", closeSuggestions);
  }, []);

  useEffect(() => {
    fetch("/api/user/dashboard")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data) setDashboard(data);
      })
      .catch(() => {});
  }, []);

  const favorites = dashboard.favorites || [];
  const downloads = dashboard.downloads || [];
  const downloadTotal = dashboard.usage?.downloads?.total || 0;
  const downloadUsed = dashboard.usage?.downloads?.used || 0;
  const searchTotal = dashboard.usage?.search?.total || 0;
  const searchUsed = dashboard.usage?.search?.used || 0;
  const downloadPercent = downloadTotal ? Math.min(100, (downloadUsed / downloadTotal) * 100) : 0;
  const searchPercent = searchTotal ? Math.min(100, (searchUsed / searchTotal) * 100) : 0;
  const startSearch = (includeAdvanced = false) => {
    const trimmedQuery = query.trim();
    const validAdvancedRows = includeAdvanced
      ? advancedRows.filter((row) => row.field && row.value?.trim())
      : [];
    if (!trimmedQuery && validAdvancedRows.length === 0) {
      setSearchError("Enter an HS code or product, or add an advanced filter to search.");
      return;
    }
    setSearchError("");
    const params = new URLSearchParams();
    if (trimmedQuery) params.set("suggestQuery", trimmedQuery);
    params.set("suggestType", searchType);
    if (country) params.set("suggestCountry", country);
    params.set("suggestTradeType", tradeType);
    if (includeAdvanced) {
      if (validAdvancedRows.length) params.set("advancedFilters", JSON.stringify(validAdvancedRows));
    }
    params.set("run", String(Date.now()));
    router.push(`/search${params.toString() ? `?${params}` : ""}`);
  };

  const applySuggestion = (suggestion) => {
    const hsCode = searchType === "hscode" ? suggestion.match(/^(\d+)\s+-\s+/)?.[1] : null;
    setQuery(hsCode || suggestion);
    setSuggestionsOpen(false);
    setSearchError("");
  };

  useEffect(() => {
    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 2) {
      setSuggestions([]);
      setSuggestionsLoading(false);
      return undefined;
    }

    const requestId = ++suggestionRequestId.current;
    const timeout = window.setTimeout(async () => {
      setSuggestionsLoading(true);
      const payload = buildSuggestionPayload({
        query: trimmedQuery,
        type: searchType,
        country,
        tradeType,
        from: "2010-01-01",
        to: "2026-12-31",
      });

      try {
        const response = await fetch(
          `/api/trades/suggestions?query=${encodeURIComponent(trimmedQuery)}&type=${encodeURIComponent(searchType)}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          },
        );
        const data = await response.json();
        if (requestId !== suggestionRequestId.current) return;
        setSuggestions(response.ok && Array.isArray(data.suggestions) ? data.suggestions : []);
      } catch (error) {
        if (requestId === suggestionRequestId.current) setSuggestions([]);
      } finally {
        if (requestId === suggestionRequestId.current) setSuggestionsLoading(false);
      }
    }, 300);

    return () => {
      window.clearTimeout(timeout);
      if (suggestionRequestId.current === requestId) suggestionRequestId.current += 1;
    };
  }, [country, query, searchType, tradeType]);

  return (
    <div className="min-h-screen bg-linear-to-b from-[#f5f9ff] to-[#eaf3ff] px-4 sm:px-6 lg:px-8 py-10 text-[#003466] relative overflow-hidden">
      {/* Floating Gradient Blur */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 sm:left-32 w-64 sm:w-80 h-64 sm:h-80 bg-blue-200/40 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-20 right-10 sm:right-32 w-72 sm:w-96 h-72 sm:h-96 bg-blue-300/30 blur-[130px] rounded-full"></div>
      </div>

      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10 sm:mb-14"
      >
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-3 leading-snug">
          Search Import Export Data of{" "}
          <span className="text-[#007bff]">200+ Countries</span>
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed px-2">
          Discover profitable products, top HS codes, suppliers, and emerging
          market trends — powered by our live data intelligence.
        </p>
      </motion.div>

      {/* 🔍 SEARCH SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative max-w-7xl mx-auto mt-8 px-2"
      >
        <div className="rounded-[28px] border border-blue-100 bg-white/90 p-4 shadow-[0_18px_45px_rgba(0,52,102,0.10)] backdrop-blur-xl sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex rounded-2xl bg-[#031c35] p-1 shadow-lg shadow-blue-950/10">
              {[{ id: "import", label: "Imports" }, { id: "export", label: "Exports" }].map((item) => (
                <button key={item.id} onClick={() => setTradeType(item.id)} className={`rounded-xl px-5 py-2.5 text-sm font-bold transition ${tradeType === item.id ? "bg-white text-[#031c35] shadow-sm" : "text-blue-100 hover:bg-white/10"}`}>{item.label}</button>
              ))}
            </div>
            <div className="grid grid-cols-2 rounded-2xl bg-blue-50/70 p-1 text-sm font-semibold shadow-inner">
              {[{ id: "hscode", label: "HS / Product" }, { id: "industry", label: "Company" }].map((item) => (
                <button key={item.id} onClick={() => setSearchType(item.id)} className={`rounded-xl px-4 py-2 transition ${searchType === item.id ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-blue-700"}`}>{item.label}</button>
              ))}
            </div>
          </div>
          <div className="grid gap-3 xl:grid-cols-[minmax(150px,220px)_minmax(0,1fr)_auto_auto] xl:items-center">
            <select value={country} onChange={(event) => setCountry(event.target.value)} aria-label="Country" className="h-14 rounded-2xl border border-blue-100 bg-white px-4 text-sm font-bold text-[#003466] outline-none focus:ring-2 focus:ring-blue-400">
              <option value="">Global</option>
              {COUNTRIES.map((name) => <option key={name} value={name}>{name}</option>)}
            </select>
            <div ref={searchBoxRef} className="relative flex min-h-14 items-center gap-3 rounded-2xl border border-blue-100 bg-white px-4 shadow-sm focus-within:ring-2 focus-within:ring-blue-400">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 text-white"><Search size={18} /></span>
              <input value={query} onFocus={() => query.trim().length >= 2 && setSuggestionsOpen(true)} onChange={(event) => { setQuery(event.target.value); setSuggestionsOpen(true); setSearchError(""); }} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); startSearch(); } if (event.key === "Escape") setSuggestionsOpen(false); }} placeholder={searchType === "industry" ? "Search company, importer, or exporter" : "Search HS code, product ..."} className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-[#003466] outline-none placeholder:text-slate-400 sm:text-base" />
              {suggestionsOpen && query.trim().length >= 2 && (suggestions.length > 0 || suggestionsLoading) && (
                <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-50 overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-2xl">
                  {suggestionsLoading && suggestions.length === 0 ? <p className="px-4 py-3 text-sm text-slate-500">Loading suggestions…</p> : suggestions.map((item, index) => (
                    <button key={`${item}-${index}`} type="button" onClick={() => applySuggestion(item)} className="block w-full border-b border-blue-50 px-4 py-3 text-left text-sm font-semibold text-slate-700 last:border-0 hover:bg-blue-50">{item}</button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => setShowAdvance(true)} className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl border border-blue-100 bg-white px-5 text-sm font-bold text-blue-700 shadow-sm transition hover:bg-blue-50"><SlidersHorizontal size={17} />Advanced</button>
            <button onClick={() => startSearch()} className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-800 px-6 text-sm font-bold text-white shadow-lg shadow-blue-700/20 transition hover:scale-[1.02]"><Search size={17} />Search</button>
          </div>
          {searchError && <p role="alert" className="mt-3 text-sm font-semibold text-rose-700">{searchError}</p>}
        </div>
      </motion.div>

      {/* STATS BAR */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row flex-wrap justify-center gap-8 sm:gap-12 mt-10 sm:mt-14 mb-14"
      >
        <div className="w-full sm:w-64">
          <div className="flex justify-between text-sm sm:text-base mb-1">
            <span className="flex items-center gap-2">
              <Download size={18} className="text-blue-500" /> Downloads
            </span>
            <span>{downloadUsed} / {downloadTotal}</span>
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <motion.div
              className="h-2 bg-linear-to-r from-blue-400 to-blue-600 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${downloadPercent}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>

        <div className="w-full sm:w-64">
          <div className="flex justify-between text-sm sm:text-base mb-1">
            <span className="flex items-center gap-2">
              <Search size={18} className="text-blue-500" /> Searches
            </span>
            <span>{searchUsed} / {searchTotal}</span>
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <motion.div
              className="h-2 bg-linear-to-r from-blue-400 to-blue-600 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${searchPercent}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>
      </motion.div>

      {/* RECENT SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8  mx-auto">
        {/* Favorites */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="bg-white/85 backdrop-blur-lg border border-white/70 rounded-2xl shadow-lg overflow-hidden"
        >
          <div className="bg-linear-to-r from-[#003466] to-[#005b96] text-white px-6 py-4 flex justify-between items-center">
            <h3 className="text-base sm:text-lg font-semibold">Recent Favorites</h3>
            <User size={18} />
          </div>
          <div className="p-5 sm:p-6">
            {favorites.length === 0 ? (
              <p className="text-center py-6 sm:py-8 text-gray-400 text-sm sm:text-base">
                No Record Found
              </p>
            ) : (
              <table className="w-full text-sm text-gray-700">
                <tbody>
                  {favorites.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100">
                      <td className="py-3 font-semibold">{item.name}</td>
                      <td className="py-3 text-right text-gray-500">{item.startDate || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>

        {/* Downloads */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="bg-white/85 backdrop-blur-lg border border-white/70 rounded-2xl shadow-lg overflow-hidden"
        >
          <div className="bg-linear-to-r from-[#003466] to-[#005b96] text-white px-6 py-4 flex justify-between items-center">
            <h3 className="text-base sm:text-lg font-semibold">Recent Downloads</h3>
            <Download size={18} />
          </div>
          <div className="p-5 sm:p-6 overflow-x-auto">
            <table className="w-full min-w-[500px] text-sm sm:text-base text-gray-700">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3">Data Type</th>
                  <th className="text-left py-3">Date</th>
                  <th className="text-left py-3">Category</th>
                  <th className="text-left py-3">Records</th>
                </tr>
              </thead>
              <tbody>
                {downloads.map((d, i) => (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i }}
                    className="hover:bg-blue-50 border-b border-gray-100"
                  >
                    <td className="py-3">{d.dataType}</td>
                    <td className="py-3">{d.downloadDate}</td>
                    <td className="py-3">{d.category}</td>
                    <td className="py-3">{d.records}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* Legacy home advanced-search modal retained for reference.
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
                  <X size={22} className="text-gray-500 hover:text-blue-600 transition" />
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
      */}

      <AnimatePresence>
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
                  <button onClick={() => startSearch(true)} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-3 text-sm font-bold text-white shadow-lg"><Search size={16} />Search</button>
                </div>
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
