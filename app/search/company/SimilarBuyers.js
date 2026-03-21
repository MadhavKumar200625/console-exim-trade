"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

const buyersData = [
  {
    name: "MENNICA POLSKA S A",
    country: "POLAND",
    shipments: 23,
    volume: 149166.9,
    value: 2534031.91,
  },
  {
    name: "PUCCINI SP ZOO",
    country: "POLAND",
    shipments: 2,
    volume: 960,
    value: 6047.99,
  },
  {
    name: "LOKAAH TREE BANAS SPOLKA JAWNA",
    country: "POLAND",
    shipments: 3,
    volume: 3064,
    value: 2512.82,
  },
  {
    name: "CALA STR LECHICKA",
    country: "POLAND",
    shipments: 1,
    volume: 600,
    value: 1663.41,
  },
  {
    name: "BELTIMORE OFFICIAL",
    country: "POLAND",
    shipments: 1,
    volume: 400,
    value: 1288.79,
  },
];

export default function SimilarBuyers() {
  const [search, setSearch] = useState("");

  const filtered = buyersData
    .filter((b) =>
      b.name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => b.value - a.value);

  const maxValue = Math.max(...filtered.map((b) => b.value));

  const topBuyers = filtered.slice(0, 3);
  const rest = filtered.slice(3);

  return (
    <section className="w-full px-6 py-10 space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-[#003466]">
          Similar Buyers
        </h3>

        <div className="flex items-center gap-2 bg-white/80 backdrop-blur border border-blue-100 px-3 py-2 rounded-xl shadow-sm">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search buyers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="outline-none text-sm bg-transparent"
          />
        </div>
      </div>

      {/* 🔥 TOP BUYERS (SOFT CARDS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {topBuyers.map((b, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -4 }}
            className="bg-white/70 backdrop-blur-xl border border-blue-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-400">
                  Top Buyer #{i + 1}
                </p>
                <h4 className="text-sm font-semibold text-[#003466] mt-1">
                  {b.name}
                </h4>
              </div>

              <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                {b.country}
              </div>
            </div>

            <div className="mt-4 space-y-1 text-sm text-gray-600">
              <p>Shipments: {b.shipments}</p>
              <p>Volume: {b.volume.toLocaleString()}</p>
            </div>

            <div className="mt-4 text-lg font-semibold text-[#003466]">
              ${b.value.toLocaleString()}
            </div>
          </motion.div>
        ))}
      </div>

      {/* 🔥 TABLE */}
      <div className="bg-white/70 backdrop-blur-xl border border-blue-100 rounded-2xl overflow-hidden shadow-sm">

        {/* HEADER */}
        <div className="grid grid-cols-12 px-6 py-3 text-sm font-medium text-[#003466] border-b border-blue-100 bg-blue-50/60">
          <div className="col-span-5">Company</div>
          <div className="col-span-2">Country</div>
          <div className="col-span-2">Shipments</div>
          <div className="col-span-1">Vol</div>
          <div className="col-span-2 text-right">Value</div>
        </div>

        {/* ROWS */}
        <div className="divide-y">

          {rest.map((b, i) => (
            <motion.div
              key={i}
              whileHover={{ backgroundColor: "#f5f9ff" }}
              className="grid grid-cols-12 px-6 py-4 items-center text-sm transition"
            >
              {/* COMPANY */}
              <div className="col-span-5">
                <p className="font-medium text-[#003466]">
                  {b.name}
                </p>

                {/* LIGHT VALUE BAR */}
                <div className="w-full h-1 bg-blue-50 mt-1 rounded">
                  <div
                    className="h-full bg-blue-400"
                    style={{
                      width: `${(b.value / maxValue) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* COUNTRY */}
              <div className="col-span-2 text-gray-500">
                {b.country}
              </div>

              {/* SHIPMENTS */}
              <div className="col-span-2 text-[#003466] font-medium">
                {b.shipments}
              </div>

              {/* VOLUME */}
              <div className="col-span-1 text-gray-500">
                {Math.round(b.volume / 1000)}k
              </div>

              {/* VALUE */}
              <div className="col-span-2 text-right font-semibold text-[#003466]">
                ${b.value.toLocaleString()}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}