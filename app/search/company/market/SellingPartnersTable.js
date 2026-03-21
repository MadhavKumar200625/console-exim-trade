"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const data = [
  {
    name: "TRISTAR EXPORTS",
    country: "India",
    shipments: 66,
    volume: 19050,
    value: 19390,
  },
  {
    name: "SUNRISE EXPORTS",
    country: "India",
    shipments: 23,
    volume: 3330,
    value: 6187,
  },
  {
    name: "VEENU EXPORTS",
    country: "India",
    shipments: 23,
    volume: 2325,
    value: 20912,
  },
  {
    name: "VHIDES MERCHANDISE",
    country: "India",
    shipments: 18,
    volume: 795,
    value: 7747,
  },
  {
    name: "AMIN INTERNATIONAL LIMITED",
    country: "India",
    shipments: 7,
    volume: 760,
    value: 2912,
  },
];

export default function SellingPartnersTable() {
  const [search, setSearch] = useState("");

  const filtered = data.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  const maxVolume = Math.max(...data.map((d) => d.volume));
  const maxShipments = Math.max(...data.map((d) => d.shipments));

  return (
    <section className="w-full px-6 py-10">
      {/* HEADER */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-[#003466]">
          Selling Partners
        </h3>
        <p className="text-sm text-gray-500">
          Search Key: coin
        </p>
      </div>

      {/* TOP BAR */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-500">
          Showing {filtered.length} entries
        </div>

        <input
          placeholder="Search company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[#003466]/30"
        />
      </div>

      {/* TABLE */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg overflow-hidden border border-gray-100">

        {/* HEADER */}
        <div className="grid grid-cols-6 px-6 py-4 text-sm font-medium text-[#003466] bg-[#003466]/5 border-b">
          <span>Company</span>
          <span>Country</span>
          <span>Shipments</span>
          <span>Volume</span>
          <span>Value</span>
          <span></span>
        </div>

        {/* ROWS */}
        <div className="divide-y">
          {filtered.map((row, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.01 }}
              className="grid grid-cols-6 px-6 py-4 items-center text-sm hover:bg-blue-50/40 transition group"
            >
              {/* NAME */}
              <span className="font-medium text-[#003466]">
                {row.name}
              </span>

              {/* COUNTRY */}
              <span className="text-gray-500">
                {row.country}
              </span>

              {/* SHIPMENTS */}
              <div className="flex items-center gap-2">
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{
                      width: `${(row.shipments / maxShipments) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-xs text-gray-600 w-8">
                  {row.shipments}
                </span>
              </div>

              {/* VOLUME */}
              <div className="flex items-center gap-2">
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#003466]"
                    style={{
                      width: `${(row.volume / maxVolume) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-xs text-gray-600 w-12">
                  {row.volume.toLocaleString()}
                </span>
              </div>

              {/* VALUE */}
              <span className="font-semibold text-[#003466]">
                ${row.value.toLocaleString()}
              </span>

              {/* ACTION */}
              <button className="text-xs text-[#003466] opacity-0 group-hover:opacity-100 transition">
                View →
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}