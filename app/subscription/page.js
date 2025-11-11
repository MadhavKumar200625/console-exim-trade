"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowUpDown, Globe2, Search } from "lucide-react";

export default function SubscriptionPage() {
  const [sortField, setSortField] = useState("country");
  const [sortOrder, setSortOrder] = useState("asc");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 5;

  // 🧠 Sample Data (Replace later with API)
  const subscriptions = [
    {
      id: 1,
      country: "India",
      direction: "Import",
      dataType: "Compiled",
      dataRef: "Port-Level Customs Data",
      coverage: "Full National Coverage",
      fromDate: "2025-01-01",
      toDate: "2025-03-31",
      pointsPerRecord: 2,
    },
    {
      id: 2,
      country: "United States",
      direction: "Export",
      dataType: "Bill of Lading",
      dataRef: "US Shipping Data",
      coverage: "All Major Ports",
      fromDate: "2025-02-01",
      toDate: "2025-04-30",
      pointsPerRecord: 3,
    },
    {
      id: 3,
      country: "China",
      direction: "Import",
      dataType: "Monthly Summary",
      dataRef: "Government Import Records",
      coverage: "Top 10 Ports",
      fromDate: "2025-03-01",
      toDate: "2025-06-30",
      pointsPerRecord: 1,
    },
    {
      id: 4,
      country: "Germany",
      direction: "Export",
      dataType: "Shipment Manifest",
      dataRef: "Logistics Manifest Data",
      coverage: "European Region",
      fromDate: "2025-04-01",
      toDate: "2025-07-31",
      pointsPerRecord: 2,
    },
    {
      id: 5,
      country: "UAE",
      direction: "Import",
      dataType: "Compiled",
      dataRef: "Dubai Customs Database",
      coverage: "All Emirates",
      fromDate: "2025-05-01",
      toDate: "2025-09-30",
      pointsPerRecord: 2,
    },
    {
      id: 6,
      country: "Brazil",
      direction: "Export",
      dataType: "Summary Trade Data",
      dataRef: "Brazil Ministry Trade",
      coverage: "National Level",
      fromDate: "2025-01-15",
      toDate: "2025-03-15",
      pointsPerRecord: 1,
    },
  ];

  // 🔍 Search + Sorting Logic
  const filteredData = useMemo(() => {
    const lowerSearch = search.toLowerCase();
    return subscriptions
      .filter((item) =>
        Object.values(item).some((val) =>
          String(val).toLowerCase().includes(lowerSearch)
        )
      )
      .sort((a, b) => {
        if (sortOrder === "asc") {
          return a[sortField] > b[sortField] ? 1 : -1;
        }
        return a[sortField] < b[sortField] ? 1 : -1;
      });
  }, [subscriptions, search, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredData.length / perPage);
  const visibleData = filteredData.slice((page - 1) * perPage, page * perPage);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-[#f5f9ff] to-[#eaf3ff] px-6 sm:px-10 py-10 text-[#003466] relative overflow-hidden">
      {/* Floating Gradient Blur */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-32 w-72 h-72 bg-blue-200/40 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-20 right-32 w-96 h-96 bg-blue-300/40 blur-[130px] rounded-full"></div>
      </div>

      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10"
      >
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">
          <span className="text-[#007bff]">My Subscriptions</span>
        </h1>
        <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
          View your active data subscriptions and their details.
        </p>
      </motion.div>

      {/* SEARCH BAR */}
      <div className=" mx-auto mb-6 flex justify-between items-center">
        <div className="relative w-full sm:w-72">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search subscriptions..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full bg-white/70 focus:ring-2 focus:ring-blue-400 outline-none text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto mx-auto bg-white/80 backdrop-blur-lg border border-white/70 rounded-2xl shadow-lg">
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="bg-linear-to-r from-[#003466] to-[#005b96] text-white text-xs uppercase">
            <tr>
              {[
                { key: "country", label: "Country Name" },
                { key: "direction", label: "Direction" },
                { key: "dataType", label: "Data Type" },
                { key: "dataRef", label: "Data Reference" },
                { key: "coverage", label: "Data Coverage" },
                { key: "fromDate", label: "From Date" },
                { key: "toDate", label: "To Date" },
                { key: "pointsPerRecord", label: "Download Points / Record" },
              ].map(({ key, label }) => (
                <th
                  key={key}
                  onClick={() => toggleSort(key)}
                  className="py-3 px-4 cursor-pointer hover:bg-blue-800/40 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span>{label}</span>
                    <ArrowUpDown
                      size={14}
                      className={`transition-transform ${
                        sortField === key
                          ? sortOrder === "asc"
                            ? "rotate-180 text-blue-300"
                            : "text-blue-300"
                          : "text-white/70"
                      }`}
                    />
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {visibleData.length > 0 ? (
              visibleData.map((s, i) => (
                <motion.tr
                  key={s.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="border-b border-gray-200 hover:bg-blue-50/60 transition"
                >
                  <td className="py-3 px-4 flex items-center gap-2">
                    <Globe2 size={14} className="text-blue-500" /> {s.country}
                  </td>
                  <td className="py-3 px-4">{s.direction}</td>
                  <td className="py-3 px-4">{s.dataType}</td>
                  <td className="py-3 px-4">{s.dataRef}</td>
                  <td className="py-3 px-4">{s.coverage}</td>
                  <td className="py-3 px-4">{s.fromDate}</td>
                  <td className="py-3 px-4">{s.toDate}</td>
                  <td className="py-3 px-4 font-semibold text-blue-700">
                    {s.pointsPerRecord}
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="8"
                  className="py-6 text-center text-gray-400 text-sm"
                >
                  No matching results found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-center items-center gap-4 mt-8">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          className={`px-4 py-2 rounded-full text-sm border ${
            page === 1
              ? "opacity-40 cursor-not-allowed"
              : "border-blue-300 text-blue-700 hover:bg-blue-50"
          }`}
        >
          Prev
        </button>

        <span className="text-sm font-medium">
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          className={`px-4 py-2 rounded-full text-sm border ${
            page === totalPages
              ? "opacity-40 cursor-not-allowed"
              : "border-blue-300 text-blue-700 hover:bg-blue-50"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}