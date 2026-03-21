"use client";

import { motion } from "framer-motion";

const data = [
  {
    hs: "42023190",
    desc: "BUFF HUNTER LEATHER COIN CASE",
    country: "India",
    unit: "Piece",
    qty: 100,
    value: 86.55,
  },
  {
    hs: "42023190",
    desc: "COW NAPPA FOIL LEATHER COIN CASE",
    country: "India",
    unit: "Nos",
    qty: 300,
    value: 294.74,
  },
  {
    hs: "42023190",
    desc: "GOAT OIL PULLUP LEATHER COIN CASE",
    country: "India",
    unit: "Piece",
    qty: 200,
    value: 161.4,
  },
];

export default function SmartTable() {
  const maxQty = Math.max(...data.map((d) => d.qty));

  return (
    <section className="w-full px-6 py-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold text-[#003466]">
            Transactional Analysis
          </h3>
          <p className="text-sm text-gray-500">
            Raw Trade Data
          </p>
        </div>

        <button className="bg-[#003466] text-white px-4 py-2 rounded-lg text-sm shadow hover:opacity-90">
          Raw Data
        </button>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg overflow-hidden border border-gray-100">

        {/* HEADER */}
        <div className="grid grid-cols-6 px-6 py-4 text-sm font-medium text-[#003466] bg-[#003466]/5 border-b">
          <span>HS Code</span>
          <span>Description</span>
          <span>Country</span>
          <span>Unit</span>
          <span>Quantity</span>
          <span>Value</span>
        </div>

        {/* ROWS */}
        <div className="divide-y">
          {data.map((row, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.01 }}
              className="grid grid-cols-6 px-6 py-4 items-center text-sm group hover:bg-blue-50/40 transition"
            >
              {/* HS */}
              <span className="font-medium text-[#003466]">
                {row.hs}
              </span>

              {/* DESC */}
              <span className="text-gray-600 truncate">
                {row.desc}
              </span>

              {/* COUNTRY */}
              <span className="text-gray-500">
                {row.country}
              </span>

              {/* UNIT */}
              <span className="text-gray-500">
                {row.unit}
              </span>

              {/* QUANTITY WITH BAR */}
              <div className="flex items-center gap-2">
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#003466]"
                    style={{
                      width: `${(row.qty / maxQty) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-xs text-gray-600 w-10">
                  {row.qty}
                </span>
              </div>

              {/* VALUE */}
              <span className="font-semibold text-[#003466]">
                ${row.value}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}