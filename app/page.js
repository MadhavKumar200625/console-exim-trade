"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  Download,
  Search,
  User,
  ArrowRight,
  X,
} from "lucide-react";

export default function Dashboard() {
  const [showAdvance, setShowAdvance] = useState(false);

  const favorites = [];
  const downloads = [
    {
      dataType: "Afghanistan Export Compiled Non Reporting Data",
      date: "31/10/2025",
      category: "Data",
      records: 9,
    },
  ];

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
        <div className="bg-linear-to-r from-white/90 to-white/70 backdrop-blur-xl border border-blue-100 rounded-2xl sm:rounded-full p-6 sm:p-5 shadow-lg">
          <div className="flex flex-col sm:flex-wrap sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-3">
            {/* Country Dropdown */}
            <select className="w-full sm:w-44 md:w-48 px-5 py-3 rounded-full border border-gray-200 bg-white/80 text-sm sm:text-base focus:ring-2 focus:ring-blue-400 transition-all">
              <option>Country</option>
              <option>India</option>
              <option>USA</option>
              <option>China</option>
            </select>

            {/* Data Type Dropdown */}
            <select className="w-full sm:w-44 md:w-48 px-5 py-3 rounded-full border border-gray-200 bg-white/80 text-sm sm:text-base focus:ring-2 focus:ring-blue-400 transition-all">
              <option>Select Data</option>
              <option>Export</option>
              <option>Import</option>
            </select>

            {/* Search Input */}
            <div className="flex items-center flex-1 w-full sm:min-w-[280px] border border-gray-200 rounded-full px-4 py-3 bg-white/80 focus-within:ring-2 focus-within:ring-blue-400 transition-all">
              <Search size={20} className="text-blue-500 mr-3" />
              <input
                type="text"
                placeholder="Search products or HS code..."
                className="flex-1 text-sm sm:text-base bg-transparent outline-none placeholder:text-gray-500"
              />
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3 justify-end">
              {/* Normal Search Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="flex justify-center items-center gap-2 text-white text-sm sm:text-base px-5 py-3 bg-linear-to-r from-blue-600 to-blue-800 rounded-full shadow-md hover:shadow-lg transition-all"
              >
                <Search size={18} /> Search
              </motion.button>

              {/* Advanced Search Button */}
              <motion.button
                onClick={() => setShowAdvance(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="flex justify-center items-center gap-2 text-blue-700 border border-blue-300 bg-white/70 text-sm sm:text-base px-5 py-3 rounded-full shadow-sm hover:bg-blue-50 transition-all"
              >
                Advanced Search <ArrowRight size={18} />
              </motion.button>
            </div>
          </div>
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
            <span>16 / 1000</span>
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <motion.div
              className="h-2 bg-linear-to-r from-blue-400 to-blue-600 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "16%" }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>

        <div className="w-full sm:w-64">
          <div className="flex justify-between text-sm sm:text-base mb-1">
            <span className="flex items-center gap-2">
              <Search size={18} className="text-blue-500" /> Searches
            </span>
            <span>10 / 1000</span>
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <motion.div
              className="h-2 bg-linear-to-r from-blue-400 to-blue-600 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "10%" }}
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
              <p>Data...</p>
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
                    <td className="py-3">{d.date}</td>
                    <td className="py-3">{d.category}</td>
                    <td className="py-3">{d.records}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
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
    </div>
  );
}